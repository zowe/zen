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
import { selectYaml, selectSchema, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import { setSecurityStatus, setInitializationStatus, selectSecurityStatus, selectInitializationStatus } from './progress/progressSlice';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";
import { selectInstallationArgs } from "./installation/installationSlice";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { IResponse } from "../../../types/interfaces";
import ProgressCard from "../common/ProgressCard";
import React from "react";
import { createTheme } from '@mui/material/styles';
import { alertEmitter } from "../Header";
import progressSlice from "./progress/progressSlice";
import { stages } from "../configuration-wizard/Wizard";
import { setActiveStep } from "./progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "./progress/progressStore";
import { TYPE_YAML, TYPE_OUTPUT, TYPE_JCL, JCL_UNIX_SCRIPT_OK } from '../common/Utils';

const Security = () => {
  const theme = createTheme();

  const stageLabel = 'Initialization';
  const subStageLabel = 'Security';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;
  const SUB_STAGE_ID = SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0;

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const setupSchema = schema?.properties?.zowe?.properties?.setup?.properties?.security;
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.security ?? {product: 'RACF'});
  const [isFormInit, setIsFormInit] = useState(false);
  const [initializeForm, setInitializeForm] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [initProgress, setInitProgress] = useState({
    writeYaml: false,
    uploadYaml: false,
    success: false,
  });
  const [showProgress, toggleProgress] = useState(false);
  let timer: any;

  const installationArgs = useAppSelector(selectInstallationArgs);
  const connectionArgs = useAppSelector(selectConnectionArgs);


  const ajv = new Ajv();
  let securitySchema;
  let validate: any;
  if(schema) {
    securitySchema = schema?.properties?.zowe?.properties?.setup?.properties?.security;
  }

  if(securitySchema) {
    validate = ajv.compile(securitySchema);
  }

  const isStepSkipped = !useAppSelector(selectSecurityStatus);
  const isInitializationSkipped = !useAppSelector(selectInitializationStatus);

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = isStepSkipped
    stages[STAGE_ID].isSkipped = isInitializationSkipped
    setInitializeForm(true);
    setIsFormInit(true);

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    timer = setInterval(() => {
      window.electron.ipcRenderer.getInitSecurityProgress().then((res: any) => {
        setInitProgress(res);
      })
    }, 3000);
    const nextPosition = document.getElementById('init-progress');
    nextPosition.scrollIntoView({behavior: 'smooth'});
  }, [showProgress]);

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const process = async(event: any) => {
    event.preventDefault();
    toggleProgress(true);
    window.electron.ipcRenderer.initSecurityButtonOnClick(connectionArgs, installationArgs, (await window.electron.ipcRenderer.getConfig()).details.config ?? yaml).then((res: IResponse) => {
        if (res?.details && res.details[3] && res.details[3].indexOf(JCL_UNIX_SCRIPT_OK) == -1) { // This check means we got an error during zwe init security
          alertEmitter.emit('showAlert', 'Please view Job Output for more details', 'error');
          window.electron.ipcRenderer.setStandardOutput(res.details[3]).then((res: any) => {
            toggleEditorVisibility("output");
          })
          toggleProgress(false);
          securityProceedActions(false);
          stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = true;
          clearInterval(timer);
        } else {
          securityProceedActions(res.status);
          stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = !res.status;
          clearInterval(timer);
        }
      }).catch((err: any) => {
        // TODO: Test this
        //alertEmitter.emit('showAlert', err.toString(), 'error');
        toggleProgress(false);
        clearInterval(timer);
        securityProceedActions(false);
        stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = true;
        stages[STAGE_ID].isSkipped = true;
        if (typeof err === "string") {
          console.warn('zwe init security failed', err);
        } else {
          console.warn('zwe init security failed', err?.toString()); // toString() throws run-time error on undefined or null
        }
      });
  }

  // True - a proceed, False - blocked
  const securityProceedActions = (status: boolean) => {
    dispatch(setNextStepEnabled(status));
    dispatch(setSecurityStatus(status));
    dispatch(setInitializationStatus(status));
  }

  const handleFormChange = (data: any) => {
    if(!initializeForm) {
      return;
    }
    let newData = isFormInit ? (Object.keys(setupYaml).length > 0 ? setupYaml : data.zowe.setup.security) : (data.zowe?.setup?.security ? data.zowe.setup.security : data);
    setIsFormInit(false);

    if (newData) {

      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setStageConfig(false, errPath+' '+errMsg, newData);
        } else {
          window.electron.ipcRenderer.setConfig({...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, security: newData}}});
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
      <ContainerCard title="Security" description="Configure Zowe Security.">
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/> }
        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details.config ?? yaml))}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={(data: any) => handleFormChange(data)} formData={setupYaml}/>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Initialize Security Config</Button>
          <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="init-progress">
          {!showProgress ? null :
          <React.Fragment>
            <ProgressCard label={`Write configuration file locally to temp directory`} id="init-security-progress-card" status={initProgress?.writeYaml || false}/> {/* we do || false to prevent run-time issue with not filled out data  */}
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={initProgress.uploadYaml}/>
            <ProgressCard label={`Run zwe init security`} id="success-progress-card" status={initProgress.success}/>
          </React.Fragment>
        }
        </Box>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Security;