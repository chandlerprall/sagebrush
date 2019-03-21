import * as ExpRexAst from './exprexAst';
import { Token } from '../Token';
import { Expression } from '../Parser';

type ExpressionMap = Map<string, Expression>;

export interface TokenMatch {
    token: Token;
}

export interface ExpressionMatch {
    tokenLength: number;
    expression: Expression;
    match: MatchState['result'];
}

export type Match = TokenMatch | ExpressionMatch;

export interface Matcher {
    consumes: boolean;
    matches: (tokens: Token[], cursor: number) => Match[];
}
class EmptyMatcher implements Matcher {
    consumes = false;

    matches(tokens: Token[], cursor: number) {
        return [{ token: tokens[cursor] }];
    }
}

class AnyMatcher implements Matcher {
    consumes = true;

    matches(tokens: Token[], cursor: number) {
        const token = tokens[cursor];
        return token !== undefined ? [{ token: token }] : [];
    }

    toString() {
        return 'Any token';
    }
}

export class IdentifierMatcher implements Matcher {
    consumes = true;

    constructor(private identifier: string, private expressionMap: ExpressionMap) {}

    matches(tokens: Token[], cursor: number) {
        const token = tokens[cursor];
        if (token == null) return [];

        const expression = this.expressionMap.get(this.identifier);
        if (expression === undefined) {
            // doesn't match any known expression, match against a token
            return this.identifier === token.type ? [{ token }] : [];
        } else {
            // match against the expression
            let bestMatch: MatchState['result'] | undefined;

            for (let i = 0; i < expression.groups.length; i++) {
                const subexp = expression.groups[i];
                const match = subexp.match(tokens, cursor);

                if (match !== undefined) {
                    if (bestMatch === undefined || match.tokens.length > bestMatch.tokens.length) {
                        bestMatch = match;
                    }
                }
            }

            return bestMatch
                ? [{ expression, tokenLength: bestMatch.tokens.length, match: bestMatch }]
                : [];
        }
    }

    toString() {
        const isExpression = this.expressionMap.has(this.identifier);
        return `${this.identifier} ${isExpression ? 'expression' : 'token'}`;
    }
}

export class NegatedMatcher implements Matcher {
    consumes = true;

    constructor(private matcher: Matcher) {}

    matches(tokens: Token[], cursor: number) {
        const token = tokens[cursor];
        if (token === undefined) return [];

        return this.matcher.matches(tokens, cursor) ? [] : [{ token }];
    }

    toString() {
        return `Not Match ${this.matcher.toString()}`;
    }
}

class StateConnection {
    constructor(public matcher: Matcher, public node: StateNode) {}
}

let nextMatchCounterId = 0;
let nextNodeId = 0;
class StateNode {
    public nodeId = nextNodeId++;
    public captureNames: Set<string> = new Set();
    public connections: StateConnection[] = [];
    public matchCounterId?: number;

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
}

class EndStateNode extends StateNode {}

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

export class MatchState {
    private status: MATCH_STATUS = MATCH_STATUS_INITIALIZED;
    public nextStates: MatchState[] = [];

    constructor(
        private node: StateNode,
        private against: Token[],
        private cursor: number,
        private cursorStart: number = cursor,
        public matchCounters: number[] = [],
        public captures: {[key: string]: Match[]} = {},
        private seenStates: Set<string> = new Set(),
        private expected: string[] = []
    ) {}

