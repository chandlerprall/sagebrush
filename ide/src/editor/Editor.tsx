import * as React from 'react';
import {createPortal} from 'react-dom';
import * as monaco from 'monaco-editor';
import {Parser} from '@sagebrush/language';
import ParserOverlay from './ParserOverlay';
import './Editor.scss';

const presets = {
    names: `
#token SEMICOLON ;
#token NAME (?<name>[a-zA-Z]+)
#token COMMA ,

#expr Names = (?<names>NAME) (COMMA (?<names>NAME))* SEMICOLON

John, Francine, Meghan;
`,
    json: `
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

{"name": "John", "age": 33, "children": [
    {"name":"Meghan", "age": 12},
    {"name" : "Charles", "age":6}
]}
`
};

monaco.languages.register({
    id: 'sagebrush',
    extensions: ['.ss'],
    mimetypes: ['text/sagebrush'],
    aliases: ['sagebrush'],
});

monaco.languages.onLanguage('sagebrush', () => {
    return new Promise(resolve => {
        monaco.languages.setMonarchTokensProvider(
            'sagebrush',
            {
                ignoreCase: true,
                defaultToken: 'invalid',
                brackets: [
                    {open: '{', close: '}', token: 'delimiter.curly'},
                    {open: '[', close: ']', token: 'delimiter.square'},
                ],
                tokenizer: {
                    root: [
                        [/[{}\[\]]/, '@brackets'],

                        { include: '@whitespace' },
                        { include: '@comment' },
                        { include: '@literal' },
                        { include: '@languageExtensionKeyword' },
                    ],

                    comment: [
                        [/\/*.*?\*\//, 'comment'],
                        [/\/\/.*?$/, 'comment'],
                    ],

                    whitespace: [
                        [/[ \t\n\r]+/, 'whitespace'],
                    ],

                    literal: [
                        [/true|false/, 'keyword'],
                        [/\d+(\.\d+)?/, 'number'],
                        [/"([^\\]|\\.)*?"/, 'string'],
                    ],

                    languageExtensionKeyword: [
                        [/#(expr|token)\s+/, { token: 'keyword', next: '@languageExtensionIdentifier' }],
                    ],
                    languageExtensionIdentifier: [
                        [/[^\s]+\s*(=\s*)?/, { token: 'identifier', next: '@languageExtensionValue' }]
                    ],
                    languageExtensionValue: [
                        [/.+/, { token: 'type', next: '@popall' }]
                    ],
                }
            },
        );

        monaco.languages.setLanguageConfiguration(
            'sagebrush',
            {
                autoClosingPairs: [
                    { open: '{', close: '}' },
                    { open: '[', close: ']' },
                    { open: '/*', close: '*/' },
                    { open: '"', close: '"' },
                ],
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                ],
                comments: {
                    blockComment: ['/*', '*/'],
                    lineComment: '//',
                },
                wordPattern: /[^{}\[\],"]/g,
            }
        );

        resolve();
    });
});

interface EditorProps {}

interface EditorState {
    parser: {
        scanErrors: Parser['scanErrors'],
        result: null | Error | ReturnType<Parser['parse']>,
    }
}

function isError(x: any): x is Error {
    return x instanceof Error;
}

export default class Editor extends React.Component<EditorProps, EditorState> {
    editor?: ReturnType<typeof monaco['editor']['create']>;
    parserStatusContentOverlay: HTMLDivElement;
    parserStatusExpectedOverlay: HTMLDivElement;

    constructor(props: EditorProps, state: EditorState) {
        super(props, state);

        this.state ={
            parser: {
                scanErrors: [],
                result: null,
            }
        };

        this.parserStatusContentOverlay = document.createElement('div');
        this.parserStatusExpectedOverlay = document.createElement('div');
    }

    componentDidMount() {
        this.parseSource();
    }

    componentWillUnmount() {
        if (this.editor != null) {
            this.editor.dispose();
        }
    }

    parseSource = () => {
        // @ts-ignore
        this.editor!.removeContentWidget({
            getId: () => 'expectedOverlay',
        });

        if (this.editor != null) {
            const source = this.editor.getValue();

            const parser = new Parser(source);
            let result: Error | ReturnType<Parser['parse']>;
            try {
                parser.scan();
                result = parser.parse();
            } catch (e) {
                result = e;
            }

            this.setState({
                parser: {
                    scanErrors: parser.scanErrors,
                    result,
                }
            });

            if (!isError(result)) {
                if (result.isCompleteMatch === false) {
                    const expected = result.expected;

                    const lastValidToken = parser.tokens[Math.min(result.matchedTokens, parser.tokens.length) - 1];

                    this.editor.addContentWidget({
                        getId: () => 'expectedOverlay',
                        getDomNode: () => this.parserStatusExpectedOverlay,
                        getPosition() {
                            return {
                                position: {
                                    column: lastValidToken.location.end.column,
                                    lineNumber: lastValidToken.location.end.line,
                                },
                                preference: [1, 2, 0] // ABOVE, BELOW, EXACT
                            };
                        }
                    });
                }
            }
        }
    }

    mountEditor = (editorDiv: HTMLDivElement | null) => {
        if (this.editor != null) {
            this.editor.dispose();
        }

        if (editorDiv != null) {
            this.editor = monaco.editor.create(
                editorDiv,
                {
                    value: presets['json'],
                    language: 'sagebrush'
                }
            );

            this.editor.addOverlayWidget({
                getId: () => 'parserStatus',
                getDomNode: () => this.parserStatusContentOverlay,
                getPosition: () => ({
                    preference: 0 // OverlayWidgetPositionPreference.TOP_RIGHT_CORNER
                })
            });

            this.editor.onDidChangeCursorPosition(({position}) => {
                this.parseSource();
            });
        }
    }

    setPresetValue = (preset: keyof typeof presets) => {
        this.editor!.setValue(presets[preset]);
    }

    render() {
        return (
            <React.Fragment>
                <div styleName="presets">
                    choose preset
                    <button onClick={() => this.setPresetValue('json')}>JSON</button>
                    <button onClick={() => this.setPresetValue('names')}>Names</button>
                </div>
                <div className="fullsize" ref={this.mountEditor}/>
                {this.state.parser.result != null
                ? (
                    <React.Fragment>
                        {createPortal(
                            // @ts-ignore-next-line
                            <ParserOverlay {...this.state.parser}/>,
                            this.parserStatusContentOverlay
                        )}
                        {
                            !isError(this.state.parser.result)
                            ? createPortal(
                                <div styleName="expectedOverlay">
                                    {this.state.parser.result.type} expected {this.state.parser.result.expected.join(' or ')}
                                </div>,
                                this.parserStatusExpectedOverlay
                                )
                            : null
                        }
                    </React.Fragment>
                ) : null}
            </React.Fragment>
        );
    }
}