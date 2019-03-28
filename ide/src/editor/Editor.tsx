import * as React from 'react';
import {createPortal} from 'react-dom';
import * as monaco from 'monaco-editor';
import {
    EuiButtonEmpty,
    EuiCode,
    EuiCodeBlock,
    EuiHeader,
    EuiHeaderBreadcrumbs,
    EuiHeaderSection,
    EuiHeaderSectionItem,
    EuiHeaderSectionItemButton,
    EuiIcon,
    EuiLink,
    EuiModal,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiModalBody,
    EuiModalFooter,
    EuiOverlayMask,
    EuiPanel,
    EuiSpacer,
    EuiText
} from '@elastic/eui';
import {Parser} from '@sagebrush/language';
import ParserOverlay from './ParserOverlay';
import './Editor.scss';

const presets = {
    json: `
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
        {
            "title": "The Great Gatsby",
            "author": "F. Scott Fitzgerald"
        },
        {
            "title": "To Kill a Mockingbird",
            "author": "Harper Lee"
        },
        {
            "title": "1984",
            "author": "George Orwell"
        }
    ]
}

`,
    tabularData: `
#token ROW_SEP -+
#token CELL_SEP \\|
#token CELL_SEP_FINAL \\|[\\r\\n]+

#token CELL_TEXT (?<value>[^-]+?)(?=\\s*\\|)

#expr Table = ROW_SEP ((?<rows>Row) ROW_SEP)+

#expr Row = CELL_SEP (?<cells>CELL_TEXT) (CELL_SEP (?<cells>CELL_TEXT))* CELL_SEP_FINAL

-----------------------------------------------
| Title                 | Author              |
-----------------------------------------------
| The Great Gatsby      | F. Scott Fitzgerald |
-----------------------------------------------
| To Kill a Mockingbird | Harper Lee          |
-----------------------------------------------
| 1984                  | George Orwell       |
-----------------------------------------------
`
};

