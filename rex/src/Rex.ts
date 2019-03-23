import * as RexAst from './rexAst';
import {GroupType} from './rexAst';

function codePointFromChars(chars: string) {
    // if single (two-byte) character, use JS built-in
    if (chars.length === 1) return chars.charCodeAt(0);

    // two two-byte characters, use formula
    return (chars.charCodeAt(0) - 0xD800) * 0x400 + chars.charCodeAt(1) - 0xDC00 + 0x10000;
}

export interface Matcher {
    consumes: boolean;
    matches: (char?: string) => boolean;
}
class EmptyMatcher implements Matcher {
    consumes = false;

    matches(char?: string) {
        return true;
    }
}

class AnyMatcher implements Matcher {
    consumes = true;

    matches(char?: string) {
        return char !== undefined;
    }
}

export class CharMatcher implements Matcher {
    consumes = true;

    constructor(private char: string) {}

    matches(char?: string) {
        return this.char === char;
    }
}

class CharacterSetMatcher implements Matcher {
    consumes = true;
    isNegated: boolean;
    chars: Set<string>;
    ranges: Array<{start: number, end: number}>;
    matchers: Matcher[];

    constructor(characterSet: RexAst.RexCharacterSet) {
        this.isNegated = characterSet.isNegated;
        this.chars = new Set(characterSet.chars);
        this.ranges = characterSet.ranges.map(([start, end]) => ({
            start: codePointFromChars(start),
            end: codePointFromChars(end),
        }));
        this.matchers = characterSet.matchers;
    }

    matches(char?: string) {
        if (char === undefined) return false;

        let result = false;

        if (this.chars.has(char)) result = true;

        if (result === false) {
            const charCode = char !== undefined ? codePointFromChars(char) : -1;
            for (let i = 0; i < this.ranges.length; i++) {
                const { start, end } = this.ranges[i];
                if (start <= charCode && charCode <= end) {
                    result = true;
                    break;
                }
            }
        }

        if (result === false) {
            for (let i = 0; i < this.matchers.length; i++) {
                const matcher = this.matchers[i];
                if (matcher.matches(char)) {
                    result = true;
                    break;
                }
            }
        }

        return this.isNegated ? !result : result;
    }
}

export class WhitespaceMatcher implements Matcher {
    consumes = true;

    matches(char?: string) {
        return char === ' ' || char === '\t' || char === '\n' || char === '\r';
    }
}

const charCode0 = '0'.charCodeAt(0);
const charCode9 = '9'.charCodeAt(0);
export class DigitMatcher implements Matcher {
    consumes = true;

    matches(char?: string) {
        const charCode = char ? codePointFromChars(char) : -1;
        return charCode0 <= charCode && charCode <= charCode9;
    }
}

const wordChars = new Set([
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '_'
]);
export class WordMatcher implements Matcher {
    consumes = true;

    matches(char?: string) {
        return char !== undefined ? wordChars.has(char) : false;
    }
}

export class NegatedMatcher implements Matcher {
    consumes = true;

    constructor(private matcher: Matcher) {}

    matches(char?: string) {
        if (char === undefined) return false;

        return !this.matcher.matches(char);
    }
}

export class StateConnection {
    constructor(public matcher: Matcher, public node: StateNode) {}
}

let nextMatchCounterId = 0;
let nextNodeId = 0;
export class StateNode {
    public nodeId = nextNodeId++;
    public captureNames: Set<string> = new Set();
    public connections: StateConnection[] = [];
    public matchCounterId?: number;
    public appendMatch: boolean = true;

    connect(matcher: Matcher, node: StateNode) {
        this.connections.push(new StateConnection(matcher, node));
    }

    setMatchCounterId(matchCounterId: number) {
        this.matchCounterId = matchCounterId;
        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].node.setMatchCounterId(matchCounterId);
        }
    }

    addCaptureNames(names: string[], processedNodes: Set<StateNode> = new Set()) {
        if (processedNodes.has(this)) return;

        processedNodes.add(this);

        for (let i = 0; i < names.length; i++) {
            this.captureNames.add(names[i]);
        }

        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].node.addCaptureNames(names, processedNodes);
        }
    }

    setAppendMatch(appendMatch: boolean, processedNodes: Set<StateNode> = new Set()) {
        if (processedNodes.has(this)) return;

        processedNodes.add(this);

        this.appendMatch = appendMatch;

        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].node.setAppendMatch(appendMatch, processedNodes);
        }
    }
}

export class EndStateNode extends StateNode {}

