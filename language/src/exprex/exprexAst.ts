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

export abstract class ExpRexNode {
    matchType: MATCH_TYPE = MATCH_TYPE_NORMAL;
    isNonGreedy: boolean = false;

    setMatchType(matchType: MATCH_TYPE) {
        this.matchType = matchType;
    }

    getMatchType() {
        return this.matchType;
    }
}

export class ExpRexIdentifier extends ExpRexNode {
    constructor(public identifier: string) {
        super();
    }
}

export class ExpRexGroup extends ExpRexNode {
    constructor(public members: ExpRexNode[], public captureNames: CaptureGroup[] = []) {
        super();
    }
}

export class ExpRexOr extends ExpRexNode {
    constructor(public left: ExpRexNode[], public right: ExpRexNode[]) {
        super();
    }
}

export class CaptureGroup {
    constructor(public name: string, public isCapturePromoted: boolean) {}
}

export function parseExpRexAst(regex: string, captureGroups: CaptureGroup[] = []): ExpRexNode[] {
    if (regex.trim().length === 0) throw new Error('Cannot parse empty regular expression');
    
    const members: ExpRexNode[] = [];

    let currentIdentifierName = '';

    for (let i = 0; i < regex.length; i++) {
        let char = unicodeRead(regex, i)!;
        i += char.length - 1;

        const isUpperCaseChar = char >= 'A' && char <= 'Z';
        const isLowerCaseChar = char >= 'a' && char <= 'z';
        const isSpecialChar = char === '_';

        if (isUpperCaseChar || isLowerCaseChar || isSpecialChar) {
            currentIdentifierName += char;
        } else {
            let member: ExpRexNode | undefined = undefined;

            if (currentIdentifierName.length > 0) {
                member = new ExpRexIdentifier(currentIdentifierName);
                currentIdentifierName = '';

                let charModifiedMember = false;

                if (char === '*') {
                    member.setMatchType(MATCH_TYPE_ZERO_OR_MORE);
                    charModifiedMember = true;
                } else if (char === '+') {
                    member.setMatchType(MATCH_TYPE_ONE_OR_MORE);
                    charModifiedMember = true;
                } else if (char === '?') {
                    member.setMatchType(MATCH_TYPE_ZERO_OR_ONE);
                    charModifiedMember = true;
                }

                if (member.getMatchType() !== MATCH_TYPE_NORMAL) {
                    const peek = regex[i + 1];
                    if (peek === '?') {
                        i++;
                        member.isNonGreedy = true;
                    }
                }

                members.push(member);
                member = undefined;

                if (charModifiedMember) {
                    // character modified the member, continue to the next char
                    continue;
                }
            }

            if (char === ' ' || char === '\t') {
                // ignore whitespace, it is an identifier separator
            } else if (char === '|') {
                // upgrade this member to an OR group
                // all members seen so far belong to the left side
                // all future members belong to the right

                // transfer existing members into a `left` array
                const left = [...members];

                // right side members are the rest of this regex
                const right: ExpRexNode[] = parseExpRexAst(regex.slice(i + 1), captureGroups);
                member = new ExpRexOr(left, right);

                // we processed this whole regex, take control
                members.length = 0;
                members.push(member);
                break;
            } else if (char === '(') {
                let internalParenthesesGroupCount = 0;

                let captureName: string | undefined = undefined;
                let groupSequence = '';
                let validSequence = false;
                let isCapturePromoted = false;

                const peek = regex[i + 1];
                if (peek === '?') {
                    // this is a capture group
                    if (regex[i + 2] !== '<') throw new Error('Invalid capture group name');

                    i += 3;

                    if (regex[i] === '@') {
                        isCapturePromoted = true;
                        i++;
                    }

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
                    cgroups.push(new CaptureGroup(captureName, isCapturePromoted));
                }
                member = new ExpRexGroup(parseExpRexAst(groupSequence, cgroups), cgroups);
            } else if (char === ')') {
                throw new Error('Unexpected token ")"')
            } else {
                throw new Error(`Unexpected character "${char}"`);
            }

            if (member === undefined) {
                continue;
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
    }

    if (currentIdentifierName.length > 0) {
        const member = new ExpRexIdentifier(currentIdentifierName);
        members.push(member);
    }
    
    return members;
}
