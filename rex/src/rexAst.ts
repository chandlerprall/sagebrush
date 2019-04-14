import {Matcher, DigitMatcher, WhitespaceMatcher, WordMatcher, NegatedMatcher} from './Rex';

const hexCharacters = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F']);
function readUnicodeEscapeSequence(input: string, cursor: number) {
    if (input[cursor++] !== '{') throw new Error('Invalid unicode escape sequence');

    let hex = '';

    for (let i = cursor; i < input.length; i++) {
        const char = input[i];

        if (char === '}') break;

        if (hexCharacters.has(char) === false) throw new Error('Invalid unicode escape sequence');

        hex += char;
    }

    if (hex.length === 0) throw new Error('Invalid unicode escape sequence');

    return hex;
}

const digitChars = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
function readRepetitionSequence(input: string, cursor: number) {
    let _min = '';
    let _max = '';

    let min = Infinity;
    let max = -Infinity;

    let isNonGreedy = false;

    if (input[cursor] !== '{') throw new Error('Invalid repetition sequence');

    let readingMin = true;
    let consumedChars = 1;

    for (let i = cursor + 1; i < input.length; i++) {
        consumedChars++;
        const char = input[i];

        if (char === ',') {
            if (_min.length === 0) throw new Error('Invalid repetition sequence');
            readingMin = false;
        } else if (char === '}') {
            if (readingMin === true) {
                max = min = parseInt(_min, 10);
            } else {
                min = parseInt(_min, 10);
                max = _max.length > 0 ? parseInt(_max, 10) : Infinity;
            }
            break;
        } else {
            if (digitChars.has(char) === false) throw new Error('Invalid repetition sequence');

            if (readingMin) {
                _min += char;
            } else {
                _max += char;
            }
        }
    }

    if (input[cursor + consumedChars] === '?') {
        isNonGreedy = true;
        consumedChars++;
    }

    return { min, max, consumedChars, isNonGreedy };
}

export function unicodeRead(string: string, cursor: number) {
    let char: string | undefined;

    if (cursor < string.length) {
        char = string[cursor];

        // read one or more bytes to resolve unicode characters
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

export class RexNode {
    matchType: MATCH_TYPE = MATCH_TYPE_NORMAL;
    isNonGreedy: boolean = false;

    setMatchType(matchType: MATCH_TYPE) {
        this.matchType = matchType;
    }

    getMatchType() {
        return this.matchType;
    }

    clone(): RexNode {
        throw new Error('Class extends RexNode but does not override the clone method');
    }
}

export class RexMatchAny extends RexNode {
    clone() {
        return new RexMatchAny();
    }
}
export class RexEnd extends RexNode {
    clone() {
        return new RexEnd();
    }
}

export class RexChar extends RexNode {
    constructor(public char: string) {
        super();
    }

    clone() {
        return new RexChar(this.char);
    }
}

export class RexCharacterSet extends RexNode {
    constructor(public isNegated: boolean, public chars: string[], public ranges: Array<[string, string]>, public matchers: Matcher[]) {
        super();
    }

    clone() {
        return new RexCharacterSet(this.isNegated, this.chars, this.ranges, this.matchers);
    }
}

export class RexWhitespace extends RexNode {
    clone() {
        return new RexWhitespace();
    }
}
export class RexNotWhitespace extends RexNode {
    clone() {
        return new RexNotWhitespace();
    }
}
export class RexDigit extends RexNode {
    clone() {
        return new RexDigit();
    }
}
export class RexNotDigit extends RexNode {
    clone() {
        return new RexNotDigit();
    }
}
export class RexWord extends RexNode {
    clone() {
        return new RexWord();
    }
}
export class RexNotWord extends RexNode {
    clone() {
        return new RexNotWord();
    }
}

export enum GroupType {
    NORMAL = 'NORMAL',
    LOOKAHEAD = 'LOOKAHEAD',
}

export class RexGroup extends RexNode {
    constructor(public members: RexAstNode[], public captureNames: string[], public type: GroupType) {
        super();
    }

    clone() {
        return new RexGroup(this.members, this.captureNames, this.type);
    }
}

export class RexOr extends RexNode {
    constructor(public left: RexAstNode[], public right: RexAstNode[]) {
        super();
    }

    clone() {
        return new RexOr(this.left, this.right);
    }
}

export type RexAstNode =
    RexMatchAny |
    RexEnd |
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

    // prepare escape sequences
    let _regex = '';
    for (let i = 0; i < regex.length;) {
        let char = unicodeRead(regex, i)!;

        if (char === '\\') {
            if (regex[i+1] === 'u') {
                // parse unicode escape sequence
                const hex = readUnicodeEscapeSequence(regex, i + 2);
                char = String.fromCodePoint(parseInt(hex, 16));
                i += hex.length + 2;
            } else {
                const escapedChar = unicodeRead(regex, i + 1);
                if (escapedChar === undefined) throw new Error('Illegal escape sequence');
                char += escapedChar;
            }
        }

        _regex += char;
        i += char.length;
    }
    regex = _regex;
    
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
        } else if (char === '$') {
            member = new RexEnd();
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
            let groupType = GroupType.NORMAL;

            const peek = regex[i + 1];
            if (peek === '?') {
                const peekAgain = regex[i + 2];

                if (peekAgain === '<') {
                    i += 3;
                    // this is a capture group
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
                } else if (peekAgain === '=') {
                    i += 2;
                    groupType = GroupType.LOOKAHEAD;
                } else {
                    throw new Error(`Invalid group modifier "${peekAgain}"`);
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
            member = new RexGroup(parseRexAst(groupSequence, cgroups), cgroups, groupType);
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
                    } else if (escapedChar === 't') {
                        chars.push('\t');
                    } else if (escapedChar === 'n') {
                        chars.push('\n');
                    } else if (escapedChar === 'r') {
                        chars.push('\r');
                    } else {
                        chars.push(escapedChar);
                    }
                } else if (char === '^' && i === firstCharacterIndex) {
                    isNegated = true;
                } else if (regex[i+1] === '-' && regex[i+2] !== ']') {
                    const secondChar = unicodeRead(regex, i + 2)!;
                    ranges.push([char, secondChar]);
                    i += 1 + secondChar.length;
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

        if (peek === '{') {
            const {min, max, consumedChars, isNonGreedy} = readRepetitionSequence(regex, i + 1);

            // add member as required the minimum number of times
            for (let i = 0; i < min; i++) {
                members.push(member);
            }

            if (max === Infinity) {
                // unbounded
                const unboundedMember = member.clone();
                unboundedMember.setMatchType(MATCH_TYPE_ZERO_OR_MORE);
                unboundedMember.isNonGreedy = isNonGreedy;
                members.push(unboundedMember);
            } else {
                const optional = max - min;

                if (optional > 0) {
                    let subgroup = new RexGroup([member.clone()], [], GroupType.NORMAL);
                    subgroup.setMatchType(MATCH_TYPE_ZERO_OR_ONE);
                    subgroup.isNonGreedy = isNonGreedy;

                    for (let i = 0; i < optional - 1; i++) {
                        subgroup = new RexGroup([member.clone(), subgroup], [], GroupType.NORMAL);
                        subgroup.setMatchType(MATCH_TYPE_ZERO_OR_ONE);
                        subgroup.isNonGreedy = isNonGreedy;
                    }

                    members.push(subgroup);
                }
            }

            i += consumedChars;
        } else {
            members.push(member);
        }
    }
    
    return members;
}
