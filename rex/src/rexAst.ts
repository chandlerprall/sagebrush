import {Matcher, DigitMatcher, WhitespaceMatcher, WordMatcher, NegatedMatcher} from './Rex';

export function unicodeRead(string: string, cursor: number) {
    let char: string | undefined;

    if (cursor < string.length) {
        char = string[cursor];
        const charCode = char.charCodeAt(0);

        if (charCode >= 0x0D00 && charCode <= 0xDBFF) {
            // might be a two-character unicode
            if (cursor + 1 < string.length) {
                const peekChar = string[cursor + 1];
                const peekCharCode = peekChar.charCodeAt(0);

                if (peekCharCode >= 0xDC00 && peekCharCode <= 0xDFFF) {
                    char += peekChar;
                }
            }
        }
    }

    return char;
}

export const MATCH_TYPE_NORMAL = Symbol('MATCH_TYPE_NORMAL');
export const MATCH_TYPE_ZERO_OR_ONE = Symbol('MATCH_TYPE_ZERO_OR_ONE');
export const MATCH_TYPE_ZERO_OR_MORE = Symbol('MATCH_TYPE_ZERO_OR_MORE');
export const MATCH_TYPE_ONE_OR_MORE = Symbol('MATCH_TYPE_ONE_OR_MORE');
export type MATCH_TYPE =
    typeof MATCH_TYPE_NORMAL |
    typeof MATCH_TYPE_ZERO_OR_ONE |
    typeof MATCH_TYPE_ZERO_OR_MORE |
    typeof MATCH_TYPE_ONE_OR_MORE;

class RexNode {
    matchType: MATCH_TYPE = MATCH_TYPE_NORMAL;
    isNonGreedy: boolean = false;

    setMatchType(matchType: MATCH_TYPE) {
        this.matchType = matchType;
    }

    getMatchType() {
        return this.matchType;
    }
}

export class RexMatchAny extends RexNode {}

export class RexChar extends RexNode {
    constructor(public char: string) {
        super();
    }
}

export class RexCharacterSet extends RexNode {
    constructor(public isNegated: boolean, public chars: string[], public ranges: Array<[string, string]>, public matchers: Matcher[]) {
        super();
    }
}

export class RexWhitespace extends RexNode {}
export class RexNotWhitespace extends RexNode {}
export class RexDigit extends RexNode {}
export class RexNotDigit extends RexNode {}
export class RexWord extends RexNode {}
export class RexNotWord extends RexNode {}

export class RexGroup extends RexNode {
    constructor(public members: RexAstNode[], public captureNames: string[] = []) {
        super();
    }
}

export class RexOr extends RexNode {
    constructor(public left: RexAstNode[], public right: RexAstNode[]) {
        super();
    }
}

export type RexAstNode =
    RexMatchAny |
    RexChar |
    RexCharacterSet |
    RexWhitespace |
    RexNotWhitespace |
    RexDigit |
    RexNotDigit |
    RexWord |
    RexNotWord |
    RexGroup |
    RexOr;

