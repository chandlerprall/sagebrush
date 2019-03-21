import * as React from 'react';
import {Parser} from '@sagebrush/language';
import './ParserOverlay.scss';

interface ParserOverlayNodeProps {
    node: any;
}

interface ParserOverlayNodeState {
    isOpen: boolean;
}

class ParserOverlayNode extends React.Component<ParserOverlayNodeProps, ParserOverlayNodeState> {
    constructor(props: ParserOverlayNodeProps, state: ParserOverlayNodeState) {
        super(props, state);
        this.state = { isOpen: false };
    }

    toggleIsOpen = () => this.setState({ isOpen: !this.state.isOpen })

    render() {
        const { node } = this.props;
        const { isOpen } = this.state;

        const nodeType = typeof node;

        if (node === null) {
            return <span styleName="node-null">null</span>;
        } else if (node === undefined) {
            return <span styleName="node-null">undefined</span>;
        } else if (Array.isArray(node)) {
            return (
                <React.Fragment>
                    <span styleName="node-array mono" onClick={this.toggleIsOpen}>{isOpen ? '-' : '+'} array[{node.length}]</span>
                    {
                            isOpen
                            ? <ul>{node.map((node, idx) =>
                                <li key={idx}>
                                    <span styleName="node-array mono">{idx}</span> <ParserOverlayNode node={node}/>
                                </li>
                            )}</ul>
                            : null
                    }
                </React.Fragment>
            )
        } else if (typeof node === 'object') {
            const keys = Object.keys(node).filter(key => {
                if (key === 'isCompleteMatch') return false;
                if (key === 'expected') return false;
                if (key === 'matchedTokens') return false;
                return true;
            });

            return (
                <React.Fragment>
                    <span styleName="node-object mono" onClick={this.toggleIsOpen}>{isOpen ? '-' : '+'} object[{keys.length}]</span>
                    {
                        isOpen
                            ? <ul>{keys.map((key, idx) =>
                                <li key={idx}>
                                    {key}: <ParserOverlayNode node={node[key]}/>
                                </li>
                            )}</ul>
                            : null
                    }
                </React.Fragment>
            )
        } else {
            return <span styleName={`node-${typeof node}`}>{`${node}`}</span>;
        }
    }
}

interface ParserOverlayProps {
    scanErrors: Parser['scanErrors'],
    result: ReturnType<Parser['parse']>,
}

export default function ParserOverlay({ scanErrors, result }: ParserOverlayProps) {
    return (
        <div styleName="overlay">
            {
                scanErrors.length > 0
                    ? (
                        <React.Fragment>
                            <strong>scan errors</strong>
                            <ul>
                                {scanErrors.map((error, idx) => <li key={idx}>{error.toString()}</li>)}
                            </ul>
                        </React.Fragment>
                    )
                    : null
            }
            {
                result instanceof Error
                ? result.toString()
                : (
                    <React.Fragment>
                        <h2>Parse Results</h2>
                        <ParserOverlayNode node={result}/>
                    </React.Fragment>
                )
            }
        </div>
    );
}