const MATCH_STATUS_INITIALIZED = Symbol('MATCH_STATUS_INITIALIZED');
const MATCH_STATUS_SUCCESS = Symbol('MATCH_STATUS_SUCCESS');
const MATCH_STATUS_FAIL = Symbol('MATCH_STATUS_FAIL');
type MATCH_STATUS =
    typeof MATCH_STATUS_INITIALIZED |
    typeof MATCH_STATUS_SUCCESS |
    typeof MATCH_STATUS_FAIL;

function isNewCountersBetter(oldCounters: number[], newCounters: number[]) {
    const maxCounterId = Math.max(oldCounters.length, newCounters.length);
    for (let i = 0; i < maxCounterId; i++) {
        if (
            (
                oldCounters[i] === undefined &&
                newCounters[i] !== undefined
            )
            ||
            (
                oldCounters[i] !== undefined &&
                newCounters[i] !== undefined &&
                newCounters[i] > oldCounters[i]
            )
        ) {
            return false;
        }
    }
    return true;
}

class MatchState {
    private status: MATCH_STATUS = MATCH_STATUS_INITIALIZED;
    public nextStates: MatchState[] = [];

    constructor(
        private node: StateNode,
        private against: string,
        private cursor: number,
        private cursorStart: number = cursor,
        public matchCounters: number[] = [],
        public captures: {[key: string]: string} = {},
        private seenStates: Set<string> = new Set(),
        private matchedText = '',
        public totalConsumedLength = 0
    ) {}

    advance() {
        if (this.status === MATCH_STATUS_FAIL) throw new Error('Cannot advance MatchState, already failed');
        if (this.status === MATCH_STATUS_SUCCESS) throw new Error('Cannot advance MatchState, already succeeded');

        const nextChar = RexAst.unicodeRead(this.against, this.cursor);
        const advanceSize = nextChar !== undefined ? nextChar.length : 1;

        const myState = `${this.node.nodeId}-${this.cursor}-${this.matchCounters}`;
        if (this.seenStates.has(myState)) {
            this.status = MATCH_STATUS_FAIL;
            return;
        }
        this.seenStates.add(myState);

        for (let i = 0; i < this.node.connections.length; i++) {
            const connection = this.node.connections[i];

            if (connection.matcher.matches(nextChar)) {
                if (connection.matcher instanceof EmptyMatcher === false || connection.node !== this.node) {
                    const connectedNode = connection.node;
                    const appendMatch = connection.node.appendMatch;

                    // increment any active match counter
                    const applyMatchCounter = connection.matcher.consumes && connectedNode.matchCounterId !== undefined;
                    const matchCounters = applyMatchCounter ? [...this.matchCounters] : this.matchCounters; // only clone if being modified
                    if (applyMatchCounter) {
                        matchCounters[connectedNode.matchCounterId!] = matchCounters[connectedNode.matchCounterId!] || 0;
                        matchCounters[connectedNode.matchCounterId!]++;
                    }

                    // append character to any active capture groups
                    const applyCaptures = appendMatch && connection.matcher.consumes && connectedNode.captureNames.size > 0;
                    const captures = applyCaptures ? {...this.captures} : this.captures; // only clone if being modified
                    if (applyCaptures) {
                        connectedNode.captureNames.forEach(name => {
                            if (captures.hasOwnProperty(name) === false) captures[name] = '';
                            captures[name] += nextChar;
                        });
                    }

                    const matchedText = connection.matcher.consumes ? (appendMatch ? this.matchedText + (nextChar || '') : this.matchedText) : this.matchedText;
                    this.nextStates.push(new MatchState(
                        connectedNode,
                        this.against,
                        this.cursor + (connection.matcher.consumes ? advanceSize : 0),
                        this.cursorStart,
                        matchCounters,
                        captures,
                        this.seenStates,
                        matchedText,
                        this.totalConsumedLength + (connection.matcher.consumes ? 1 : 0)
                    ));
                }
            }
        }

        if (this.nextStates.length === 0) {
            this.status = MATCH_STATUS_FAIL;
        } else {
            this.status = MATCH_STATUS_SUCCESS;
        }
    }

    get isSuccessful() {
        return this.status === MATCH_STATUS_SUCCESS;
    }

    get isAtEnd() {
        return this.node instanceof EndStateNode;
    }

    getNextStates() {
        if (this.status !== MATCH_STATUS_SUCCESS) throw new Error(`Cannot get next states, MatchState is ${this.status.toString()}`);

        return this.nextStates;
    }

    getMatchedText() {
        return this.matchedText;
    }

