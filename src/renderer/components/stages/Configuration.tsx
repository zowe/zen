/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState, useEffect } from "react";
import { Box, Button } from '@mui/material';
import ContainerCard from '../common/ContainerCard';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import JsonForm from '../common/JsonForms';
import { setConfiguration, getConfiguration } from '../../../services/ConfigService';
import MonacoEditorComponent from "../common/MonacoEditor";
import { dump, load } from 'js-yaml';
import Ajv from "ajv";
import { setUISchema } from "@jsonforms/core";

const Configuration = () => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const setupSchema = schema.properties.zowe.properties.setup.properties.security;
  const [setupYaml, setSetupYaml] = useState(yaml.zowe.setup.security);
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isSchemaValid, setIsSchemaValid] = useState(true);

  const section = 'security';
  const initConfig: any = getConfiguration(section);
  const ajv = new Ajv();

  const toggleEditorVisibility = () => {
    setEditorVisible(!editorVisible);
  };

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    if(Object.keys(initConfig) && Object.keys(initConfig).length != 0) {
      setSetupYaml(initConfig);
      setEditorContent(dump(initConfig));
    }
    setInit(true);
  }, []);

  useEffect(() => {
    setEditorContent(dump(setupYaml));
  }, [setupYaml])

  useEffect(() => {
    if(editorVisible && !isSchemaValid) {
      dispatch(setNextStepEnabled(false));
    }
  }, [isSchemaValid, editorVisible])

  const handleFormChange = (data: any) => {
    
    const newData = init ? (initConfig ? initConfig : data) : (data ? data : initConfig);
    setInit(false);

    if (newData) {
      setConfiguration(section, newData);
      dispatch(setNextStepEnabled(true));
      setSetupYaml(newData);
    }
  };

  const handleEditorContentChange = (newCode: any, isError: boolean) => {

    if(isError) {
      dispatch(setNextStepEnabled(false));
      return;
    }

    const validate = ajv.compile(setupSchema);
    let jsonData;

    try {
      jsonData = load(newCode);
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }

    const isValid = validate(jsonData);
    setIsSchemaValid(isValid);
    
    if(isSchemaValid && jsonData) {
      setConfiguration(section, jsonData);
      dispatch(setNextStepEnabled(true));
      setSetupYaml(jsonData);
    }
  };

  return (
    <ContainerCard title="Configuration" description="Configure Zowe initilaization and components">
      <Button onClick={toggleEditorVisibility}>
        {editorVisible ? "Hide Editor" : "Show Editor"}
      </Button>
      <Box sx={{ width: '70vw', paddingTop: '10px', paddingBottom: '20px'}}>
        {editorVisible && <MonacoEditorComponent initialContent={editorContent} onContentChange={handleEditorContentChange} isSchemaValid={isSchemaValid}/>}
      </Box> 
      <Box sx={{ width: '60vw' }}>
        {!editorVisible && <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>}
      </Box>
    </ContainerCard>
  );
};

export default Configuration;