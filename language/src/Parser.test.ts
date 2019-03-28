import Parser from './Parser';

describe('Parser', () => {
    describe('parsing', () => {
        it('parses a thing', () => {
            const scanner = new Parser(`
// JSON
#token LEFT_BRACE {
#token RIGHT_BRACE }
#token LEFT_BRACKET \\[
#token RIGHT_BRACKET \\]
#token COLON :
#token COMMA ,

#expr JsonArray = LEFT_BRACKET ((?<values>JsonValue) (COMMA (?<values>JsonValue))*)? RIGHT_BRACKET
#expr JsonObject = LEFT_BRACE ((?<values>JsonObjectAssignment) (COMMA (?<values>JsonObjectAssignment))*)? RIGHT_BRACE

#expr JsonObjectAssignment = (?<key>STRING_LITERAL) COLON (?<value>JsonValue)

#expr JsonValue = (?<value>JsonLiteral | JsonArray | JsonObject)

// Literals
#token NUMERIC_LITERAL (?<raw>-?\\d+(\\.\\d+)?)
#token BOOLEAN_LITERAL (?<raw>true|false)
#token STRING_LITERAL "(?<raw>([^\\\\]|\\\\.)*?)"

#expr JsonLiteral = (?<value>NUMERIC_LITERAL | BOOLEAN_LITERAL | STRING_LITERAL)

[{"name": "John", "age": 30}, true]
        `);
            // scanner.scan();
            // scanner.tokens.forEach(token => console.log(token.toString()));
            // scanner.scanErrors.forEach(error => console.error(error.toString()));
            // scanner.expressions.forEach(expression => console.log(JSON.stringify(expression, null, 2)));
            const parseResult = scanner.parse();
            console.log(JSON.stringify(
                parseResult,
                null,
                2
            ));
        });

        it('precedence', () => {
            const scanner = new Parser(`
#token PLUS +
#token MINUS -
#token MULT \\*
#token DIVIDE \\\\

#token NUMBER (?<value>-?\\d+(\\.\\d+)?)

#expr Numeric = (?<number>NUMBER)

#expr HighP = (?<value>Numeric)
#expr HighP = (?<left>Numeric) (?<op>MULT|DIVIDE) (?<right>HighP)

#expr LowP = (?<value>HighP)
#expr LowP = (?<left>HighP) (?<op>PLUS|MINUS) (?<right>LowP)

1 + 3 * 2
        `);
            // scanner.scan();
            // scanner.tokens.forEach(token => console.log(token.toString()));
            // scanner.scanErrors.forEach(error => console.error(error.toString()));
            // scanner.expressions.forEach(expression => console.log(JSON.stringify(expression, null, 2)));
            const parseResult = scanner.parse();
            console.log(
                JSON.stringify(
                    parseResult,
                    null,
                    2
                )
            );
        });

        it('reports expectations at incomplete syntax', () => {
            const scanner = new Parser(`
// JSON parser following the spec at https://www.json.org/

#token NUMBER (?<value>-?(\\d|[1-9]\\d+)(\\.\\d+)?([eE](+|-)?\\d+)?)
#token STRING "(?<value>([^\\\\"]|\\\\(["\\\\/bfnrt]|u\\d\\d\\d\\d))*)"
#token BOOLEAN (?<value>true|false)
#token NULL null

#token LEFT_PAREN \\[
#token RIGHT_PAREN \\]
#token COMMA ,

#token LEFT_BRACE {
#token RIGHT_BRACE }
#token COLON :

#expr Array = LEFT_PAREN ( (?<values>Value) ( COMMA (?<values>Value) )* )? RIGHT_PAREN

#expr Object = LEFT_BRACE ( (?<assignments>ObjectAssignment) ( COMMA (?<assignments>ObjectAssignment) )* )? RIGHT_BRACE
#expr ObjectAssignment = (?<key>STRING) COLON (?<value>Value)

#expr Value = (?<value>Object|Array|NUMBER|STRING|BOOLEAN|NULL)

{
    "books": [
        5,
    ]
}


        `);
            // scanner.scan();
            // scanner.tokens.forEach(token => console.log(token.toString()));
            // scanner.scanErrors.forEach(error => console.error(error.toString()));
            // scanner.expressions.forEach(expression => console.log(JSON.stringify(expression, null, 2)));
            const parseResult = scanner.parse();
            console.log(
                JSON.stringify(
                    parseResult,
                    null,
                    2
                )
            );
        });
    });
});
