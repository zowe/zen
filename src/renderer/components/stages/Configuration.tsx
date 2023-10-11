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
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { setConfiguration, getConfiguration } from '../../../services/ConfigService';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";

const Configuration = () => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const setupSchema = schema ? schema.properties.zowe.properties.setup.properties.security : "";
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe.setup.security);
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');

  const section = 'security';
  const initConfig: any = getConfiguration(section);
  
  const ajv = new Ajv();
  let securitySchema;
  let validate: any;
  if(schema) {
    securitySchema = schema.properties.zowe.properties.setup.properties.security;
  }

  if(securitySchema) {
    validate = ajv.compile(securitySchema);
  }

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    if(Object.keys(initConfig) && Object.keys(initConfig).length != 0) {
      setSetupYaml(initConfig);
    }
    setInit(true);
  }, []);

  const toggleEditorVisibility = () => {
    setEditorVisible(!editorVisible);
  };

  const handleFormChange = (data: any, isYamlUpdated?: boolean) => {
    let newData = init ? (initConfig ? initConfig : data) : (data ? data : initConfig);
    setInit(false);

    if (newData) {
      newData = isYamlUpdated ? data.security : newData;

      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setIsFormValid(false);
          setFormError(errPath+' '+errMsg);
          dispatch(setNextStepEnabled(true));
        } else {
          setIsFormValid(true);
          setFormError('');
          dispatch(setNextStepEnabled(true));
          setConfiguration(section, newData, true);
          setSetupYaml(newData);
        }
      }

    }
  };

  return (
    <div>
      <div style={{ position: 'fixed', top: '140px', right: '30px'}}>
        <Button style={{ color: 'white', backgroundColor: '#1976d2', fontSize: 'x-small'}} onClick={toggleEditorVisibility}>Open Editor</Button>
      </div>
      <ContainerCard title="Configuration" description="Configure Zowe initilaization and components">
        <EditorDialog isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>
        <Box sx={{ width: '60vw' }}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Configuration;