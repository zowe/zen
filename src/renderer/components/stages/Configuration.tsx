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
import { useAppSelector, useAppDispatch } from '../../hooks';
import { Box, Button } from '@mui/material';
import { dump, load } from 'js-yaml';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { setConfiguration, getConfiguration } from '../../../services/ConfigService';
import Ajv from "ajv";
import MonacoEditorComponent from "../common/MonacoEditor";
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";

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
  const validate = ajv.compile(setupSchema);

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    if(Object.keys(initConfig) && Object.keys(initConfig).length != 0) {
      setSetupYaml(initConfig);
      //To serialize a JavaScript object into a YAML-formatted string
      setEditorContent(dump(initConfig));
    }
    setInit(true);
  }, []);

  useEffect(() => {
    setEditorContent(dump(setupYaml));
  }, [setupYaml]);

  useEffect(() => {
    if(editorVisible && !isSchemaValid) {
      dispatch(setNextStepEnabled(false));
    }
  }, [isSchemaValid, editorVisible]);

  const toggleEditorVisibility = () => {
    setEditorVisible(!editorVisible);
  };

  const handleFormChange = (data: any, zoweSchemaUpdate?: boolean) => {
    let newData = init ? (initConfig ? initConfig : data) : (data ? data : initConfig);
    setInit(false);

    if (newData) {

      newData = zoweSchemaUpdate ? data.security : newData;
      setConfiguration(section, newData);
      // Find some way to check if the form is valid or not?
      dispatch(setNextStepEnabled(true));
      setSetupYaml(newData);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'right', marginRight: '-200px', marginTop: '5px' }}>
        <span style={{ color: 'pink', textDecoration: 'underline', cursor: 'pointer' }} onClick={toggleEditorVisibility}>Open Editor</span>
      </div>
      <ContainerCard title="Configuration" description="Configure Zowe initilaization and components">
      <EditorDialog isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>
      <Box sx={{ width: '60vw' }}>
        <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
      </Box>
    </ContainerCard>
    </div>
    
  );
};

export default Configuration;