/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from '../../hooks';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { selectYaml, selectOutput, selectSchema, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import Ajv2019 from "ajv/dist/2019"
import MonacoEditorComponent from "../common/MonacoEditor";
import draft7MetaSchema from "ajv/dist/refs/json-schema-draft-07.json";
import { parse, stringify } from "yaml";
import { IResponse } from "../../../types/interfaces";
import { DEF_NO_OUTPUT } from "./Constants";
import { alertEmitter } from "../Header";

const test_jcl = `
//MYJOB   JOB (ACCT), 'My Job Description',
//         CLASS=A,MSGCLASS=X,NOTIFY=&SYSUID
//* This is a comment
//STEP1   EXEC PGM=MYCOBOL
//INPUT   DD  DSN=your_input_dataset,DISP=SHR
//OUTPUT  DD  DSN=your_output_dataset,DISP=(,CATLG,DELETE)
//SYSOUT  DD  SYSOUT=A
`;

const test_op = "WARNING: 'Some Warning'\nERROR: 'Some Error'\nINFO: 'Some Info'\nABEND: 'Some abend error' ";

const EditorDialog = ({contentType, isEditorVisible, toggleEditorVisibility, onChange, content, readOnlyYaml} : {contentType: any, isEditorVisible: boolean, toggleEditorVisibility: any, onChange?: any, content?: any, readOnlyYaml?: boolean}) => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const [setupYaml, setSetupYaml] = useState(useAppSelector(selectYaml));
  const [setupOutput, setSetupOutput] = useState(useAppSelector(selectOutput));
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState(content ? content : '');
  const [isSchemaValid, setIsSchemaValid] = useState(true);
  const [schemaError, setSchemaError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditorVisible(isEditorVisible);
    /* TODO: 1. All of these should use the Editor store (from ipcRenderer)
    2. Should use an array for the Store to house separate outputs (Security vs Certificates for example) */
    if(isEditorVisible) { 
       if(contentType == 'yaml') {
        setEditorContent(stringify(setupYaml));
      }
      if(contentType == 'jcl') {
        setEditorContent(test_jcl);
      }
      if(contentType == 'output') {
        window.electron.ipcRenderer.getStandardOutput().then((res: IResponse) => {
          setEditorContent(res || DEF_NO_OUTPUT) // We may not always have output to show (for ex: no encountered error or run commands)
        });
      }
    }
  }, [isEditorVisible])

  const handleEditorContentChange = (newCode: any, isError: boolean) => {

    if(contentType !== 'yaml') {
      return;
    }

    if(isError) {
      dispatch(setNextStepEnabled(false));
      return;
    }

    if(newCode && (newCode == "\n" || newCode == "")) {
      return;
    }

    let jsonData;

    try {
      // To parse the yaml and convert it to the javascript object
      jsonData = parse(newCode);
    } catch (error) {
      console.error('Error parsing YAML:', error);
      jsonData = newCode;
    }

    const ajv = new Ajv2019()
    ajv.addKeyword("$anchor");
    ajv.addMetaSchema(draft7MetaSchema)
    const validate = ajv.compile(schema);

    // To validate the javascript object against the schema
    const isValid = validate(jsonData);
    setIsSchemaValid(isValid);

    if(validate.errors && jsonData) {
      const errPath = validate.errors[0].schemaPath;
      const errMsg = validate.errors[0].message;
      setSchemaError(`Invalid Schema: ${errPath}. ${errMsg} `, );
      jsonData = jsonData ? jsonData : "";
      setSetupYaml(jsonData);
      window.electron.ipcRenderer.setConfig(jsonData);
      dispatch(setYaml(jsonData));
    } else if(isSchemaValid && jsonData) {
      window.electron.ipcRenderer.setConfig(jsonData);
      dispatch(setYaml(jsonData));
      setSetupYaml(jsonData);
      if (onChange) {
        onChange(jsonData, true);
      }
    }

  };

  const triggerFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (event:any) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const uploadedCode = e.target.result as string;
        setEditorContent(uploadedCode);
        handleEditorContentChange(uploadedCode, false);
      } catch (error) {
        console.error('Error handling file upload:', error);
      }
    };

    reader.readAsText(file);
  };

  const handleClose = () => {
    // Add your new functionality here
    alertEmitter.emit('hideAlert');
  
    // Call the existing toggleEditorVisibility method
    toggleEditorVisibility();
  };

  const handleFileExport = () => {
    const content = editorContent;
    const blob = new Blob([content], { type: 'text/plain' });

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);

    // Set the default file name for the downloaded file
    a.download = 'zowe.yaml';

    // Programmatically trigger a click event on the anchor element to initiate the download
    a.click();
};

  return (
    <div> 
      <Dialog 
        open={editorVisible} 
        onClose={toggleEditorVisibility} 
        PaperProps={{
          style: {
            width: '100vw',
          },
        }}>
        <DialogTitle>Editor</DialogTitle>
        <DialogContent sx={{paddingBottom: '0'}}>
          <MonacoEditorComponent contentType={contentType} initialContent={editorContent} onContentChange={handleEditorContentChange} isSchemaValid={isSchemaValid} schemaError={schemaError} readOnlyYaml={readOnlyYaml} />
        </DialogContent>
        <DialogActions>
          {contentType === 'yaml' && (
            <>
              {!readOnlyYaml && (
                <div>
                  <Button onClick={triggerFileInputClick}>Import</Button>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                </div>
                )
              }
            </>
          )}
          {contentType === 'jcl' && <Button onClick={toggleEditorVisibility}>Submit Job</Button>}
          <Button onClick={handleFileExport}>Export</Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog> 
    </div>
  );
};

export default EditorDialog;