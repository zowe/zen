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
import { Box, Button, FormControl } from '@mui/material';
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
import { stages } from "../configuration-wizard/Wizard";
import { setActiveStep } from "./progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "../../../utils/StageDetails";
import { setProgress, getProgress, setSecurityInitState, getSecurityInitState } from "./progress/StageProgressStatus";
import { InitSubStepsState } from "../../../types/stateInterfaces";

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
  const [showProgress, setShowProgress] = useState(getProgress('securityStatus'));
  const [isFormInit, setIsFormInit] = useState(false);
  const [initializeForm, setInitializeForm] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [securityInitProgress, setSecurityInitProgress] = useState(getSecurityInitState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);

  let timer: any;

  const installationArgs = useAppSelector(selectInstallationArgs);
  const connectionArgs = useAppSelector(selectConnectionArgs);
  
  const TYPE_YAML = "yaml";
  const TYPE_JCL = "jcl";
  const TYPE_OUTPUT = "output";

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

  const setSecurityInitializationProgress = (securityInitState: any) => {
    setSecurityInitProgress(securityInitState);
    setSecurityInitState(securityInitState);
  }

  useEffect(() => {
    updateProgress(getProgress('securityStatus'));
    setInitializeForm(true);
    setIsFormInit(true);

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(initClicked || getProgress('securityStatus'));
  }, [initClicked]);

  useEffect(() => {
    const allAttributesTrue = Object.values(securityInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      setNextStepEnabled(true);
    }
  }, [securityInitProgress]);

  useEffect(() => {
    if(!getProgress('securityStatus')) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getInitSecurityProgress().then((res: any) => {
          setSecurityInitProgress(res);
        })
      }, 3000);
    }
    const nextPosition = document.getElementById('init-progress');
    nextPosition.scrollIntoView({behavior: 'smooth'});
  }, [showProgress, stateUpdated]);

  const updateProgress = (status: boolean) => {
    setStateUpdated(!stateUpdated);
    stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = !status;
    stages[STAGE_ID].isSkipped = !status;
    dispatch(setNextStepEnabled(status));
    dispatch(setInitializationStatus(status));
    dispatch(setSecurityStatus(status));
    // setInitClicked(false);
    if(!status) {
      for (let key in securityInitProgress) {
        securityInitProgress[key as keyof(InitSubStepsState)] = false;
      }
      setSecurityInitializationProgress(securityInitProgress);
    }
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const process = async(event: any) => {
    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();
    window.electron.ipcRenderer.initSecurityButtonOnClick(connectionArgs, installationArgs, (await window.electron.ipcRenderer.getConfig()).details.config ?? yaml).then((res: IResponse) => {
        updateProgress(res.status);
        clearInterval(timer);
      }).catch(() => {
        clearInterval(timer);
        updateProgress(false);
        console.warn('zwe init security failed');
      });
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
    updateProgress(isValid);
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
          
          {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Initialize Security Config</Button>
          </FormControl> : null}


          <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="init-progress">
          {!showProgress ? null :
          <React.Fragment>
            <ProgressCard label={`Write configuration file locally to temp directory`} id="init-security-progress-card" status={securityInitProgress.writeYaml}/>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={securityInitProgress.uploadYaml}/>
            <ProgressCard label={`Run zwe init security`} id="success-progress-card" status={securityInitProgress.success}/>
            <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Reinitialize Security Config</Button>
          </React.Fragment>
        }
        </Box>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Security;