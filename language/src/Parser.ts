import {Token} from './Token';
import {Location, Index} from './Location';
import ExpRex, {ExpressionMatch, Match, MatchState, TokenMap, TokenMatch} from './exprex/ExpRex';

import Rex from '@sagebrush/rex';

export interface Expression {
    name: string,
    groups: Array<ExpRex>
}

export interface PrettyResult {
    isCompleteMatch: boolean;
    expected: MatchState['result']['expected'];
    matchedTokens: number;
    type: Expression['name'];
    location: Location;

    [key: string]: any;
}

function prettyCaptures(input: MatchState['result']['captures']) {
    const captures: {[key: string]: Array<any>} = {};

    const captureKeys = Object.keys(input);
    for (let i = 0; i < captureKeys.length; i++) {
        const key = captureKeys[i];
        const values = input[key];

        captures[key] = values.map(value => {
            if (value.hasOwnProperty('expression')) {
                return prettyResult((value as ExpressionMatch));
            } else {
                const tokenCaptures: {[key: string]: string} = {};
                const { values, type, lexeme, location } = (value as TokenMatch).token;

                const valueNames = Object.keys(values);
                for (let i = 0; i < valueNames.length; i++) {
                    const valueName = valueNames[i];
                    tokenCaptures[valueName] = values[valueName];
                }

                return {
                    type,
                    lexeme,
                    location,
                    ...tokenCaptures
                };
            }
        });
    }

    return captures;
}

export function prettyResult(result: { expression: Expression, match: MatchState['result'] }): PrettyResult {
    if (result.match.promotedMatch.length > 0) {
        const promotedMatch = result.match.promotedMatch[0];
        if (promotedMatch.hasOwnProperty('expression')) {
            return prettyResult(promotedMatch as ExpressionMatch);
        } else {
            return prettyCaptures({
                token: [promotedMatch as TokenMatch]
            }).token[0];
        }
    }

    return {
        isCompleteMatch: result.match.isCompleteMatch,
        expected: result.match.expected,
        matchedTokens: result.match.tokens.length,
        type: result.expression.name,
        // @ts-ignore-next-line
        location: result.match.location ? result.match.location : { start: { index: 0 }, end: { index: 0 } },
        ...prettyCaptures(result.match.captures)
    };
}

function locate<T extends { expression: Expression, match: MatchState['result'] }>(result: T, source: string): T {
    function findLocations(match: MatchState['result'], locations: { index: number }[] = []) {
        if (match.tokens.length === 0) return locations;

        const start = { index: (match.tokens[0].location.start as Index).index };
        const end = { index: (match.tokens[match.tokens.length - 1].location.end as Index).index };

        // @ts-ignore-next-line
        match.location = { start, end };
        locations.push(start);

        const captureKeys = Object.keys(match.captures);

        for (let i = 0; i < captureKeys.length; i++) {
            const captureKey = captureKeys[i];
            const captures = match.captures[captureKey];

            for (let j = 0; j < captures.length; j++) {
                const match = captures[j];

                if (match.hasOwnProperty('expression')) {
                    findLocations((match as ExpressionMatch).match, locations);
                } else {
                    locations.push((match as TokenMatch).token.location.start as Index);
                    locations.push((match as TokenMatch).token.location.end as Index);
                }
            }
        }

        locations.push(end);


        return locations;
    }

    let cursor = 0;
    let line = 1;
    let column = 1;

    const locations = findLocations(result.match, [...result.match.expected]);
    locations.sort((a, b) => {
        if (a.index < b.index) return -1;
        if (a.index > b.index) return 1;
        return 0;
    });

    while (locations.length > 0) {
        const location = locations.shift() as Index;

        while (cursor < location.index) {
            const char = source[cursor++];

            if (char === '\n') {
                line++;
                column = 1;
            } else {
                column++;
            }
        }

        // @ts-ignore-next-line
        location.line = line;
        // @ts-ignore-next-line
        location.column = column;
    }
    return result;
}

export default class Parser {
    private tokenMap: TokenMap = new Map();
    public tokens: Token[] = [];
    public expressionMap: Map<string, Expression> = new Map;

    constructor(private source: string) {
        this.tokenMap.set('LINE_COMMENT', new Rex('^//(?<comment>[^\r\n]+)'));
        this.tokenMap.set('BLOCK_COMMENT', new Rex('^/\\*(?<comment>.*?)\\*/'));
        this.expressionMap.set(
            'Comment',
            {
                name: 'Comment',
                groups: [
                    new ExpRex('(?<comment>LINE_COMMENT | BLOCK_COMMENT)', this.tokenMap, this.expressionMap),
                ],
            }
        );

        source = source.replace(
            /^[\t ]*#token\s+([A-Z_]+)\s+(.+?)([\r\n]+)/gm,
            (match, name, value, lineend) => {
                this.tokenMap.set(name, new Rex('^' + value));
                return match.replace(/[^\r\n]/g, ' ');
            }
        );

        source = source.replace(
            /^[\t ]*#expr\s+([a-zA-Z_]+)\s*=\s*(.+?)([\r\n]+)/gm,
            (match, name, subexpr, lineend) => {
                const expression = new ExpRex(`(?<comments>Comment)* ${subexpr}`, this.tokenMap, this.expressionMap);

                if (this.expressionMap.has(name)) {
                    this.expressionMap.get(name)!.groups.push(expression);
                } else {
                    this.expressionMap.set(name, {
                        name,
                        groups: [expression]
                    });
                }

                return match.replace(/[^\r\n]/g, ' ');
            }
        );

        this.source = source;
    }

    parse(): ReturnType<typeof prettyResult> {
        let bestMatch: { expression: Expression, match: MatchState['result'] } | undefined = undefined;

        const expression = this.expressionMap.get('Program')!;

        for (let i = 0; i < expression.groups.length; i++) {
            const group = expression.groups[i];
            const match = group.match(this.source, expression.name);

            if (match !== undefined) {
                if (bestMatch === undefined || match.tokens.length > bestMatch.match.tokens.length) {
                    bestMatch = { expression, match };
                }
            }
        }

        if (bestMatch) return prettyResult(locate(bestMatch, this.source));

        throw new Error(`Could not parse input: no matching expression`);
    }
}