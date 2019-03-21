import {Token} from './Token';
import {Location} from './Location';
import {ScanError} from './ScanError';
import ExpRex, {ExpressionMatch, MatchState, TokenMatch} from './exprex/ExpRex';

import Rex from '@sagebrush/rex';

const whitespace = new Set([' ', '\t', '\r', '\n']);

export interface Expression {
    name: string,
    groups: Array<ExpRex>
}

interface PrettyResult {
    isCompleteMatch: boolean;
    expected: MatchState['result']['expected'];
    matchedTokens: number;
    type: Expression['name'];
    location: Location;

    [key: string]: any;
}
function prettyResult(result: { expression: Expression, match: MatchState['result'] }): PrettyResult {
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
    private tokenDefinitions: Array<{name: string, test: Rex}> = [
        { name: 'LineComment', test: new Rex('^//[^\\r\\n]*') },
        { name: 'BlockComment', test: new Rex('^/\\*.*?\\*/') },
        { name: 'TokenDefinition', test: new Rex('^#token\\s+(?<name>[A-Z_]+)\\s+(?<value>[^\\r\\n]+)') },
        { name: 'ExpressionDefinition', test: new Rex('^#expr\\s+(?<name>[a-zA-Z_]+)\\s*=\\s*(?<subexpr>[^\\r\\n]+)') },
    ];
    public scanErrors: ScanError[] = [];
    public tokens: Token[] = [];
    public expressions: Map<string, Expression> = new Map;

    private cursor = {
        index: 0,
        line: 1,
        column: 1
    };

    constructor(private source: string) {}

    updateCursor(str: string) {
        this.cursor.index += str.length;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (char === '\n') {
                this.cursor.line++;
                this.cursor.column = 1;
            } else {
                this.cursor.column++;
            }
        }
    }

    scan() {
        while (this.cursor.index < this.source.length) {
            // consume white space
            let char = this.source[this.cursor.index];
            if (whitespace.has(char)) {
                this.updateCursor(char);
            } else {
                this.scanToken();
            }
        }
    }

    private scanToken() {
        let token: Token | undefined;
        let bestTokenLength = -Infinity;

        const locationStart = {line: this.cursor.line, column: this.cursor.column};
        for (let i = 0; i < this.tokenDefinitions.length; i++) {
            const tokenDefinition = this.tokenDefinitions[i];
            const match = tokenDefinition.test.match(this.source, this.cursor.index);
            if (match !== undefined) {
                if (match.text.length > bestTokenLength) {
                    bestTokenLength = match.text.length;
                    token = new Token(
                        tokenDefinition.name,
                        match.text,
                        match.captures,
                        {
                            start: locationStart,
                            end: locationStart, // placeholder value, is overridden after the cursor is updated below
                        }
                    );
                }
            }
        }

        if (token) {
            this.updateCursor(token.lexeme);

            token.location.end = {line: this.cursor.line, column: this.cursor.column};

            if (token.type === 'TokenDefinition') {
                this.tokenDefinitions.push({
                    name: token.values.name,
                    test: new Rex('^' + token.values.value),
                });
            } else if (token.type === 'ExpressionDefinition') {
                const {name, subexpr} = token.values;

                let expression = this.expressions.get(name);
                if (expression === undefined) {
                    expression = {name, groups: []};
                    this.expressions.set(name, expression);
                }

                expression.groups.push(new ExpRex(subexpr, this.expressions));
            } else if (token.type === 'LineComment' || token.type === 'BlockComment') {
                // don't track comments
            } else {
                this.tokens.push(token);
            }
        } else {
            const char = this.source[this.cursor.index];
            this.scanErrors.push(new ScanError(
                this.cursor.line,
                this.cursor.column,
                `Unexpected character "${char}"`
            ));
            this.updateCursor(char);
        }
    }

    parse(): ReturnType<typeof prettyResult> {
        const expressionEntries = this.expressions.values();

        let bestMatch: { expression: Expression, match: MatchState['result'] } | undefined = undefined;

        let entry = expressionEntries.next();
        while (!entry.done) {
            const expression = entry.value;

            for (let i = 0; i < expression.groups.length; i++) {
                const group = expression.groups[i];
                const match = group.match(this.tokens, 0);

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