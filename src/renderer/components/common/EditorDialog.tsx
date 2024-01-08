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
import { dump, load } from 'js-yaml';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { setConfiguration, setZoweConfig, getZoweConfig } from '../../../services/ConfigService';
import Ajv2019 from "ajv/dist/2019"
import MonacoEditorComponent from "../common/MonacoEditor";
import draft7MetaSchema from "ajv/dist/refs/json-schema-draft-07.json";

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

const EditorDialog = ({contentType, isEditorVisible, toggleEditorVisibility, onChange} : any) => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const [setupYaml, setSetupYaml] = useState(yaml);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isSchemaValid, setIsSchemaValid] = useState(true);
  const [schemaError, setSchemaError] = useState('');
  const fileInputRef = useRef(null);
  let initZoweConfig: any;

  if(contentType == 'yaml') {
    initZoweConfig = getZoweConfig();
  }

  useEffect(() => {
    setEditorVisible(isEditorVisible);
    if(isEditorVisible) {
       if(contentType == 'yaml') {
        setEditorContent(dump(initZoweConfig));
      }
      if(contentType == 'jcl') {
        setEditorContent(test_jcl);
      }
      if(contentType == 'output') {
        setEditorContent(test_op);
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
      setZoweConfig("");
      return;
    }

    let jsonData;

    try {
      // To parse the yaml and convert it to the javascript object
      jsonData = load(newCode);
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
      setZoweConfig(jsonData);
    } else if(isSchemaValid && jsonData) {
      setZoweConfig(jsonData);
      setSetupYaml(jsonData);
      updateConfig(jsonData);
    }

  };

  const updateConfig = (data: any) => {
    if (data && Object.keys(data).length > 0) {
      const setup = data.zowe.setup;
      const properties = Object.keys(setup);
      properties.map(prop => {
        setConfiguration(prop, setup[prop]);
      });
      if (onChange) {
        onChange(setup, true);
      }
    }
  }

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
          <MonacoEditorComponent contentType={contentType} initialContent={editorContent} onContentChange={handleEditorContentChange} isSchemaValid={isSchemaValid} schemaError={schemaError} />
        </DialogContent>
        <DialogActions>
          {contentType === 'yaml' && (
            <>
              <Button onClick={triggerFileInputClick}>Import</Button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <Button onClick={handleFileExport}>Export</Button>
            </>
          )}
          {contentType === 'jcl' && <Button onClick={toggleEditorVisibility}>Submit Job</Button>}
          <Button onClick={toggleEditorVisibility}>Close</Button>
        </DialogActions>
      </Dialog> 
    </div>
  );
};

export default EditorDialog;