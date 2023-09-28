import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { load } from 'js-yaml';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { setConfiguration, getConfiguration, setZoweConfig, getZoweConfig } from '../../../services/ConfigService';

const MonacoEditorComponent = ({initialContent, onContentChange, isSchemaValid, schemaError} : any) => {

  const editorRef = useRef(null);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    editorRef.current = monaco.editor.create(document.getElementById('monaco-editor-container'), {
      language: 'html', 
      theme: 'light',
      value: initialContent,
    });

    editorRef.current.onDidChangeModelContent(() => {
      const code = editorRef.current.getValue();
      
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
      
    });

    return () => {
      editorRef.current.dispose();
    };

  }, []);

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