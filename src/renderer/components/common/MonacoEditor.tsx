import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { load } from 'js-yaml';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';


const MonacoEditorComponent = ({initialContent, onContentChange, isSchemaValid} : any) => {

  let schemaInvalidMessage = 'Invalid Schema';
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
      console.log(code);
      try {
        // To check if the yaml is valid
        const parsedYAML = load(code);
        setIsError(false);
        setErrorMsg('');
        onContentChange(code, false);
      } catch(error) {
        setIsError(true);
        let errorDesc = error.reason ? error.reason : " ";
        setErrorMsg(errorDesc);
        onContentChange(code, true);
        console.log('Error:', errorMsg);
      }
      
    });

    return () => {
      editorRef.current.dispose();
    };

  }, []);

  return (
    <div style={{ height: '300px', paddingBottom: '50px' }}>
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
          {schemaInvalidMessage}
        </div>)}
      <div id="monaco-editor-container" style={{ width: '100%', height: '250px' }}></div>
    </div> 
  );
};

export default MonacoEditorComponent;