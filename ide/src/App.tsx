import * as React from 'react';
import { render } from 'react-dom';
import 'normalize.css';
import './eui_theme_light.css';
import './globals.css';
import Editor from './editor/Editor';

const container = document.createElement('div');
container.classList.add('fullsize');
document.body.appendChild(container);

render(
    <div className="fullsize">
        <Editor/>
    </div>,
    container
);