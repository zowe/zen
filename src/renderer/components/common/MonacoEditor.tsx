import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { load } from 'js-yaml';

const MonacoEditorComponent = ({initialContent, onContentChange} : any) => {

  let isError = false;
  const editorRef = useRef(null);
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
        onContentChange(code);
      } catch(error) {
          isError = true;
          console.error('Error:', error.message);
      }
      
    });

    return () => {
      editorRef.current.dispose();
    };

  }, []);

  return (
    <div style={{ height: '300px', paddingBottom: '50px' }}>
      {isError && (<div id="error-msg" style={{ color: 'red' }}></div>)}
      <div id="monaco-editor-container" style={{ width: '100%', height: '250px' }}></div>
    </div> 
  );
};

export default MonacoEditorComponent;