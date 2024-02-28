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
import { setSecurityStatus, setInitializationStatus, selectCertificateStatus, setCertificateStatus, selectInitializationStatus } from './progress/progressSlice';
import { selectYaml, selectSchema, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";
import { createTheme } from '@mui/material/styles';
import { stages } from "../configuration-wizard/Wizard";
import { setActiveStep } from "./progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "./progress/progressStore";
import { TYPE_YAML, TYPE_JCL, TYPE_OUTPUT } from "../common/Utils";

const Certificates = () => {

  const theme = createTheme();

  const stageLabel = 'Initialization';
  const subStageLabel = 'Certificates';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;
  const SUB_STAGE_ID = SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0;

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const setupSchema = schema?.properties?.zowe?.properties?.setup?.properties?.certificate;
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.certificate);
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');

  const section = 'certificate';

  const ajv = new Ajv();
  ajv.addKeyword("$anchor");
  let certificateSchema;
  let validate: any;
  if(schema) {
    certificateSchema = schema?.properties?.zowe?.properties?.setup?.properties?.certificate;
  }

  if(certificateSchema) {
    validate = ajv.compile(certificateSchema);
  }

  const isStepSkipped = !useAppSelector(selectCertificateStatus);
  const isInitializationSkipped = !useAppSelector(selectInitializationStatus);

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = isStepSkipped;
    stages[STAGE_ID].isSkipped = isInitializationSkipped
    setIsFormInit(true);
    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };
  
  const handleFormChange = (data: any, isYamlUpdated?: boolean) => {
    const newData = isFormInit ? (Object.keys(setupYaml).length > 0 ? setupYaml : data.zowe.setup.certificate) : (data.zowe?.setup?.certificate ? data.zowe.setup.certificate : data);
    setIsFormInit(false);

    if (newData) {

      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setStageConfig(false, errPath+' '+errMsg, newData);
          window.electron.ipcRenderer.setConfig({...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, certificate: newData}}});
        } else {
          // setConfiguration(section, newData, true);
          // setLYaml((prevYaml: any) => ({
          //   ...prevYaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, certificate: newData}}
          // }))
          // dispatch(setYaml({...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, certificate: newData}}}))
          window.electron.ipcRenderer.setConfig({...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, certificate: newData}}});
          setStageConfig(true, '', newData);
        }
      }
    }
  };

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setSetupYaml(data);
  } 

  return (
    <div>
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Certificates" description="Configure Zowe Certificates."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/> }
        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details.config ?? yaml))}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Certificates;