    get isAtEndOfInputString() {
        return this.cursor === this.against.length;
    }

    get result() {
        return {
            text: this.getMatchedText(),
            captures: this.captures,
        }
    }
}

function assertNever(x: never): never {
    throw new Error('Runtime Type Error');
}

// all paths connect the same exit node so its safe to always choose the first unseen connection
function collectExitNode(tree: StateNode): StateNode {
    const seenNodes = new Set();
    let exitNode = tree;

    while (exitNode.connections.length > 0) {
        for (let i = 0; i < exitNode.connections.length; i++) {
            // avoid infinite recursion into the same node
            const node = exitNode.connections[i].node;
            if (seenNodes.has(node) === false) {
                seenNodes.add(node);
                exitNode = exitNode.connections[i].node;
                break;
            }
        }
    }

    return exitNode;
}

export default class Rex {
    private isBoundToStart: boolean;
    private isBoundToEnd: boolean;
    private stateTree: StateNode;

    static compressMatchers(tree: StateNode, seenNodes = new Set()) {
        if (seenNodes.has(tree)) return;
        seenNodes.add(tree);

        // walk through tree, compressing it by removing all EmptyMatchers
        for (let i = 0; i < tree.connections.length; i++) {
            const connection = tree.connections[i];
            // if the matcher is an EmptyMatcher _and_ the connecting node isn't an EndStateNode
            if (connection.matcher instanceof EmptyMatcher && connection.node instanceof EndStateNode === false) {
                // this connection always progresses into the connected node
                // remove this connection and add all of the connected node's connections
                tree.connections.splice(i, 1);

                Array.prototype.push.apply(tree.connections, connection.node.connections);

                // we removed a connection, step backwards in the count
                i--;
            } else {
                // keeping this connection around, process its node
                Rex.compressMatchers(connection.node, seenNodes);
            }
        }
    }

    static buildFromMembers(members: RexAst.RexAstNode[], endNode = new EndStateNode()) {
        const stateTree = new StateNode();
        let previousNodes: StateNode[] = [stateTree];
        let nextNodes: StateNode[];

        for (let i = 0; i < members.length; i++) {
            nextNodes = [];
            let matcher: Matcher;

            const member: RexAst.RexAstNode = members[i];

            // in most cases entry and exit are the same node
            let entryNode = new StateNode();
            let exitNode = entryNode;

            if (member instanceof RexAst.RexChar) {
                matcher = new CharMatcher(member.char);
            } else if (member instanceof RexAst.RexMatchAny) {
                matcher = new AnyMatcher();
            } else if (member instanceof RexAst.RexWhitespace) {
                matcher = new WhitespaceMatcher();
            } else if (member instanceof RexAst.RexNotWhitespace) {
                matcher = new NegatedMatcher(new WhitespaceMatcher());
            } else if (member instanceof RexAst.RexDigit) {
                matcher = new DigitMatcher();
            } else if (member instanceof RexAst.RexNotDigit) {
                matcher = new NegatedMatcher(new DigitMatcher());
            } else if (member instanceof RexAst.RexWord) {
                matcher = new WordMatcher();
            } else if (member instanceof RexAst.RexNotWord) {
                matcher = new NegatedMatcher(new WordMatcher());
            } else if (member instanceof RexAst.RexGroup) {
                matcher = new EmptyMatcher();
                const groupTree = Rex.buildFromMembers(member.members, new StateNode());
                groupTree.addCaptureNames(member.captureNames);

                if (member.type === GroupType.LOOKAHEAD) {
                    groupTree.setAppendMatch(false);
                }

                // entryNode is the group entry
                entryNode = groupTree;
                exitNode = collectExitNode(groupTree);
            } else if (member instanceof RexAst.RexOr) {
                matcher = new EmptyMatcher();
                // entry & exist nodes are handled separately below
            } else if (member instanceof RexAst.RexCharacterSet) {
                matcher = new CharacterSetMatcher(member);
            } else {
                assertNever(member);
                matcher = new EmptyMatcher();
            }

            const matchType = member.getMatchType();
            if (member instanceof RexAst.RexOr) {
                // validate this or node doesn't have special matching
                // as that should be very impossible
                if (matchType !== RexAst.MATCH_TYPE_NORMAL) throw new Error('RexOr node must be a MATCH_TYPE_NORMAL');
                const leftTree = Rex.buildFromMembers(member.left, new StateNode());
                const rightTree = Rex.buildFromMembers(member.right, new StateNode());

                previousNodes.forEach(prev => {
                    prev.connect(matcher, leftTree);
                    prev.connect(matcher, rightTree);
                });

                nextNodes.push(collectExitNode(leftTree));
                nextNodes.push(collectExitNode(rightTree));
            } else if (matchType === RexAst.MATCH_TYPE_ZERO_OR_MORE) {
                if (member.isNonGreedy) {
                    entryNode.setMatchCounterId(nextMatchCounterId++);
                }

                // connect all previous nodes to this node (this is the matching path)
                previousNodes.forEach(node => node.connect(matcher, entryNode));

                // create the optional path through
                const emptyNode = new StateNode();
                previousNodes.forEach(node => node.connect(new EmptyMatcher(), emptyNode));

                // connect node's exit to its entry with the same matcher (this is the repeating path)
                exitNode.connect(matcher, entryNode);

                nextNodes.push(exitNode); // expose matched path
                nextNodes.push(emptyNode); // expose the optional escape path
            } else if (matchType === RexAst.MATCH_TYPE_ONE_OR_MORE) {
                if (member.isNonGreedy) {
                    entryNode.setMatchCounterId(nextMatchCounterId++);
                }

                // have to match once
                // each previous node followers matcher into the required node
                previousNodes.forEach(node => node.connect(matcher, entryNode));

                // the entry path can be moved on from
                nextNodes.push(exitNode);

                // this node's exit can repeat via the same matcher
                exitNode.connect(matcher, entryNode);
            } else if (matchType === RexAst.MATCH_TYPE_ZERO_OR_ONE) {
                if (member.isNonGreedy) {
                    entryNode.setMatchCounterId(nextMatchCounterId++);
                }

                // connect all previous nodes to this node (this is the matching path)
                previousNodes.forEach(node => node.connect(matcher, entryNode));

                // create the optional path through
                const emptyNode = new StateNode();
                previousNodes.forEach(node => node.connect(new EmptyMatcher(), emptyNode));

                nextNodes.push(exitNode); // expose matched path
                nextNodes.push(emptyNode); // expose the optional escape path
            } else if (matchType === RexAst.MATCH_TYPE_NORMAL) {
                nextNodes.push(exitNode);
                previousNodes.forEach(node => node.connect(matcher, entryNode));
            } else {
                assertNever(matchType);
            }

            previousNodes = nextNodes;
        }

        previousNodes.forEach(node => node.connect(new EmptyMatcher(), endNode));

        return stateTree;
    }

