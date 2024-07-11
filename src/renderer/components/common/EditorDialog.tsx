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
import { selectYaml, selectOutput, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import MonacoEditorComponent from "../common/MonacoEditor";
import { parse, stringify } from "yaml";
import { IResponse } from "../../../types/interfaces";
import { DEF_NO_OUTPUT, schemaValidate } from "./Utils";
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
  const [setupYaml, setSetupYaml] = useState(useAppSelector(selectYaml));
  const [setupOutput, setSetupOutput] = useState(useAppSelector(selectOutput));
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState(content ? content : '');
  const [isSchemaValid, setIsSchemaValid] = useState(true);
  const [schemaError, setSchemaError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditorVisible(isEditorVisible);
    /* TODO: Should use an array for the Store to house separate outputs (Security vs Certificates for example) */
    if(isEditorVisible) { 
       if(contentType == 'yaml') {
        if (setupYaml?.installationArgs) {
          delete setupYaml.installationArgs;
        }
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

    // To validate the javascript object against the schema
    setIsSchemaValid(!schemaValidate.errors);

    if(schemaValidate.errors && jsonData) {
      const errPath = schemaValidate.errors[0].schemaPath;
      const errMsg = schemaValidate.errors[0].message;
      setSchemaError(`Invalid Schema: ${errPath}. ${errMsg} `, );
      jsonData = jsonData ? jsonData : "";
      setSetupYaml(jsonData);
      window.electron.ipcRenderer.setConfig(jsonData);
      dispatch(setYaml(jsonData));
    } else if(isSchemaValid && jsonData) {
      if(jsonData?.installationArgs) {
        delete jsonData.installationArgs;
        setEditorContent(stringify(jsonData));
      }
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
    alertEmitter.emit('hideAlert');
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
        fullWidth
        maxWidth={'xl'}
        open={editorVisible} 
        onClose={toggleEditorVisibility} 
        PaperProps={{
          style: {
            width: '95vw',
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