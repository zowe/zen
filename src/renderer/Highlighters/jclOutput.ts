/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import * as monaco from 'monaco-editor';
type Theme = monaco.editor.IStandaloneThemeData;

interface MonarchLanguageRule {
    regex: RegExp;
    action: { token: string; };
}

interface OutputHilite {
    tokenizer: {
        [category: string]: MonarchLanguageRule[];
    };
}

const customTokenStyles = [
    { token: 'info-token', foreground: '#0000FF' },
    { token: 'warn-token', foreground: '#FFA500' },
    { token: 'error-token', foreground: '#FF0000' },
    { token: 'severe-token', foreground: '#FF0000' },
    { token: 'abort-token', foreground: '#800000' },
    { token: 'abend-token', foreground: '#800000' },
];

export const OUTPUT_HILITE: OutputHilite = {
    tokenizer: {
      root: [
        { regex: /\bINFO\b/, action: { token: 'info-token' } },
        { regex: /\bWARN(?:ING)?\b/, action: { token: 'warn-token' } },
        { regex: /\bERROR\b/, action: { token: 'error-token' } },
        { regex: /\bSEVERE\b/, action: { token: 'severe-token' } },
        { regex: /\bABORT\b/, action: { token: 'abort-token' } },
        { regex: /\bABEND\b/, action: { token: 'abend-token' } },
        { regex: /.*/, action: { token: 'text' } },
      ],
    
    }
}

export const OUTPUT_THEME: Theme = {
    base: 'vs',
    inherit: false,
    colors: {
    },
    rules: customTokenStyles,
}