    advance() {
        if (this.status === MATCH_STATUS_FAIL) throw new Error('Cannot advance MatchState, already failed');
        if (this.status === MATCH_STATUS_SUCCESS) throw new Error('Cannot advance MatchState, already succeeded');

        const myState = `${this.node.nodeId}-${this.cursor}-${this.matchCounters}`;
        if (this.seenStates.has(myState)) {
            this.status = MATCH_STATUS_FAIL;
            return;
        }
        this.seenStates.add(myState);

        for (let i = 0; i < this.node.connections.length; i++) {
            const connection = this.node.connections[i];

            const matches = connection.matcher.matches(this.against, this.cursor);
            const matchTokenLength = matches.reduce(
                (length, match) => {
                    if (match.hasOwnProperty('expression')) {
                        return length + (match as ExpressionMatch).tokenLength;
                    } else {
                        return length + 1;
                    }
                },
                0
            );

            if (matchTokenLength > 0) {
                const isCompleteMatch = matches.reduce(
                    (isCompleteMatch, match) => {
                        if (isCompleteMatch === false) return isCompleteMatch;
                        if (match.hasOwnProperty('expression')) {
                            return (match as ExpressionMatch).match.isCompleteMatch;
                        } else {
                            return true;
                        }
                    },
                    true
                );

                if (isCompleteMatch === false) {
                    matches.forEach(match => {
                        if (match.hasOwnProperty('expression')) {
                            match = match as ExpressionMatch;
                            Array.prototype.push.apply(this.expected, match.match.expected);
                        }
                    });
                } else {
                    if (connection.matcher instanceof EmptyMatcher === false || connection.node !== this.node) {
                        const connectedNode = connection.node;
                        // increment any active match counter
                        const applyMatchCounter = connection.matcher.consumes && connectedNode.matchCounterId !== undefined;
                        const matchCounters = applyMatchCounter ? [...this.matchCounters] : this.matchCounters; // only clone if being modified
                        if (applyMatchCounter) {
                            matchCounters[connectedNode.matchCounterId!] = matchCounters[connectedNode.matchCounterId!] || 0;
                            matchCounters[connectedNode.matchCounterId!]++;
                        }

                        // append character to any active capture groups
                        const applyCaptures = connection.matcher.consumes && connectedNode.captureNames.size > 0;
                        const captures = applyCaptures ? {...this.captures} : this.captures; // only clone if being modified
                        if (applyCaptures) {
                            connectedNode.captureNames.forEach(name => {
                                if (captures.hasOwnProperty(name) === false) captures[name] = [];
                                Array.prototype.push.apply(captures[name], matches);
                            });
                        }

                        this.nextStates.push(new MatchState(
                            connectedNode,
                            this.against,
                            this.cursor + (connection.matcher.consumes ? matchTokenLength : 0),
                            this.cursorStart,
                            matchCounters,
                            captures,
                            this.seenStates,
                            [...this.expected]
                        ));
                    }
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

    getMatchedTokens() {
        return this.against.slice(this.cursorStart, this.cursor);
    }

    get isAtEndOfInputString() {
        return this.cursor === this.against.length;
    }

    get result() {
        if (this.status === MATCH_STATUS_INITIALIZED) {
            throw new Error('MatchState cannot yield a result until it has been advanced.');
        }
        const expected = this.isAtEnd ? [] : this.node.connections.map(connection => connection.matcher.toString());

        return {
            isCompleteMatch: this.isAtEnd,
            // expected: this.isAtEnd ? [] : this.node.connections.map(connection => connection.matcher.toString()),
            expected: [...this.expected, ...expected],
            tokens: this.getMatchedTokens(),
            captures: this.captures,
        };
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

export default class ExpRex {
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
                ExpRex.compressMatchers(connection.node, seenNodes);
            }
        }
    }

    static buildFromMembers(members: ExpRexAst.ExpRexAstNode[], expressionMap: ExpressionMap, endNode = new EndStateNode()) {
        const stateTree = new StateNode();
        let previousNodes: StateNode[] = [stateTree];
        let nextNodes: StateNode[];

        for (let i = 0; i < members.length; i++) {
            nextNodes = [];
            let matcher: Matcher;

            const member: ExpRexAst.ExpRexAstNode = members[i];

            // in most cases entry and exit are the same node
            let entryNode = new StateNode();
            let exitNode = entryNode;

            if (member instanceof ExpRexAst.ExpRexIdentifier) {
                matcher = new IdentifierMatcher(member.identifier, expressionMap);
            } else if (member instanceof ExpRexAst.ExpRexMatchAny) {
                matcher = new AnyMatcher();
            } else if (member instanceof ExpRexAst.ExpRexGroup) {
                matcher = new EmptyMatcher();
                const groupTree = ExpRex.buildFromMembers(member.members, expressionMap, new StateNode());
                groupTree.addCaptureNames(member.captureNames);
                // entryNode is the group entry
                entryNode = groupTree;
                exitNode = collectExitNode(groupTree);
            } else if (member instanceof ExpRexAst.ExpRexOr) {
                matcher = new EmptyMatcher();
                // entry & exist nodes are handled separately below
            } else {
                assertNever(member);
                matcher = new EmptyMatcher();
            }

            const matchType = member.getMatchType();
            if (member instanceof ExpRexAst.ExpRexOr) {
                // validate this or node doesn't have special matching
                // as that should be very impossible
                if (matchType !== ExpRexAst.MATCH_TYPE_NORMAL) throw new Error('RexOr node must be a MATCH_TYPE_NORMAL');
                const leftTree = ExpRex.buildFromMembers(member.left, expressionMap, new StateNode());
                const rightTree = ExpRex.buildFromMembers(member.right, expressionMap, new StateNode());

                previousNodes.forEach(prev => {
                    prev.connect(matcher, leftTree);
                    prev.connect(matcher, rightTree);
                });

                nextNodes.push(collectExitNode(leftTree));
                nextNodes.push(collectExitNode(rightTree));
            } else if (matchType === ExpRexAst.MATCH_TYPE_ZERO_OR_MORE) {
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
            } else if (matchType === ExpRexAst.MATCH_TYPE_ONE_OR_MORE) {
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
            } else if (matchType === ExpRexAst.MATCH_TYPE_ZERO_OR_ONE) {
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
            } else if (matchType === ExpRexAst.MATCH_TYPE_NORMAL) {
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

    static buildFromSequence(sequence: string, expressionMap: ExpressionMap) {
        if (sequence.length === 0) throw new Error('Cannot create sequence from zero-length token array');
        const members = ExpRexAst.parseExpRexAst(sequence);
        return ExpRex.buildFromMembers(members, expressionMap);
    }

    constructor(regex: string, private expressionMap: ExpressionMap) {
        if (regex.length === 0) throw new Error('Cannot create regex from zero-length token array');

        this.stateTree = ExpRex.buildFromSequence(regex, this.expressionMap);
        ExpRex.compressMatchers(this.stateTree);
    }

    match(against: Token[], cursor = 0) {
        return this.matchAt(against, cursor);
    }

    private matchAt(against: Token[], cursor: number) {
        const states: MatchState[] = [new MatchState(this.stateTree, against, cursor)];
        let bestMatchLength = -Infinity;
        let bestMatch: MatchState | undefined;

        while (states.length > 0) {
            const state = states.shift()!;

            state.advance();

            const match = state.getMatchedTokens();
            const isLengthBetter = bestMatch === undefined ? true :
                match.length > bestMatchLength && isNewCountersBetter(bestMatch.matchCounters, state.matchCounters);
            const isNewBestMatch =
                bestMatch === undefined // no previous best
                || (state.isAtEnd && !bestMatch.isAtEnd) // previous best wasn't a successful match, this one is
                || isLengthBetter // new match better fits
            ;
            if (isNewBestMatch) {
                bestMatch = state;
                bestMatchLength = match.length;
            }

            if (state.isSuccessful) {
                const nextStates = state.getNextStates();
                Array.prototype.push.apply(states, nextStates);
            }
        }

        return bestMatch ? bestMatch.result : undefined;
    }
}