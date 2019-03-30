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

#expr Program = (?<value>NUMERIC_LITERAL | BOOLEAN_LITERAL | STRING_LITERAL)

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

        it('reports expectations at incomplete syntax', () => {
            const scanner = new Parser(`
#token CHARACTER ((?<word>[^\\\\\\r\\n.*+?^{}$()|[\\]])|\\\\(?<word>[^bBcdDfnrsStvwW0-9xu]))

#token WORD_BOUNDARD \\\\b
#token NOT_WORD_BOUNDARD \\\\B

#token CONTROL_CHARACTER \\\\c(?<control_character>.)

#token DIGIT \\\\d
#token NOT_DIGIT \\\\D

#token FORM_FEED \\\\f

#token LINE_FEED \\\\n

#token CARRIAGE_RETURN \\\\r

#token WHITESPACE \\\\s
#token NOT_WHITESPACE \\\\S

#token TAB \\\\t
#token VERTICAL_TAB \\\\v

#token ALPHANUMERIC \\\\w
#token NOT_ALPHANUMERIC \\\\W

#token BACK_REFERENCE \\\\(?<group_number>[1-9]\\d*)

#token NULL \\\\0

#token TWO_HEX \\\\x(?<hex>[a-zA-Z0-9][a-zA-Z0-9])
#token FOUR_HEX \\\\u(?<hex>[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9])

#token UNICODE \\\\u{(?<hex>[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9])}

#token UP_CARET \\^

#token DOT \\.

#token PIPE \\|
#token STAR \\*
#token PLUS \\+
#token QUESTION_MARK \\?
#token LEFT_BRACE \\{
#token RIGHT_BRACE \\}

#expr Program = (?<program>RegularExpression)

#expr RegularExpression = (?<parts>RegularExpressionAlternation | Group | RegularExpressionPart)+

#expr RegularExpressionB = (?<parts>RegularExpressionAlternation | Group | RegularExpressionPart)+

#expr RegularExpressionAlternation = (?<expressions>RegularExpressionPart) (PIPE (?<expressions>RegularExpressionPart))+

#expr RegularExpressionPart = (?<part>CHARACTER | WORD_BOUNDARY | NOT_WORD_BOUNDARY | CONTROL_CHARACTER | DIGIT | NOT_DIGIT | FORM_FEED | LINE_FEED | CARRIAGE_RETURN | WHITESPACE | NOT_WHITESPACE | TAB | VERTICAL_TAB | ALPHANUMERIC | NOT_ALPHANUMERIC | BACK_REFERENCE | NULL | TWO_HEX | FOUR_HEX | UNICODE | DOT | UP_CARET | DOLLAR | Group | CharacterSet) (?<repetition>RegularExpressionRepetition)?

#token REPETITION_EXACT \\{\\s*(?<value>[1-9]\\d*)\\s*\\}
#token REPETITION_VARIABLE \\{\\s*(?<min>[1-9]\\d*)\\s*,\\s*(?<max>[1-9]\\d*)?\\s*\\}
#expr RegularExpressionRepetition = ((?<zero_or_more>STAR)|(?<one_or_more>PLUS)|(?<one>QUESTION_MARK)|(?<pattern>REPETITION_EXACT|REPETITION_VARIABLE)) (?<non_greedy>QUESTION_MARK)?

#token LEFT_PAREN \\(
#token RIGHT_PAREN \\)
#expr Group = LEFT_PAREN (?<expression>RegularExpressionB)? RIGHT_PAREN

#token LEFT_BRACKET \\[
#token RIGHT_BRACKET \\]
#token CHARACTER_SET_CHARACTER ((?<character>[^\\\\\\]-])|\\\\(?<character>.))
#expr CharacterSet = LEFT_BRACKET (?<negated>UP_CARET)? (?<components>CHARACTER_SET_CHARACTER)* RIGHT_BRACKET

a(b|c)
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
