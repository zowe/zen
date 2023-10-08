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
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { dump, load } from 'js-yaml';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { setConfiguration, getConfiguration, setZoweConfig, getZoweConfig } from '../../../services/ConfigService';
import Ajv from "ajv";
import MonacoEditorComponent from "../common/MonacoEditor";

const EditorDialog = ({isEditorVisible, toggleEditorVisibility, onChange} : any) => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const [setupYaml, setSetupYaml] = useState(yaml);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isSchemaValid, setIsSchemaValid] = useState(true);
  const [schemaError, setSchemaError] = useState('');
  const fileInputRef = useRef(null);

  const schemaCopy = { ...schema };
  delete schemaCopy['$schema'];
  delete schemaCopy['$id'];

  const ajv = new Ajv();
  ajv.addKeyword("$anchor");
  const validate = ajv.compile(schemaCopy);

  const initZoweConfig = getZoweConfig();

  useEffect(() => {
    setEditorVisible(isEditorVisible);
    if(isEditorVisible) {
      setEditorContent(dump(initZoweConfig));
    }
  }, [isEditorVisible])

  useEffect(() => {
    if(isEditorVisible && !isSchemaValid) {
      dispatch(setNextStepEnabled(false));
    }
    if(!isEditorVisible) {
      dispatch(setNextStepEnabled(true));
    }
  }, [isSchemaValid, isEditorVisible]);

  const handleEditorContentChange = (newCode: any, isError: boolean) => {
    console.log("HANDLING EDITOR CONTENT CHANGE---");
    if(isError) {
      dispatch(setNextStepEnabled(false));
      return;
    }

    let jsonData;

    try {
      // To parse the yaml and convert it to the javascript object
      console.log("Parsing Yaml------");
      jsonData = load(newCode);
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }

    // To validate the javascript object against the schema
    const isValid = validate(jsonData);
    setIsSchemaValid(isValid);
    console.log("Schema error:---------------- ", isValid);

    if(validate.errors) {
      const errPath = validate.errors[0].schemaPath;
      const errMsg = validate.errors[0].message;
      console.log("Schema error:---------------- ", errMsg);
      setSchemaError(`Invalid Schema: ${errPath}. ${errMsg} `, );
    } else if(isSchemaValid && jsonData) {
      setZoweConfig(jsonData);
      dispatch(setNextStepEnabled(true));
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
      onChange(setup, true);
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
        console.log('Uploaded Code:', uploadedCode);
        setEditorContent(uploadedCode);
        handleEditorContentChange(uploadedCode, false);
      } catch (error) {
        console.error('Error handling file upload:', error);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div> 
      <Dialog 
        open={editorVisible} 
        onClose={toggleEditorVisibility} 
        PaperProps={{
          style: {
            width: '100%',
          },
        }}>
        <DialogTitle>zowe.yaml</DialogTitle>
        <DialogContent sx={{paddingBottom: '0'}}>
          <MonacoEditorComponent initialContent={editorContent} onContentChange={handleEditorContentChange} isSchemaValid={isSchemaValid} schemaError={schemaError} />
        </DialogContent>
        <DialogActions>
          <Button onClick={triggerFileInputClick}>Import</Button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload}/>
          <Button onClick={toggleEditorVisibility}>Export</Button>
          <Button onClick={toggleEditorVisibility}>Close</Button>
        </DialogActions>
      </Dialog> 
    </div>
  );
};

export default EditorDialog;