export function parseRexAst(regex: string, captureGroups: string[] = []): RexAstNode[] {
    if (regex.length === 0) throw new Error('Cannot parse empty regular expression');
    
    const members: RexNode[] = [];

    for (let i = 0; i < regex.length; i++) {
        let member: RexNode;

        const char = unicodeRead(regex, i)!;
        i += char.length - 1;

        if (char === '\\') {
            const escapedChar = regex[++i];

            if (escapedChar === undefined) {
                throw new Error('Illegal escape sequence');
            } else if (escapedChar === 's') {
                member = new RexWhitespace();
            } else if (escapedChar === 'S') {
                member = new RexNotWhitespace();
            } else if (escapedChar === 'd') {
                member = new RexDigit();
            } else if (escapedChar === 'D') {
                member = new RexNotDigit();
            } else if (escapedChar === 'w') {
                member = new RexWord();
            } else if (escapedChar === 'W') {
                member = new RexNotWord();
            } else if (escapedChar === 't') {
                member = new RexChar('\t');
            } else if (escapedChar === 'n') {
                member = new RexChar('\n');
            } else if (escapedChar === 'r') {
                member = new RexChar('\r');
            } else {
                member = new RexChar(escapedChar);
            }
        } else if (char === '.') {
            member = new RexMatchAny();
        } else if (char === '|') {
            // upgrade this member to an OR group
            // all members seen so far belong to the left side
            // all future members belong to the right

            // transfer existing members into a `left` array
            const left = [...members];

            // right side members are the rest of this regex
            const right: RexAstNode[] = parseRexAst(regex.slice(i + 1), captureGroups);
            member = new RexOr(left, right);

            // we processed this whole regex, take control
            members.length = 0;
            members.push(member);
            break;
        } else if (char === '(') {
            let internalParenthesesGroupCount = 0;

            let captureName: string | undefined = undefined;
            let groupSequence = '';
            let validSequence = false;

            const peek = regex[i + 1];
            if (peek === '?') {
                // this is a capture group
                if (regex[i + 2] !== '<') throw new Error('Invalid capture group name');

                i += 3;
                // scan until end of name
                for (i; i < regex.length; i++) {
                    const char = regex[i];
                    if (char === '>') {
                        // end of capture name
                        break;
                    }

                    // validate character then append it to the capture name
                    if (char.match(/[a-zA-Z0-9_]/) == null) throw new Error('Invalid capture group name');
                    if (captureName === undefined) {
                        captureName = char;
                    } else {
                        captureName += char;
                    }
                }
            }


            for (i = i + 1; i < regex.length; i++) {
                const char = unicodeRead(regex, i)!;
                i += char.length - 1;

                if (char === ')' && internalParenthesesGroupCount === 0) {
                    validSequence = true;
                    break;
                } else {
                    if (char === '(') internalParenthesesGroupCount++;
                    if (char === ')') internalParenthesesGroupCount--;
                    groupSequence += char;
                }
            }

            if (validSequence === false) {
                throw new Error('Unbalanced parentheses');
            }

            const cgroups = [...captureGroups];
            if (captureName !== undefined) {
                cgroups.push(captureName);
            }
            member = new RexGroup(parseRexAst(groupSequence, cgroups), cgroups);
        } else if (char === ')') {
            throw new Error('Unexpected token ")"')
        } else if (char === '[') {
            let isNegated = false;
            let chars: string[] = [];
            let ranges: Array<[string, string]> = [];
            let matchers: Matcher[] = [];

            const firstCharacterIndex = i + 1;

            let isValidSet = false;
            for (i = firstCharacterIndex; i < regex.length; i++) {
                const char = unicodeRead(regex, i)!;
                i += char.length - 1;

                if (char === ']') {
                    isValidSet = true;
                    break;
                } else if (char === '^' && i === firstCharacterIndex) {
                    isNegated = true;
                } else if (regex[i+1] === '-' && regex.length > i+2) {
                    const secondChar = unicodeRead(regex, i + 2)!;
                    ranges.push([char, secondChar]);
                    i += 1 + secondChar.length;
                } else if (char === '\\') {
                    const escapedChar = regex[++i];

                    if (escapedChar === 'd') {
                        matchers.push(new DigitMatcher());
                    } else if (escapedChar === 'D') {
                        matchers.push(new NegatedMatcher(new DigitMatcher()));
                    } else if (escapedChar === 's') {
                        matchers.push(new WhitespaceMatcher());
                    } else if (escapedChar === 'S') {
                        matchers.push(new NegatedMatcher(new WhitespaceMatcher()));
                    } else if (escapedChar === 'w') {
                        matchers.push(new WordMatcher());
                    } else if (escapedChar === 'W') {
                        matchers.push(new NegatedMatcher(new WordMatcher()));
                    } else if (escapedChar === 'n') {
                        chars.push('\n');
                    } else if (escapedChar === 'r') {
                        chars.push('\r');
                    } else if (escapedChar === 't') {
                        chars.push('\t');
                    } else {
                        chars.push(escapedChar);
                    }
                } else {
                    chars.push(char);
                }
            }

            if (isValidSet === false) {
                throw new Error('Invalid character set');
            }

            member = new RexCharacterSet(isNegated, chars, ranges, matchers);
        } else {
            member = new RexChar(char);
        }

        const peek = regex[i + 1];
        if (peek === '*') {
            i++;
            member.setMatchType(MATCH_TYPE_ZERO_OR_MORE);
        } else if (peek === '+') {
            i++;
            member.setMatchType(MATCH_TYPE_ONE_OR_MORE);
        } else if (peek === '?') {
            i++;
            member.setMatchType(MATCH_TYPE_ZERO_OR_ONE);
        }

        if (member.getMatchType() !== MATCH_TYPE_NORMAL) {
            const peek = regex[i + 1];
            if (peek === '?') {
                i++;
                member.isNonGreedy = true;
            }
        }
        
        members.push(member);
    }
    
    return members;
}
