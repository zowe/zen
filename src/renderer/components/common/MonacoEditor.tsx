/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { load } from 'js-yaml';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import '../../Highlighters/jcl';

const customTokenStyles = [
  { token: 'info-token', foreground: '#0000FF' },
  { token: 'warn-token', foreground: '#FFA500' },
  { token: 'error-token', foreground: '#FF0000' },
  { token: 'severe-token', foreground: '#FF0000' },
  { token: 'abort-token', foreground: '#800000' },
  { token: 'abend-token', foreground: '#800000' },
];

const MonacoEditorComponent = ({contentType, initialContent, onContentChange, isSchemaValid, schemaError} : any) => {

  const editorRef = useRef(null);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  let readOnly = true;
  let lang: string;
  let theme: string = 'light';

  useEffect(() => {
    if(contentType == 'yaml') {
      readOnly = false;
      lang = 'yaml';
      monaco.languages.register({ id: 'yaml' });
    } else if(contentType == 'output') {
      lang = 'plaintext';
      monaco.languages.register({ id: 'plaintext' });
      monaco.languages.setMonarchTokensProvider('plaintext', {
        tokenizer: {
          root: [
            [/\bINFO\b/, 'info-token'],
            [/\bWARN(?:ING)?\b/, 'warn-token'],
            [/\bERROR\b/, 'error-token'],
            [/\bSEVERE\b/, 'severe-token'],
            [/\bABORT\b/, 'abort-token'],
            [/\bABEND\b/, 'abend-token'],
            [/.*/, 'text'],
          ],
        }
      });
      monaco.editor.defineTheme('custom-theme', {
        base: 'vs',
        inherit: false,
        colors: {
          'info-token': '#0000FF',
          'warn-token': '#FFA500',
          'error-token': '#FF0000',
          'severe-token': '#FF0000',
          'abort-token': '#800000',
          'abend-token': '#800000',
        },
        rules: customTokenStyles,
      });

      theme = 'custom-theme';
    } else if(contentType == 'jcl') {
      lang = 'jcl';
      monaco.languages.register({ id: 'jcl' });
      // monaco.languages.setMonarchTokensProvider('jcl', JCL_HILITE);
    }

    editorRef.current = monaco.editor.create(document.getElementById('monaco-editor-container'), {
      language: lang, 
      theme: theme,
      value: initialContent,
      readOnly: readOnly
    });

    editorRef.current.onDidChangeModelContent(() => {
      const code = editorRef.current.getValue();

      if(contentType == 'yaml') {
        try {
          // To parse the yaml and check if it is valid
          const parsedYAML = load(code);
          setError(false, '');
          onContentChange(code, false);
        } catch(error) {
          let errorDesc = error.message ? error.message : "Invalid Yaml";
          let errorMsg = error.reason ? error.reason : errorDesc;
          setError(true, errorMsg);
          onContentChange(code, true);
        }
      }
    });

    return () => {
      editorRef.current.dispose();
    };

  }, []);

  useEffect(() => {
    editorRef.current.setValue(initialContent);
  }, [initialContent])


  const setError = (isError: boolean, errorMessage: string) => {
    setIsError(isError);
    setErrorMsg(errorMessage);
  }

  return (
    <div style={{ height: '400px' }}>
      {isError && (
        <div id="error-msg" 
          style={{ color: 'red', fontFamily: 'Arial, sans-serif', fontSize: 'small', paddingBottom: '1px' }}>
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '5px' }} />  
          {errorMsg}
        </div>)}
      {!isSchemaValid && (
        <div id="error-msg" 
          style={{ color: 'red', fontFamily: 'Arial, sans-serif', fontSize: 'small' , paddingBottom: '5px' }}>
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '5px' }} />
          {schemaError}
        </div>)}
      <div id="monaco-editor-container" style={{ width: '100%', height: '100%', margin: '0' }}></div>
    </div> 
  );
};

export default MonacoEditorComponent;