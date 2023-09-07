import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const MonacoEditorComponent = () => {

  const editorRef = useRef(null);
  useEffect(() => {
    editorRef.current = monaco.editor.create(document.getElementById('monaco-editor-container'), {
      language: 'html', 
      theme: 'light',
      value: 'console.log("Hello, Monaco Editor!");',
    });

    editorRef.current.onDidChangeModelContent(() => {
      const code = editorRef.current.getValue();
      console.log(code);
    });

    return () => {
      editorRef.current.dispose();
    };

  }, []);

  return (
    <div>
      <div id="monaco-editor-container" style={{ width: '100%', height: '500px' }}></div>
    </div> 
  );
};

export default MonacoEditorComponent;