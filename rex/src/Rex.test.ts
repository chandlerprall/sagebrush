import Rex from './Rex';

describe('Rex', () => {
    it('matches a simple string', () => {
        const rex = new Rex('foobar');
        expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
        expect(rex.match('foobarrrr')).toEqual({ text: 'foobar', captures: {} });
        expect(rex.match('nofoobar')).toEqual({ text: 'foobar', captures: {} });
        expect(rex.match('fooba')).toBeUndefined();
        expect(rex.match('foar')).toBeUndefined();
    });

    describe('escaped characters', () => {
        it('throws an error when there is no character to escape', () => {
            expect(() => new Rex('\\')).toThrowErrorMatchingInlineSnapshot(
                `"Illegal escape sequence"`
            );
        });

        it('matches whitespace', () => {
            const rex = new Rex('foo\\sbar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo bar')).toEqual({ text: 'foo bar', captures: {} });
            expect(rex.match('foo\tbar')).toEqual({ text: 'foo\tbar', captures: {} });
            expect(rex.match('foo\nbar')).toEqual({ text: 'foo\nbar', captures: {} });
            expect(rex.match('foo\rbar')).toEqual({ text: 'foo\rbar', captures: {} });
        });

        it('matches non-whitespace', () => {
            const rex = new Rex('foo\\Sbar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo bar')).toBe(undefined);
            expect(rex.match('foo\tbar')).toBe(undefined);
            expect(rex.match('foo\nbar')).toBe(undefined);
            expect(rex.match('foo\rbar')).toBe(undefined);
            expect(rex.match('foorbar')).toEqual({ text: 'foorbar', captures: {} });
            expect(rex.match('foorbarr')).toEqual({ text: 'foorbar', captures: {} });
        });

        it('matches digits', () => {
            const rex = new Rex('foo\\dbar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo bar')).toBeUndefined();
            expect(rex.match('foo0bar')).toEqual({ text: 'foo0bar', captures: {} });
            expect(rex.match('foo5bar')).toEqual({ text: 'foo5bar', captures: {} });
            expect(rex.match('foo9bar')).toEqual({ text: 'foo9bar', captures: {} });
        });

        it('matches non-digits', () => {
            const rex = new Rex('foo\\Dbar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo0bar')).toBeUndefined();
            expect(rex.match('foo5bar')).toBeUndefined();
            expect(rex.match('foo9bar')).toBeUndefined();
            expect(rex.match('foo bar')).toEqual({ text: 'foo bar', captures: {} });
            expect(rex.match('foorbar')).toEqual({ text: 'foorbar', captures: {} });
            expect(rex.match('foorbarr')).toEqual({ text: 'foorbar', captures: {} });
        });

        it('matches word characters', () => {
            const rex = new Rex('foo\\wbar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo bar')).toBeUndefined();
            expect(rex.match('foo0bar')).toEqual({ text: 'foo0bar', captures: {} });
            expect(rex.match('fooAbar')).toEqual({ text: 'fooAbar', captures: {} });
            expect(rex.match('foobbar')).toEqual({ text: 'foobbar', captures: {} });
            expect(rex.match('foo_bar')).toEqual({ text: 'foo_bar', captures: {} });
        });

        it('matches non-word characters', () => {
            const rex = new Rex('foo\\Wbar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo bar')).toEqual({ text: 'foo bar', captures: {} });
            expect(rex.match('foo\tbar')).toEqual({ text: 'foo\tbar', captures: {} });
            expect(rex.match('foo-bar')).toEqual({ text: 'foo-bar', captures: {} });
            expect(rex.match('fooêbar')).toEqual({ text: 'fooêbar', captures: {} });
        });

        it('matches backslashes', () => {
            const rex = new Rex('foo\\\\bar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo\\bar')).toEqual({ text: 'foo\\bar', captures: {} });
        });

        it('matches pipe', () => {
            const rex = new Rex('foo\\|bar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo|bar')).toEqual({ text: 'foo|bar', captures: {} });
        });

        it('matches left paren', () => {
            const rex = new Rex('foo\\(bar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo(bar')).toEqual({ text: 'foo(bar', captures: {} });
        });

        it('matches right paren', () => {
            const rex = new Rex('foo\\)bar');
            expect(rex.match('foobar')).toBeUndefined();
            expect(rex.match('foo)bar')).toEqual({ text: 'foo)bar', captures: {} });
        });

        it('matches line breaks', () => {
            const rex = new Rex('foo\\nbar');
            expect(rex.match('foo\nbar')).toEqual({ text: 'foo\nbar', captures: {} });
        });

        it('matches line feeds', () => {
            const rex = new Rex('foo\\rbar');
            expect(rex.match('foo\rbar')).toEqual({ text: 'foo\rbar', captures: {} });
        });

        it('matches tabs', () => {
            const rex = new Rex('foo\\tbar');
            expect(rex.match('foo\tbar')).toEqual({ text: 'foo\tbar', captures: {} });
        });

        it('escapes regular characters', () => {
            const rex = new Rex('\\a');
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
        });
    });

    describe('dot', () => {
        it('matches any character', () => {
            const rex = new Rex('.');
            expect(rex.match('.')).toEqual({ text: '.', captures: {} });
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match(' ')).toEqual({ text: ' ', captures: {} });
            expect(rex.match('\n')).toEqual({ text: '\n', captures: {} });
            expect(rex.match('8')).toEqual({ text: '8', captures: {} });
            expect(rex.match('ê')).toEqual({ text: 'ê', captures: {} });
        });

        it('is escapable', () => {
            const rex = new Rex('\\.');
            expect(rex.match('.')).toEqual({ text: '.', captures: {} });
            expect(rex.match('a')).toBeUndefined();
            expect(rex.match(' ')).toBeUndefined();
            expect(rex.match('\n')).toBeUndefined();
            expect(rex.match('8')).toBeUndefined();
            expect(rex.match('ê')).toBeUndefined();
        });
    });

    describe('character sets', () => {
        it('matches a basic set of characters', () => {
            const rex = new Rex('[abcd]');
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match('b')).toEqual({ text: 'b', captures: {} });
            expect(rex.match('c')).toEqual({ text: 'c', captures: {} });
            expect(rex.match('d')).toEqual({ text: 'd', captures: {} });
            expect(rex.match('dd')).toEqual({ text: 'd', captures: {} });
            expect(rex.match('dz')).toEqual({ text: 'd', captures: {} });
            expect(rex.match('e')).toBeUndefined();
        });

        it('matches a range', () => {
            const rex = new Rex('[0-9]');
            expect(rex.match('0')).toEqual({ text: '0', captures: {} });
            expect(rex.match('1')).toEqual({ text: '1', captures: {} });
            expect(rex.match('2')).toEqual({ text: '2', captures: {} });
            expect(rex.match('3')).toEqual({ text: '3', captures: {} });
            expect(rex.match('4')).toEqual({ text: '4', captures: {} });
            expect(rex.match('5')).toEqual({ text: '5', captures: {} });
            expect(rex.match('6')).toEqual({ text: '6', captures: {} });
            expect(rex.match('7')).toEqual({ text: '7', captures: {} });
            expect(rex.match('8')).toEqual({ text: '8', captures: {} });
            expect(rex.match('9')).toEqual({ text: '9', captures: {} });
            expect(rex.match('a')).toBeUndefined();
            expect(rex.match('-')).toBeUndefined();
        });

        it('matches characters and ranges', () => {
            const rex = new Rex('[a-z0-9ABC]');
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match('z')).toEqual({ text: 'z', captures: {} });
            expect(rex.match('0')).toEqual({ text: '0', captures: {} });
            expect(rex.match('1')).toEqual({ text: '1', captures: {} });
            expect(rex.match('8')).toEqual({ text: '8', captures: {} });
            expect(rex.match('9')).toEqual({ text: '9', captures: {} });
            expect(rex.match('A')).toEqual({ text: 'A', captures: {} });
            expect(rex.match('B')).toEqual({ text: 'B', captures: {} });
            expect(rex.match('C')).toEqual({ text: 'C', captures: {} });
            expect(rex.match('D')).toBeUndefined();
        });

        it('allows an unescaped dash at the end', () => {
            const rex = new Rex('[ab-]');
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match('b')).toEqual({ text: 'b', captures: {} });
            expect(rex.match('-')).toEqual({ text: '-', captures: {} });
            expect(rex.match('c')).toBeUndefined();
        });

        it('allows an escaped dash in the middle', () => {
            const rex = new Rex('[a\\-z]');
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match('z')).toEqual({ text: 'z', captures: {} });
            expect(rex.match('-')).toEqual({ text: '-', captures: {} });
            expect(rex.match('b')).toBeUndefined();
            expect(rex.match('y')).toBeUndefined();
        });

        it('matches digit sets', () => {
            const rex = new Rex('[\\d]');
            expect(rex.match('0')).toEqual({ text: '0', captures: {} });
            expect(rex.match('5')).toEqual({ text: '5', captures: {} });
            expect(rex.match('9')).toEqual({ text: '9', captures: {} });
            expect(rex.match('a')).toBeUndefined();
        });

        it('matches non-digit sets', () => {
            const rex = new Rex('[\\D]');
            expect(rex.match('0')).toBeUndefined();
            expect(rex.match('5')).toBeUndefined();
            expect(rex.match('9')).toBeUndefined();
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
        });

        it('matches whitespace sets', () => {
            const rex = new Rex('[\\s]');
            expect(rex.match(' ')).toEqual({ text: ' ', captures: {} });
            expect(rex.match('\t')).toEqual({ text: '\t', captures: {} });
            expect(rex.match('\r')).toEqual({ text: '\r', captures: {} });
            expect(rex.match('a')).toBeUndefined();
        });

        it('matches non-whitespace sets', () => {
            const rex = new Rex('[\\S]');
            expect(rex.match(' ')).toBeUndefined();
            expect(rex.match('\t')).toBeUndefined();
            expect(rex.match('\r')).toBeUndefined();
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
        });

        it('matches word sets', () => {
            const rex = new Rex('[\\w]');
            expect(rex.match('0')).toEqual({ text: '0', captures: {} });
            expect(rex.match('_')).toEqual({ text: '_', captures: {} });
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match(' ')).toBeUndefined();
        });

        it('matches non-word sets', () => {
            const rex = new Rex('[\\W]');
            expect(rex.match('0')).toBeUndefined();
            expect(rex.match('_')).toBeUndefined();
            expect(rex.match('a')).toBeUndefined();
            expect(rex.match(' ')).toEqual({ text: ' ', captures: {} });
            expect(rex.match('-')).toEqual({ text: '-', captures: {} });
        });

        it('matches a unicode escape sequence', () => {
            const rex = new Rex('[\\u{1F420}-\\u{1F42F}]');
            expect(rex.match('🐠')).toEqual({ text: '🐠', captures: {} });
            expect(rex.match('🐧')).toEqual({ text: '🐧', captures: {} });
            expect(rex.match('🐯')).toEqual({ text: '🐯', captures: {} });
            expect(rex.match('🐟')).toBeUndefined();
            expect(rex.match('🐰')).toBeUndefined();
        });

        describe('negated', () => {
            it('does not match negated characters', () => {
                const rex = new Rex('[^ABC]');
                expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
                expect(rex.match('D')).toEqual({ text: 'D', captures: {} });
                expect(rex.match('A')).toBeUndefined();
                expect(rex.match('B')).toBeUndefined();
                expect(rex.match('C')).toBeUndefined();
            });

            it('does not match negated ranges', () => {
                const rex = new Rex('[^0-9]');
                expect(rex.match('A')).toEqual({ text: 'A', captures: {} });
                expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
                expect(rex.match('0')).toBeUndefined();
            });

            it('matches the ^ character when not at the beginning', () => {
                const rex = new Rex('[a^]');
                expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
                expect(rex.match('^')).toEqual({ text: '^', captures: {} });
                expect(rex.match('0')).toBeUndefined();
            });

            it('matches the ^ character when escaped', () => {
                const rex = new Rex('[\\^]');
                expect(rex.match('^')).toEqual({ text: '^', captures: {} });
                expect(rex.match('a')).toBeUndefined();
            });
        });

        describe('repeated', () => {
            it('matches repeated sets', () => {
                const rex = new Rex('[a-zA-Z]+[a-zA-Z0-9]*');
                expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
                expect(rex.match('AA')).toEqual({ text: 'AA', captures: {} });
                expect(rex.match('aZ')).toEqual({ text: 'aZ', captures: {} });
                expect(rex.match('aZ9')).toEqual({ text: 'aZ9', captures: {} });
                expect(rex.match('a9')).toEqual({ text: 'a9', captures: {} });
                expect(rex.match('9')).toBeUndefined();
                expect(rex.match('9a')).toEqual({ text: 'a', captures: {} });
                expect(rex.match('9a7')).toEqual({ text: 'a7', captures: {} });
            });
        });

        it('throws an error when a character set is not closed', () => {
            expect(() => {
                new Rex('[a-b');
            }).toThrowErrorMatchingInlineSnapshot(`"Invalid character set"`);
        });
    });

    describe('zero-or-more', () => {
        it('matches a repeated character at the end', () => {
            const rex = new Rex('foo*');
            expect(rex.match('f')).toBeUndefined();
            expect(rex.match('fo')).toEqual({ text: 'fo', captures: {} });
            expect(rex.match('foo')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('fooo')).toEqual({ text: 'fooo', captures: {} });
        });

        it('matches a repeated character in the middle', () => {
            const rex = new Rex('foo*bar');
            expect(rex.match('f')).toBeUndefined();
            expect(rex.match('fbar')).toBeUndefined();
            expect(rex.match('fobar')).toEqual({ text: 'fobar', captures: {} });
            expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
            expect(rex.match('fooobar')).toEqual({ text: 'fooobar', captures: {} });
            expect(rex.match('foooobar')).toEqual({ text: 'foooobar', captures: {} });
        });
    });

    describe('one-or-more', () => {
        it('matches a repeated character', () => {
            const rex = new Rex('foo+');
            expect(rex.match('f')).toBeUndefined();
            expect(rex.match('fo')).toBeUndefined();
            expect(rex.match('foo')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('fooo')).toEqual({ text: 'fooo', captures: {} });
        });

        it('matches a repeated character in the middle', () => {
            const rex = new Rex('foo+bar');
            expect(rex.match('f')).toBeUndefined();
            expect(rex.match('fbar')).toBeUndefined();
            expect(rex.match('fobar')).toBeUndefined();
            expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
            expect(rex.match('fooobar')).toEqual({ text: 'fooobar', captures: {} });
            expect(rex.match('foooobar')).toEqual({ text: 'foooobar', captures: {} });
        });
    });

    describe('zero-or-one', () => {
        it('matches a repeated character', () => {
            const rex = new Rex('foo?');
            expect(rex.match('f')).toBeUndefined();
            expect(rex.match('fo')).toEqual({ text: 'fo', captures: {} });
            expect(rex.match('foo')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('fooo')).toEqual({ text: 'foo', captures: {} });
        });

        it('matches a repeated character in the middle', () => {
            const rex = new Rex('foo?bar');
            expect(rex.match('f')).toBeUndefined();
            expect(rex.match('fbar')).toBeUndefined();
            expect(rex.match('fobar')).toEqual({ text: 'fobar', captures: {} });
            expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
            expect(rex.match('fooobar')).toBeUndefined();
            expect(rex.match('foooobar')).toBeUndefined();
        });
    });

    describe('non-greedy matchers', () => {
        describe('non-greedy zero-or-more', () => {
            it('matches simple zero-or-more', () => {
                const rex = new Rex('".*?"');
                expect(rex.match('"asdf"asdf"')).toEqual({ text: '"asdf"', captures: {} });
            });

            it('matches zero length zero-or-more', () => {
                const rex = new Rex('.*?aaaa');
                expect(rex.match('aaaa')).toEqual({ text: 'aaaa', captures: {} });
                expect(rex.match('aaaaaa')).toEqual({ text: 'aaaa', captures: {} });
                expect(rex.match('baaaa')).toEqual({ text: 'baaaa', captures: {} });
            });
        });

        describe('non-greedy one-or-more', () => {
            it('matches simple one-or-more', () => {
                const rex = new Rex('".+?"');
                expect(rex.match('"asdf"asdf"')).toEqual({ text: '"asdf"', captures: {} });
            });

            it('matches one length one-or-more', () => {
                const rex = new Rex('.+?aaa');
                expect(rex.match('aaa')).toBeUndefined();
                expect(rex.match('aaaa')).toEqual({ text: 'aaaa', captures: {} });
                expect(rex.match('aaaaaa')).toEqual({ text: 'aaaa', captures: {} });
                expect(rex.match('baaaa')).toEqual({ text: 'baaa', captures: {} });
            });

            it('tracks two non-greedy one-or-more matchers', () => {
                const rex = new Rex('[aeiou]+?(ou)+?ou');
                expect(rex.match('aieououououou')).toEqual({ text: 'aieouou', captures: {} });
            });

            it('works alongside greedy matchers', () => {
                const rex = new Rex('.+?[a-z]+');
                expect(rex.match('89abcde')).toEqual({ text: '89abcde', captures: {} })
            });
        });
    });

    describe('groups', () => {
        describe('matches a group', () => {
            it('matches a standalone group', () => {
                const rex = new Rex('(foo)');
                expect(rex.match('fo')).toBeUndefined();
                expect(rex.match('foo')).toEqual({ text: 'foo', captures: {} });
                expect(rex.match('fooo')).toEqual({ text: 'foo', captures: {} });
            });

            it('matches a group at the beginning', () => {
                const rex = new Rex('(foo)bar');
                expect(rex.match('fo')).toBeUndefined();
                expect(rex.match('foo')).toBeUndefined();
                expect(rex.match('fooba')).toBeUndefined();
                expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
                expect(rex.match('foobaro')).toEqual({ text: 'foobar', captures: {} });
            });

            it('matches a group at the end', () => {
                const rex = new Rex('bar(foo)');
                expect(rex.match('bar')).toBeUndefined();
                expect(rex.match('barfo')).toBeUndefined();
                expect(rex.match('barfoo')).toEqual({ text: 'barfoo', captures: {} });
                expect(rex.match('barfooo')).toEqual({ text: 'barfoo', captures: {} });
            });

            it('matches a group in the middle', () => {
                const rex = new Rex('fo(ob)ar');
                expect(rex.match('foo')).toBeUndefined();
                expect(rex.match('bar')).toBeUndefined();
                expect(rex.match('foob')).toBeUndefined();
                expect(rex.match('obbar')).toBeUndefined();
                expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
                expect(rex.match('foobarr')).toEqual({ text: 'foobar', captures: {} });
            });
        });

        describe('optional groups', () => {
            it('matches zero or more groups in the beginning', () => {
                const rex = new Rex('(foo)*bar');
                expect(rex.match('foo')).toBeUndefined();
                expect(rex.match('foob')).toBeUndefined();
                expect(rex.match('bar')).toEqual({ text: 'bar', captures: {} });
                expect(rex.match('obar')).toEqual({ text: 'bar', captures: {} });
                expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
                expect(rex.match('foofoobar')).toEqual({ text: 'foofoobar', captures: {} });
                expect(rex.match('foobarbar')).toEqual({ text: 'foobar', captures: {} });
            });

            it('matches zero or more groups at the end', () => {
                const rex = new Rex('foo(bar)*');
                expect(rex.match('bar')).toBeUndefined();
                expect(rex.match('obar')).toBeUndefined();
                expect(rex.match('foo')).toEqual({ text: 'foo', captures: {} });
                expect(rex.match('foob')).toEqual({ text: 'foo', captures: {} });
                expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
                expect(rex.match('foobarbar')).toEqual({ text: 'foobarbar', captures: {} });
                expect(rex.match('foobarbarbar')).toEqual({ text: 'foobarbarbar', captures: {} });
                expect(rex.match('foobarbarbarfoo')).toEqual({ text: 'foobarbarbar', captures: {} });
            });

            it('matches zero or more groups in the middle', () => {
                const rex = new Rex('fo(ob)*ar');
                expect(rex.match('foo')).toBeUndefined();
                expect(rex.match('bar')).toBeUndefined();
                expect(rex.match('foob')).toBeUndefined();
                expect(rex.match('obbar')).toBeUndefined();
                expect(rex.match('foar')).toEqual({ text: 'foar', captures: {} });
                expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
                expect(rex.match('foobobar')).toEqual({ text: 'foobobar', captures: {} });
                expect(rex.match('fobobar')).toBeUndefined();
                expect(rex.match('foobbar')).toBeUndefined();
            });
        });

        describe('one-or-more groups', () => {
            it('matches one or more groups in the beginning', () => {
                const rex = new Rex('(foo)+bar');
                expect(rex.match('foo')).toBeUndefined();
                expect(rex.match('foob')).toBeUndefined();
                expect(rex.match('obar')).toBeUndefined();
                expect(rex.match('bar')).toBeUndefined();
                expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
                expect(rex.match('foofoobar')).toEqual({ text: 'foofoobar', captures: {} });
                expect(rex.match('foobarbar')).toEqual({ text: 'foobar', captures: {} });
            });

            it('matches one or more groups at the end', () => {
                const rex = new Rex('foo(bar)+');
                expect(rex.match('bar')).toBeUndefined();
                expect(rex.match('obar')).toBeUndefined();
                expect(rex.match('foo')).toBeUndefined();
                expect(rex.match('foob')).toBeUndefined();
                expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
                expect(rex.match('foobarbar')).toEqual({ text: 'foobarbar', captures: {} });
                expect(rex.match('foobarbarbar')).toEqual({ text: 'foobarbarbar', captures: {} });
                expect(rex.match('foobarbarbarfoo')).toEqual({ text: 'foobarbarbar', captures: {} });
            });

            it('matches one or more groups in the middle', () => {
                const rex = new Rex('fo(ob)+ar');
                expect(rex.match('foo')).toBeUndefined();
                expect(rex.match('bar')).toBeUndefined();
                expect(rex.match('foob')).toBeUndefined();
                expect(rex.match('obbar')).toBeUndefined();
                expect(rex.match('foar')).toBeUndefined();
                expect(rex.match('foobar')).toEqual({ text: 'foobar', captures: {} });
                expect(rex.match('foobobar')).toEqual({ text: 'foobobar', captures: {} });
                expect(rex.match('fobobar')).toBeUndefined();
                expect(rex.match('foobbar')).toBeUndefined();
            });
        });

        it('throws an error when parenthesis are unbalanced', () => {
            expect(() => {
                new Rex('(abc');
            }).toThrowErrorMatchingInlineSnapshot(`"Unbalanced parentheses"`);
            expect(() => {
                new Rex('(ab(c)');
            }).toThrowErrorMatchingInlineSnapshot(`"Unbalanced parentheses"`);

            expect(() => {
                new Rex('abc)');
            }).toThrowErrorMatchingInlineSnapshot(`"Unexpected token \\")\\""`);
            expect(() => {
                new Rex('(abc))');
            }).toThrowErrorMatchingInlineSnapshot(`"Unexpected token \\")\\""`);
        });

        describe('capturing', () => {
            it('records the matched text in a group', () => {
                const rex = new Rex('\\d+([a-z]+)');
                expect(rex.match('123test')).toEqual({
                    text: '123test',
                    captures: {}
                });
            });

            it('records the matched text in a named group', () => {
                const rex = new Rex('\\d+(?<some_text>[a-z]+)');
                expect(rex.match('123test')).toEqual({
                    text: '123test',
                    captures: {
                        some_text: 'test',
                    }
                });
            });
        });
    });

    describe('ORs', () => {
        it('matches a OR b', () => {
            const rex = new Rex('a|b');
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match('ab')).toEqual({ text: 'a', captures: {} });
            expect(rex.match('b')).toEqual({ text: 'b', captures: {} });
            expect(rex.match('ba')).toEqual({ text: 'b', captures: {} });
            expect(rex.match('c')).toBeUndefined();
        });

        it('matches foo OR bar', () => {
            const rex = new Rex('foo|bar');
            expect(rex.match('f')).toBeUndefined();
            expect(rex.match('o')).toBeUndefined();
            expect(rex.match('b')).toBeUndefined();
            expect(rex.match('a')).toBeUndefined();
            expect(rex.match('r')).toBeUndefined();
            expect(rex.match('foo')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('bar')).toEqual({ text: 'bar', captures: {} });
            expect(rex.match('foobar')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('bar')).toEqual({ text: 'bar', captures: {} });
        });

        it('matches foo OR bar OR buzz', () => {
            const rex = new Rex('foo|bar|buzz');
            expect(rex.match('foo')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('bar')).toEqual({ text: 'bar', captures: {} });
            expect(rex.match('buzz')).toEqual({ text: 'buzz', captures: {} });
            expect(rex.match('foobar')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('foobuzz')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('buzzfoo')).toEqual({ text: 'buzz', captures: {} });
        });
    });

    describe('match beginning', () => {
        it('binds the matcher to the start of the input', () => {
            const rex = new Rex('^(a|b)c');
            expect(rex.match('ac')).toEqual({ text: 'ac', captures: {} });
            expect(rex.match('bc')).toEqual({ text: 'bc', captures: {} });
            expect(rex.match('zac')).toBeUndefined();
            expect(rex.match('zbc')).toBeUndefined();
        });

        it('does not bind to the start if not instructed', () => {
            const rex = new Rex('(a|b)c');
            expect(rex.match('ac')).toEqual({ text: 'ac', captures: {} });
            expect(rex.match('bc')).toEqual({ text: 'bc', captures: {} });
            expect(rex.match('zac')).toEqual({ text: 'ac', captures: {} });
            expect(rex.match('zbc')).toEqual({ text: 'bc', captures: {} });
        });
    });

    describe('match ending', () => {
        it('binds the matcher to the end of the input', () => {
            const rex = new Rex('ab$');
            expect(rex.match('ab')).toEqual({ text: 'ab', captures: {} });
            expect(rex.match('foobarab')).toEqual({ text: 'ab', captures: {} });
            expect(rex.match('abc')).toBeUndefined();
        });

        it('does not bind to the end if not instructed', () => {
            const rex = new Rex('ab');
            expect(rex.match('ab')).toEqual({ text: 'ab', captures: {} });
            expect(rex.match('foobarab')).toEqual({ text: 'ab', captures: {} });
            expect(rex.match('abc')).toEqual({ text: 'ab', captures: {} });
        });

        it('allows the $ token to be anywhere in the input string', () => {
            const rex = new Rex('a($|b)');
            expect(rex.match('ab')).toEqual({ text: 'ab', captures: {} });
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match('ac')).toBeUndefined();
        });
    });

    describe('bound to start and end', () => {
        it('only matches when the entire string is matched', () => {
            const rex = new Rex('^a(b|c)d$');
            expect(rex.match('abd')).toEqual({ text: 'abd', captures: {} });
            expect(rex.match('acd')).toEqual({ text: 'acd', captures: {} });
            expect(rex.match('aabd')).toBeUndefined();
            expect(rex.match('acde')).toBeUndefined();
        });
    });

    describe('lookahead assertion', () => {
        it('matches lookahead without reporting the match', () => {
            const rex = new Rex('foo(?=bar)');
            expect(rex.match('foobar')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('foobarr')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('foo')).toBeUndefined();
        });

        it('captures only expected text', () => {
            const rex = new Rex('(?<value>[^\\|]+?)\\s+(?=\\|)');
            expect(rex.match('Test   |')).toEqual({ text: 'Test   ', captures: { value: 'Test' } });
            expect(rex.match('A Test    |')).toEqual({ text: 'A Test    ', captures: { value: 'A Test' } });
        });

        it('captures only expected text (2)', () => {
            const rex = new Rex('(?<value>[^\\|]+?)(?=\\s+\\|)');
            expect(rex.match('Test   |')).toEqual({ text: 'Test', captures: { value: 'Test' } });
            expect(rex.match('A Test    |')).toEqual({ text: 'A Test', captures: { value: 'A Test' } });
        });
    });

    describe('complex', () => {
        it('matches a nested group', () => {
            const rex = new Rex('((foo|buzz)|bar)|fizz');
            expect(rex.match('foo')).toEqual({ text: 'foo', captures: {} });
            expect(rex.match('buzz')).toEqual({ text: 'buzz', captures: {} });
            expect(rex.match('bar')).toEqual({ text: 'bar', captures: {} });
            expect(rex.match('fizz')).toEqual({ text: 'fizz', captures: {} });
            expect(rex.match('fizzfoo')).toEqual({ text: 'fizz', captures: {} });
            expect(rex.match('barfoo')).toEqual({ text: 'bar', captures: {} });
            expect(rex.match('buzzfoo')).toEqual({ text: 'buzz', captures: {} });
        });

        it('matches a string-like value with escapes', () => {
            const rex = new Rex('"(?<value>([^\\\\]|\\\\.)*?)"');
            expect(rex.match('var value = "test"')).toEqual({
                text: '"test"',
                captures: { value: 'test' }
            });

            expect(rex.match('var value = "this \\n has \\\\ \\"escapes\\" in it"')).toEqual({
                text: '"this \\n has \\\\ \\"escapes\\" in it"',
                captures: { value: 'this \\n has \\\\ \\"escapes\\" in it' }
            });
        });
    });

    describe('pathological cases', () => {
        const input = 'aaaaaaaaaaaaaaaaaaaaaaa!';

        it('(a+)+', () => {
            expect(timeMe(() => {
                new Rex('(a|aa)+').match(input);
            })).toBeLessThan(10);
        });

        it('([a-zA-Z]+)*', () => {
            expect(timeMe(() => {
                new Rex('([a-zA-Z]+)*').match(input);
            })).toBeLessThan(10);
        });

        it('(a|aa)+', () => {
            expect(timeMe(() => {
                new Rex('(a|aa)+').match(input);
            })).toBeLessThan(10);
        });
    });

    describe('unicode', () => {
        it('matches a unicode escape sequence', () => {
            const rex = new Rex('\\u{1f419}');
            const octopus = '🐙';
            expect(rex.match(octopus)).toEqual({ text: octopus, captures: {} });
        });

        it('matches a unicode character as a single character', () => {
            const rex = new Rex('.');
            const octopus = '🐙';
            expect(rex.match(octopus)).toEqual({ text: octopus, captures: {} });
            expect(rex.match(octopus + octopus)).toEqual({ text: octopus, captures: {} });
        });

        it('matches multiple unicode characters', () => {
            const rex = new Rex('.+');
            const deepsea = '🐳🐙';
            expect(rex.match(deepsea)).toEqual({ text: deepsea, captures: {} });
        });

        it('matches a specific unicode character', () => {
            const rex = new Rex('🐙');
            expect(rex.match('🐳🐙')).toEqual({ text: '🐙', captures: {} });
        });

        it('matches mix of unicode and single-byte characters in character sets', () => {
            const rex = new Rex('[a🐢]');
            expect(rex.match('a')).toEqual({ text: 'a', captures: {} });
            expect(rex.match('🐢')).toEqual({ text: '🐢', captures: {} });
            expect(rex.match('b')).toBeUndefined();
        });

        it('matches unicode characters in character set ranges', () => {
            const rex = new Rex('[👑-👢]');
            expect(rex.match('👑')).toEqual({ text: '👑', captures: {} });
            expect(rex.match('👢')).toEqual({ text: '👢', captures: {} });
            expect(rex.match('👖')).toEqual({ text: '👖', captures: {} });
            expect(rex.match('🐸')).toBeUndefined();
            expect(rex.match('👷')).toBeUndefined();
            expect(rex.match('b')).toBeUndefined();
        });

        it('captures unicode characters', () => {
            const rex = new Rex('.(?<group>[💓-💟]+)');
            expect(rex.match('💤💣💗💕💔🔍')).toEqual({
                text: '💣💗💕💔',
                captures: {
                    group: '💗💕💔'
                }
            })
        });
    });
});

function timeMe(fn: () => void) {
    const start = Date.now();
    fn();
    const end = Date.now();
    return end - start;
}