monaco.languages.register({
    id: 'sagebrush',
    extensions: ['.sb'],
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
    showHelp: boolean;
    parser: {
        result: null | Error | ReturnType<Parser['parse']>,
    }
}

function isError(x: any): x is Error {
    return x instanceof Error;
}

function reduceExpectations(expectations: Array<{ expectant: string, message: string, index: number }>) {
    return expectations.reduce(
        (expected, entry) => {
            if (expected.length === 0) {
                expected.push(entry);
            } else {
                if (entry.index > expected[0].index) {
                    expected = [entry];
                } else if (entry.index === expected[0].index) {
                    expected.push(entry);
                }
            }

            return expected;
        },
        [] as Array<{ expectant: string, message: string, index: number}>
    );
}

export default class Editor extends React.Component<EditorProps, EditorState> {
    editor?: ReturnType<typeof monaco['editor']['create']>;
    parserStatusContentOverlay: HTMLDivElement;
    parserStatusExpectedOverlay: HTMLDivElement;

    constructor(props: EditorProps, state: EditorState) {
        super(props, state);

        this.state = {
            showHelp: false,
            parser: {
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
                result = parser.parse();
                window.source=  parser.source;
            } catch (e) {
                result = e;
            }

            this.setState({
                parser: {
                    result,
                }
            });

            if (!isError(result)) {
                if (result.expected.length > 0) {
                    const expected = reduceExpectations(result.expected);

                    const source = this.editor.getValue();
                    let lineNumber = 1;
                    let column = 1;

                    for (let i = 0; i < expected[0].index; i++) {
                        const char = source[i];

                        if (char === '\n') {
                            lineNumber++;
                            column = 1;
                        } else {
                            column++;
                        }
                    }

                    this.editor.addContentWidget({
                        getId: () => 'expectedOverlay',
                        getDomNode: () => this.parserStatusExpectedOverlay,
                        getPosition() {
                            return {
                                position: {
                                    column,
                                    lineNumber,
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
        const { showHelp } = this.state;
        return (
            <React.Fragment>
                {
                    showHelp
                    ? (
                        <EuiOverlayMask>
                            <EuiModal onClose={() => this.setState({showHelp: false})}>
                                <EuiModalHeader>
                                    <EuiModalHeaderTitle>Sagebrush</EuiModalHeaderTitle>
                                </EuiModalHeader>
                                <EuiModalBody>
                                    <EuiText size="s">
                                        At its core, the Sagebrush parser understands line comments <EuiCode>//</EuiCode> and
                                        block comments <EuiCode>/* */</EuiCode>. It can further be entended with custom
                                        tokens and expressions.
                                    </EuiText>

                                    <EuiSpacer size="l"/>

                                    <EuiText size="s">
                                        Tokens are added with <EuiCode>#token NAME regex</EuiCode>. The regular expressions are matched
                                        by <EuiLink href="https://github.com/chandlerprall/sagebrush/tree/master/rex" target="_blank">@sagebrush/rex</EuiLink> and
                                        can support any of its features.
                                    </EuiText>

                                    <EuiSpacer size="s"/>

                                    <EuiCodeBlock>
                                        // STRING matches anything enclosed by double quotes, including escape sequences<br/>
                                        #token STRING "((?&lt;value&gt;[^\\"])|\\(?&lt;value&gt;.))+"
                                    </EuiCodeBlock>

                                    <EuiSpacer size="s"/>

                                    <EuiText size="s">
                                        Expressions have the form <EuiCode>#expr Name = regex</EuiCode>. These support a subset of regular
                                        expressions for grouping and repetition operators, including non-greedy. Matches are against the
                                        discovered tokens and can also include other expressions. Whitespace in these regular expressions
                                        is ignored.
                                    </EuiText>

                                    <EuiSpacer size="s"/>

                                    <EuiCodeBlock>
                                        #token STRING ".*?"<br/>
                                        #token NUMBER \d+<br/>
                                        #token COLON :<br/>
                                        #token IDENTIFIER [a-zA-Z]+<br/>
                                        <br/>
                                        #expr Value = (?&lt;value&gt;STRING|NUMBER)<br/>
                                        <br/>
                                        #expr Assignment = (?&lt;identifier&gt;IDENTIFIER) COLON (?&lt;value&gt;Value)<br/>
                                        <br/>
                                        value : 125
                                    </EuiCodeBlock>
                                </EuiModalBody>
                                <EuiModalFooter>
                                    <EuiButtonEmpty onClick={() => this.setState({showHelp: false})}>Dismiss</EuiButtonEmpty>
                                </EuiModalFooter>
                            </EuiModal>
                        </EuiOverlayMask>
                    ) : null
                }
                <EuiHeader>
                    <EuiHeaderSection>
                        <EuiHeaderSectionItem>
                            <EuiHeaderSectionItemButton>
                                <EuiIcon type="questionInCircle" size="l" onClick={() => this.setState({showHelp: true})}/>
                            </EuiHeaderSectionItemButton>
                        </EuiHeaderSectionItem>
                    </EuiHeaderSection>
                    <EuiHeaderSection>
                        <EuiHeaderSectionItem>
                            <EuiText size="s" styleName="presets">
                                Examples
                                <EuiButtonEmpty onClick={() => this.setPresetValue('json')}>JSON</EuiButtonEmpty>
                                <EuiButtonEmpty onClick={() => this.setPresetValue('tabularData')}>Tabular Data</EuiButtonEmpty>
                            </EuiText>
                        </EuiHeaderSectionItem>
                    </EuiHeaderSection>
                    <EuiHeaderBreadcrumbs breadcrumbs={[]} />
                    <EuiHeaderSection side="right">
                        <EuiHeaderSectionItem>
                            <EuiText size="s" styleName="gh">
                                <EuiLink href="https://github.com/chandlerprall/sagebrush" target="_blank">
                                    <EuiIcon type="logoGithub" size="m"/>
                                    &nbsp;
                                    https://github.com/chandlerprall/sagebrush
                                </EuiLink>
                            </EuiText>
                        </EuiHeaderSectionItem>
                    </EuiHeaderSection>
                </EuiHeader>
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
                                    {reduceExpectations(this.state.parser.result.expected).map(({ expectant, message }) => `${expectant} expected ${message}`).join(', ')}
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