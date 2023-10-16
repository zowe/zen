import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { load } from 'js-yaml';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { JCL_HILITE } from '../../monaco/highlighters/jcl';
import { YML_HILITE } from '../../monaco/highlighters/yaml';

const JCL_LANG = {
  id: 'jcl',
  extensions: ['.jcl', '.cntl'],
  filenamePatterns: ['\\.jcl\\.','\\.jcl','\\.cntl','\\.cntl\\.'],
  aliases: ['JCL', 'jcl'],
  mimetypes: ['application/jcl']
};

const YAML_LANG = {
  id: 'yaml',
  extensions: ['.yaml', '.yml'],
  filenamePatterns: ['\\.yaml\\.','\\.yaml','\\.yml','\\.yml\\.'],
  aliases: ['YAML', 'yml'],
  mimetypes: ['application/yml']
};

const MonacoEditorComponent = (
  {contentType, initialContent, onContentChange, isSchemaValid, schemaError} : 
  {contentType:string, initialContent: any, onContentChange?: any, isSchemaValid?: boolean, schemaError?: any}) => {

  const editorRef = useRef(null);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  let readOnly = false;
  let lang = 'yaml';

  useEffect(() => {
    if(contentType == 'jcl') {
      readOnly = true;
      lang = 'jcl';

      monaco.languages.register(JCL_LANG);
      monaco.languages.setMonarchTokensProvider('jcl', {
        tokenizer: {
          root: [
            [/^\/\/\*.*$/, 'jcl-comment'], // JCL comments
            [/^[A-Z][A-Z0-9]*\s/, 'jcl-statement'], // JCL statements
            [/^[A-Z][A-Z0-9]*$/, 'jcl-statement'], // JCL statements at the end of a line
            [/[A-Z][A-Z0-9]*/, 'jcl-keyword'], // JCL keywords
            [/\'.*?'/, 'jcl-string'], // Single-quoted strings
            [/"(\\.|[^"])*"/, 'jcl-string'], // Double-quoted strings
            [/\d+/, 'jcl-number'], // Numeric values
            [/[,=]/, 'jcl-delimiter'], // Commas and equal signs
            [/\b(ADD|SUB|MULT|DIV)\b/, 'jcl-math-operator'], // Math operators
            [/\b(COPY|DELETE|MOVE)\b/, 'jcl-action'], // Action keywords
            [/\b(JOB|EXEC|PRTY)\b/, 'jcl-parameters'], // Parameter keywords
            [/\b(Abend|Cond|End|Exec|Ignore)\b/, 'jcl-event'], // Event keywords
            [/\b(IF|THEN|ELSE|ENDIF)\b/, 'jcl-conditional'], // Conditional keywords
            [/\b(AND|OR|NOT)\b/, 'jcl-logical'], // Logical operators
            [/\b(SET|UNSET)\b/, 'jcl-setting'], // Setting keywords
            [/\b(OPEN|CLOSE|READ|WRITE|DELETE)\b/, 'jcl-io'], // I/O operation keywords
            [/\b(ERROR|INFO|WARNING|DEBUG)\b/, 'jcl-log-level'], // Log level keywords
          ],
        },
      });
    } else if(contentType == 'output') {
      readOnly = true;
      lang = 'plaintext';
    }else if(contentType == 'yaml') {
      monaco.languages.register(YAML_LANG);
      monaco.languages.setMonarchTokensProvider('yaml', {
        tokenizer: {
          root: [
            //Defining syntax highlighting rules here
            [/^(\s*)([a-zA-Z_][\w]*)/, ['white', 'key']],// Unquoted keys
            [/\b(true|false)\b/, 'keyword'], // Boolaean values
            [/"[^"\\]*"/, 'string'], // Values enclosed in double quotes
            [/'[^'\\]*'/, 'string'], // Values enclosed in single quotes
            [/#.*$/, 'comment'], // Comments
          ],
        },
      });
    }

    editorRef.current = monaco.editor.create(document.getElementById('monaco-editor-container'), {
      language: lang,
      theme: 'light',
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