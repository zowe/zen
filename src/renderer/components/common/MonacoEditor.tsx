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
import { diff } from 'deep-diff';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { OUTPUT_HILITE, OUTPUT_THEME } from '../../Highlighters/jclOutput';
import { JCL_HILITE, JCL_LIGHT } from '../../Highlighters/jcl';
import { setLaunchConfigStatus, setNetworkingStatus } from '../stages/progress/progressSlice';
import { useAppDispatch } from '../../hooks';
import eventDispatcher from "../../../services/eventDispatcher";

const MonacoEditorComponent = ({contentType, initialContent, onContentChange, isSchemaValid, schemaError, readOnlyYaml} : {contentType: any, initialContent: any, onContentChange: any, isSchemaValid: any, schemaError: any, readOnlyYaml?: boolean}) => {

  const dispatch = useAppDispatch();
  const editorRef = useRef(null);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [originalYamlObject, setOriginalYamlObject] = useState(load(initialContent));

  let readOnly = true;
  let lang: string;
  let theme = 'light';

  useEffect(() => {
    if(contentType == 'yaml') {
      readOnly = false;
      readOnly = !!readOnlyYaml;
      lang = 'yaml';
      monaco.languages.register({ id: 'yaml' });
    } else if(contentType == 'output') {
      lang = 'plaintext';
      monaco.languages.register({ id: 'plaintext' });
      monaco.languages.setMonarchTokensProvider('plaintext', OUTPUT_HILITE);
      monaco.editor.defineTheme('custom-theme', OUTPUT_THEME);
      theme = 'custom-theme';
    } else if(contentType == 'jcl') {
      lang = 'jcl';
      monaco.languages.register({ id: 'jcl' });
      monaco.languages.setMonarchTokensProvider('jcl', JCL_HILITE);
      monaco.editor.defineTheme('jcl-theme', JCL_LIGHT);
      theme = 'jcl-theme';
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
          const updatedObject = load(code);
          setError(false, '');
          onContentChange(code, false);
          // Compare the updated object with the original object
          const differences = diff(originalYamlObject, updatedObject);
          isYamlUpdated(differences, updatedObject);
        } catch(error) {
          const errorDesc = error.message ? error.message : "Invalid Yaml";
          const errorMsg = error.reason ? error.reason : errorDesc;
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

  const isYamlUpdated = (diff: any, yamlObj: any) => {
    if(diff) {
      const updatedKey = diff[0].path;
      if(updatedKey) {
        if(updatedKey[0] === 'zowe') {
          if(updatedKey[1] === 'launchScript' || updatedKey[1] === 'configmgr') {
            dispatch(setLaunchConfigStatus(true));
          } else if(updatedKey[1] === 'externalDomains' || updatedKey[1] === 'externalPort') {
            dispatch(setNetworkingStatus(true));
            eventDispatcher.emit('networkConfigUpdate', yamlObj);
          }
        } else if(updatedKey[0] === 'components') {
          dispatch(setNetworkingStatus(true));
          eventDispatcher.emit('networkConfigUpdate', yamlObj);
        }
      }
    }
  }

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