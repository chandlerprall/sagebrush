import {Token} from './Token';
import {Location} from './Location';
import {ScanError} from './ScanError';
import ExpRex, {ExpressionMatch, MatchState, TokenMap, TokenMatch} from './exprex/ExpRex';

import Rex from '@sagebrush/rex';

const whitespace = new Set([' ', '\t', '\r', '\n']);

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
export function prettyResult(result: { expression: Expression, match: MatchState['result'] }): PrettyResult {
    const captures: {[key: string]: Array<any>} = {};

    const captureKeys = Object.keys(result.match.captures);
    for (let i = 0; i < captureKeys.length; i++) {
        const key = captureKeys[i];
        const values = result.match.captures[key];

        captures[key] = values.map(value => {
            if (value.hasOwnProperty('expression')) {
                return prettyResult((value as ExpressionMatch));
            } else {
                return (value as TokenMatch).token;
            }
        });
    }

    return {
        isCompleteMatch: result.match.isCompleteMatch,
        expected: result.match.expected,
        matchedTokens: result.match.tokens.length,
        type: result.expression.name,
        location: {
            start: result.match.tokens[0].location!.start,
            end: result.match.tokens[result.match.tokens.length - 1].location!.end,
        },
        ...captures
    };
}

export default class Parser {
    private tokenMap: TokenMap = new Map();
    public tokens: Token[] = [];
    public expressionMap: Map<string, Expression> = new Map;

    constructor(private source: string) {
        source = source.replace(
            /\/\/[^\r\n]*/gm,
            () => {
                return '';
            }
        );

        source = source.replace(
            /\/\*(.*?)\*\//gm,
            comment => {
                return comment.replace(/[^\n]/g, '');
            }
        );

        source = source.replace(
            /^[\t ]*#token\s+([A-Z_]+)\s+(.+?)([\r\n]+)/gm,
            (string, name, value, lineend) => {
                this.tokenMap.set(name, new Rex('^' + value));
                return lineend;
            }
        );

        source = source.replace(
            /^[\t ]*#expr\s+([a-zA-Z_]+)\s*=\s*(.+?)([\r\n]+)/gm,
            (string, name, subexpr, lineend) => {
                const expression = new ExpRex(subexpr, this.tokenMap, this.expressionMap);

                if (this.expressionMap.has(name)) {
                    this.expressionMap.get(name)!.groups.push(expression);
                } else {
                    this.expressionMap.set(name, {
                        name,
                        groups: [expression]
                    });
                }

                return lineend;
            }
        );

        this.source = source;
    }

    parse(): ReturnType<typeof prettyResult> {
        const expressionEntries = this.expressionMap.values();

        let bestMatch: { expression: Expression, match: MatchState['result'] } | undefined = undefined;

        let entry = expressionEntries.next();

        while (!entry.done) {
            const expression = entry.value;

            for (let i = 0; i < expression.groups.length; i++) {
                const group = expression.groups[i];
                const match = group.match(this.source, 0);

                if (match !== undefined) {
                    if (bestMatch === undefined || match.tokens.length > bestMatch.match.tokens.length) {
                        bestMatch = { expression, match };
                    }
                }
            }

            entry = expressionEntries.next();
        }

        if (bestMatch) return prettyResult(bestMatch);

        throw new Error(`Could not parse input: no matching expression`);
    }
}