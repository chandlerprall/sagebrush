import ExpRex from './ExpRex';
import { Token } from '../Token';
import {Expression} from '../Parser';

const location = {start: {line: 0, column: 0}, end: {line: 0, column: 0}};

const fooToken = new Token('FOO', '', {}, location);
const barToken = new Token('BAR', '', {}, location);
const buzzToken = new Token('BUZZ', '', {}, location);
const fizzToken = new Token('FIZZ', '', {}, location);

describe('ExpRex', () => {
    it('matches a simple symbol', () => {
        const expressionMap = new Map();

        const exprex = new ExpRex('FOO', expressionMap);

        expect(
            exprex.match([fooToken])
        ).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });

        expect(
            exprex.match([fooToken, fooToken])
        ).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });

        expect(
            exprex.match([fooToken, barToken])
        ).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });

        expect(
            exprex.match([])
        ).toMatchObject({ isCompleteMatch: false, expected: ['FOO token'] });

        expect(
            exprex.match([barToken])
        ).toMatchObject({ isCompleteMatch: false, expected: ['FOO token'] });
    });

    it('matches a sequence of symbols', () => {
        const expressionMap = new Map();

        const exprex = new ExpRex('FOO BAR', expressionMap);

        exprex.match([fooToken, barToken]);
        expect(
            exprex.match([fooToken, barToken])
        ).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });

        expect(
            exprex.match([fooToken])
        ).toMatchObject({ isCompleteMatch: false });

        expect(
            exprex.match([fooToken, fooToken])
        ).toMatchObject({ isCompleteMatch: false });

        expect(
            exprex.match([])
        ).toMatchObject({ isCompleteMatch: false });

        expect(
            exprex.match([barToken])
        ).toMatchObject({ isCompleteMatch: false });
    });

    it('matches an expression', () => {
        const expressionMap: Map<string, Expression> = new Map();
        expressionMap.set('Fizz', { name: 'Fizz', groups: [new ExpRex('FOO BAR', expressionMap)] });

        const exprex = new ExpRex('Fizz', expressionMap);

        expect(
            exprex.match([fooToken, barToken])
        ).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] })
    });

    describe('zero-or-more', () => {
        it('matches a repeated character at the end', () => {
            const rex = new ExpRex('FOO BAR*', new Map());

            expect(rex.match([])).toMatchObject({ isCompleteMatch: false });
            expect(rex.match([barToken])).toMatchObject({ isCompleteMatch: false });

            expect(rex.match([fooToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken, barToken, barToken])).toEqual({ tokens: [fooToken, barToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
        });

        it('matches a repeated character in the middle', () => {
            const rex = new ExpRex('FOO* BAR', new Map());

            expect(rex.match([])).toMatchObject({ isCompleteMatch: false });
            expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });

            expect(rex.match([barToken])).toEqual({ tokens: [barToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken, fooToken, barToken])).toEqual({ tokens: [fooToken, fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
        });
    });

    describe('one-or-more', () => {
        it('matches a repeated character', () => {
            const rex = new ExpRex('FOO+', new Map());

            expect(rex.match([])).toMatchObject({ isCompleteMatch: false });

            expect(rex.match([fooToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken, fooToken])).toEqual({ tokens: [fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
        });

        it('matches a repeated character in the middle', () => {
            const rex = new ExpRex('FOO+ BAR', new Map());

            expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });

            expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken, fooToken, barToken])).toEqual({ tokens: [fooToken, fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
        });
    });

    describe('zero-or-one', () => {
        it('matches a repeated character', () => {
            const rex = new ExpRex('FOO?', new Map());

            expect(rex.match([])).toEqual({ tokens: [], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
        });

        it('matches a repeated character in the middle', () => {
            const rex = new ExpRex('FOO? BAR', new Map());

            expect(rex.match([])).toMatchObject({ isCompleteMatch: false });

            expect(rex.match([barToken])).toEqual({ tokens: [barToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });

            expect(rex.match([fooToken, fooToken, barToken])).toMatchObject({ isCompleteMatch: false });
        });
    });

    describe('non-greedy matchers', () => {
        describe('non-greedy zero-or-more', () => {
            it('matches simple zero-or-more', () => {
                const expressionMap: Map<string, Expression> = new Map();
                expressionMap.set('Fizz', {
                    name: 'Fizz', groups: [new ExpRex('FOO', expressionMap), new ExpRex('BAR', expressionMap)]
                });

                const rex = new ExpRex('FOO Fizz*? BAR', expressionMap);
                expect(rex.match([fooToken, fooToken, barToken, barToken])).toEqual({ tokens: [fooToken, fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches zero length zero-or-more', () => {
                const expressionMap: Map<string, Expression> = new Map();
                expressionMap.set('Fizz', {
                    name: 'Fizz', groups: [new ExpRex('FOO', expressionMap), new ExpRex('BAR', expressionMap)]
                });

                const rex = new ExpRex('Fizz*? FOO FOO', expressionMap);

                expect(rex.match([fooToken, fooToken, fooToken])).toEqual({ tokens: [fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([barToken, fooToken, fooToken])).toEqual({ tokens: [barToken, fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([barToken, fooToken, fooToken, fooToken])).toEqual({ tokens: [barToken, fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            });
        });

        describe('non-greedy one-or-more', () => {
            it('matches simple one-or-more', () => {
                const expressionMap: Map<string, Expression> = new Map();
                expressionMap.set('Fizz', {
                    name: 'Fizz', groups: [new ExpRex('FOO', expressionMap), new ExpRex('BAR', expressionMap)]
                });

                const rex = new ExpRex('FOO Fizz+? FOO', expressionMap);
                expect(rex.match([fooToken, fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, barToken, fooToken])).toEqual({ tokens: [fooToken, barToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, fooToken, fooToken])).toEqual({ tokens: [fooToken, fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, fooToken, fooToken, fooToken])).toEqual({ tokens: [fooToken, fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches one length one-or-more', () => {
                const expressionMap: Map<string, Expression> = new Map();
                expressionMap.set('Fizz', {
                    name: 'Fizz', groups: [new ExpRex('FOO', expressionMap), new ExpRex('BAR', expressionMap)]
                });

                const rex = new ExpRex('Fizz+? FOO FOO', expressionMap);

                expect(rex.match([fooToken, fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, fooToken, fooToken])).toEqual({ tokens: [fooToken, fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, fooToken, fooToken, fooToken])).toEqual({ tokens: [fooToken, fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([barToken, fooToken, fooToken, fooToken])).toEqual({ tokens: [barToken, fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('tracks two non-greedy one-or-more matchers', () => {
                const rex = new ExpRex('FOO+? BAR+?', new Map());
                expect(rex.match([fooToken, fooToken, fooToken, barToken, barToken])).toEqual({ tokens: [fooToken, fooToken, fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('works alongside greedy matchers', () => {
                const rex = new ExpRex('FOO+? BAR+', new Map());
                expect(rex.match([fooToken, fooToken, fooToken, barToken, barToken])).toEqual({ tokens: [fooToken, fooToken, fooToken, barToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });
        });
    });

    describe('groups', () => {
        describe('matches a group', () => {
            it('matches a standalone group', () => {
                const rex = new ExpRex('(FOO BAR+)', new Map());

                expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, barToken])).toEqual({ tokens: [fooToken, barToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches a group at the beginning', () => {
                const rex = new ExpRex('(FOO) BAR', new Map());

                expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches a group at the end', () => {
                const rex = new ExpRex('FOO (BAR)', new Map());

                expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches a group in the middle', () => {
                const rex = new ExpRex('FOO (BAR) FOO', new Map());

                expect(rex.match([fooToken, fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, barToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([barToken, fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, barToken, fooToken])).toEqual({ tokens: [fooToken, barToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            });
        });

        describe('optional groups', () => {
            it('matches zero or more groups in the beginning', () => {
                const rex = new ExpRex('(FOO)* BAR', new Map());

                expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([barToken])).toEqual({ tokens: [barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, fooToken, barToken])).toEqual({ tokens: [fooToken, fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches zero or more groups at the end', () => {
                const rex = new ExpRex('FOO (BAR)*', new Map());

                expect(rex.match([barToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, barToken])).toEqual({ tokens: [fooToken, barToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, barToken, fooToken])).toEqual({ tokens: [fooToken, barToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches zero or more groups in the middle', () => {
                const rex = new ExpRex('FOO (BAR)* FOO', new Map());

                expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([barToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, barToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([barToken, fooToken])).toMatchObject({ isCompleteMatch: false });

                expect(rex.match([fooToken, fooToken])).toEqual({ tokens: [fooToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, fooToken])).toEqual({ tokens: [fooToken, barToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            });
        });

        describe('one-or-more groups', () => {
            it('matches one or more groups in the beginning', () => {
                const rex = new ExpRex('(FOO)+ BAR', new Map());

                expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([barToken])).toMatchObject({ isCompleteMatch: false });

                expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, fooToken, barToken])).toEqual({ tokens: [fooToken, fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches one or more groups at the end', () => {
                const rex = new ExpRex('FOO (BAR)+', new Map());

                expect(rex.match([barToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });

                expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, barToken])).toEqual({ tokens: [fooToken, barToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, barToken, barToken])).toEqual({ tokens: [fooToken, barToken, barToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, barToken, barToken, fooToken])).toEqual({ tokens: [fooToken, barToken, barToken, barToken], captures: {}, isCompleteMatch: true, expected: [] });
            });

            it('matches one or more groups in the middle', () => {
                const rex = new ExpRex('FOO (BAR)+ FOO', new Map());

                expect(rex.match([fooToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([barToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([fooToken, barToken])).toMatchObject({ isCompleteMatch: false });
                expect(rex.match([barToken, fooToken])).toMatchObject({ isCompleteMatch: false });

                expect(rex.match([fooToken, barToken, fooToken])).toEqual({ tokens: [fooToken, barToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
                expect(rex.match([fooToken, barToken, barToken, fooToken])).toEqual({ tokens: [fooToken, barToken, barToken, fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            });
        });

        it('throws an error when parenthesis are unbalanced', () => {
            expect(() => {
                new ExpRex('(FOO', new Map());
            }).toThrowErrorMatchingInlineSnapshot(`"Unbalanced parentheses"`);
            expect(() => {
                new ExpRex('(FO(O)', new Map());
            }).toThrowErrorMatchingInlineSnapshot(`"Unbalanced parentheses"`);

            expect(() => {
                new ExpRex('FOO)', new Map());
            }).toThrowErrorMatchingInlineSnapshot(`"Unexpected token \\")\\""`);
            expect(() => {
                new ExpRex('(FOO))', new Map());
            }).toThrowErrorMatchingInlineSnapshot(`"Unexpected token \\")\\""`);
        });

        describe('capturing', () => {
            it('records the matched tokens in a named group', () => {
                const rex = new ExpRex('FOO (?<bar>BAR)+', new Map());

                expect(rex.match([fooToken, barToken])).toMatchObject({
                    isCompleteMatch: true,
                    tokens: [fooToken, barToken],
                    captures: {
                        bar: [
                            { token: barToken },
                        ],
                    }
                });
            });

            it('records the matched expressions in a named group', () => {
                const expressionMap: Map<string, Expression> = new Map();
                expressionMap.set('Fizz', {
                    name: 'Fizz', groups: [new ExpRex('FOO', expressionMap), new ExpRex('BAR', expressionMap)]
                });

                const rex = new ExpRex('FOO (?<fizz>Fizz)+', expressionMap);

                expect(rex.match([fooToken, barToken, fooToken])).toMatchObject({
                    isCompleteMatch: true,
                    tokens: [fooToken, barToken, fooToken],
                    captures: {
                        fizz: [
                            {
                                expression: expressionMap.get('Fizz'),
                                tokenLength: 1,
                                match: {
                                    captures: {},
                                    tokens: [ barToken ]
                                }
                            },
                            {
                                expression: expressionMap.get('Fizz'),
                                tokenLength: 1,
                                match: {
                                    captures: {},
                                    tokens: [ fooToken ]
                                }
                            },
                        ],
                    }
                });
            });

            it('records nested matched expressions in a named group', () => {
                const expressionMap: Map<string, Expression> = new Map();
                expressionMap.set('Fizz', {
                    name: 'Fizz', groups: [new ExpRex('FOO', expressionMap), new ExpRex('BAR', expressionMap)]
                });

                expressionMap.set('Buzz', {
                    name: 'Buzz', groups: [new ExpRex('Fizz', expressionMap)]
                });

                const rex = new ExpRex('FOO (?<buzz>Buzz)+', expressionMap);
                expect(rex.match([fooToken, barToken, fooToken])).toMatchObject({
                    isCompleteMatch: true,
                    tokens: [fooToken, barToken, fooToken],
                    captures: {
                        buzz: [
                            {
                                expression: expressionMap.get('Buzz'),
                                tokenLength: 1,
                                match: {
                                    captures: {},
                                    tokens: [
                                        barToken
                                    ]
                                }
                            },
                            {
                                expression: expressionMap.get('Buzz'),
                                tokenLength: 1,
                                match: {
                                    captures: {},
                                    tokens: [
                                        fooToken
                                    ]
                                }
                            },
                        ],
                    }
                });
            });
        });
    });

    describe('ORs', () => {
        it('matches a OR b', () => {
            const rex = new ExpRex('FOO|BAR', new Map());
            expect(rex.match([])).toMatchObject({ isCompleteMatch: false });
            expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([barToken])).toEqual({ tokens: [barToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([barToken, fooToken])).toEqual({ tokens: [barToken], captures: {}, isCompleteMatch: true, expected: [] });
        });

        it('matches foo OR bar OR buzz', () => {
            const rex = new ExpRex('FOO|BAR|BUZZ', new Map());
            expect(rex.match([fooToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([barToken])).toEqual({ tokens: [barToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([buzzToken])).toEqual({ tokens: [buzzToken], captures: {}, isCompleteMatch: true, expected: [] });

            expect(rex.match([fooToken, barToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fooToken, buzzToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([buzzToken, fooToken])).toEqual({ tokens: [buzzToken], captures: {}, isCompleteMatch: true, expected: [] });
        });
    });

    describe('match beginning', () => {
        it('binds the matcher to the start of the input', () => {
            const rex = new ExpRex('(FOO|BAR)BUZZ', new Map());
            expect(rex.match([fooToken, buzzToken])).toEqual({ tokens: [fooToken, buzzToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([barToken, buzzToken])).toEqual({ tokens: [barToken, buzzToken], captures: {}, isCompleteMatch: true, expected: [] });
        });
    });

    describe('complex', () => {
        it('matches a nested group', () => {
            const rex = new ExpRex('((FOO|BUZZ)|BAR)|FIZZ', new Map());
            expect(rex.match([fooToken])).toEqual({ tokens: [fooToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([buzzToken])).toEqual({ tokens: [buzzToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([barToken])).toEqual({ tokens: [barToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([fizzToken, fooToken])).toEqual({ tokens: [fizzToken], captures: {}, isCompleteMatch: true, expected: [] });
            expect(rex.match([barToken, fooToken])).toEqual({ tokens: [barToken], captures: {}, isCompleteMatch: true, expected: [] });
        });
    });


    describe('pathological cases', () => {
        const input = [fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, fooToken, barToken];

        it('(FOO+)+', () => {
            expect(timeMe(() => {
                new ExpRex('(FOO+)+', new Map()).match(input);
            })).toBeLessThan(10);
        });

        it('([FOO]+)*', () => {
            expect(timeMe(() => {
                new ExpRex('(FOO+)*', new Map()).match(input);
            })).toBeLessThan(10);
        });

        it('(FOO|FOO FOO)+', () => {
            expect(timeMe(() => {
                new ExpRex('(FOO|FOO FOO)+', new Map()).match(input);
            })).toBeLessThan(10);
        });
    });
});

function timeMe(fn: () => void) {
    const start = Date.now();
    fn();
    const end = Date.now();
    return end - start;
}