    static buildFromSequence(sequence: string) {
        if (sequence.length === 0) throw new Error('Cannot create sequence from zero-length string');
        const members = RexAst.parseRexAst(sequence);
        return Rex.buildFromMembers(members);
    }

    constructor(regex: string) {
        if (regex.length === 0) throw new Error('Cannot create regex from zero-length string');

        this.isBoundToStart = regex[0] === '^';
        if (this.isBoundToStart) {
            regex = regex.slice(1);
        }

        this.isBoundToEnd = regex[regex.length - 1] === '$';
        if (this.isBoundToEnd) {
            regex = regex.slice(0, regex.length - 1);
        }

        this.stateTree = Rex.buildFromSequence(regex);
        Rex.compressMatchers(this.stateTree);
    }

    match(against: string, cursor = 0) {
        do {
            const match = this.matchAt(against, cursor);
            if (match !== undefined) {
                return match;
            }
        } while (++cursor < against.length && this.isBoundToStart === false);
        return undefined;
    }

    private matchAt(against: string, cursor: number) {
        const states: MatchState[] = [new MatchState(this.stateTree, against, cursor)];
        let bestMatchLength = -Infinity;
        let bestMatch: MatchState | undefined;

        while (states.length > 0) {
            const state = states.shift()!;

            state.advance();

            if (state.isAtEnd) {
                const match = state.getMatchedText();
                if (bestMatch === undefined || state.totalConsumedLength >= bestMatchLength) {
                    if (!this.isBoundToEnd || state.isAtEndOfInputString) {
                        if (bestMatch === undefined) {
                            bestMatch = state;
                            bestMatchLength = state.totalConsumedLength;
                        } else if (isNewCountersBetter(bestMatch.matchCounters, state.matchCounters)) {
                            bestMatch = state;
                            bestMatchLength = state.totalConsumedLength;
                        }
                    }
                }
            } else if (state.isSuccessful) {
                const nextStates = state.getNextStates();
                Array.prototype.push.apply(states, nextStates);
            }
        }

        return bestMatch ? bestMatch.result : undefined;
    }
}