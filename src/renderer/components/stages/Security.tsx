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
import { setSecurityStatus, setInitializationStatus } from './progress/progressSlice';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { IResponse } from "../../../types/interfaces";
import ProgressCard from "../common/ProgressCard";
import React from "react";
import { createTheme } from '@mui/material/styles';
import { stages } from "../configuration-wizard/Wizard";
import { setActiveStep } from "./progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { getProgress, setSecurityInitState, getSecurityInitState, mapAndSetSkipStatus, getInstallationArguments, isInitComplete } from "./progress/StageProgressStatus";
import { InitSubStepsState } from "../../../types/stateInterfaces";
import { JCL_UNIX_SCRIPT_OK, INIT_STAGE_LABEL, SECURITY_STAGE_LABEL, ajv, SERVER_COMMON } from '../common/Utils';
import { alertEmitter } from "../Header";

const Security = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const [STAGE_ID] = useState(getStageDetails(INIT_STAGE_LABEL).id);
  const [SUB_STAGES] = useState(!!getStageDetails(INIT_STAGE_LABEL).subStages);
  const [SUB_STAGE_ID] = useState(SUB_STAGES ? getSubStageDetails(STAGE_ID, SECURITY_STAGE_LABEL).id : 0);

  const [theme] = useState(createTheme());

  const dispatch = useAppDispatch();
  const [schema, setLocalSchema] = useState(useAppSelector(selectSchema));
  const [yaml, setLocalYaml] = useState(useAppSelector(selectYaml));
  const [setupSchema] = useState(schema?.properties?.zowe?.properties?.setup?.properties?.security);
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.security ?? {product: 'RACF'});
  const [showProgress, setShowProgress] = useState(getProgress('securityStatus'));
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [securityInitProgress, setSecurityInitProgress] = useState(getSecurityInitState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);

  const [installationArgs] = useState(getInstallationArguments());
  const [connectionArgs] = useState(useAppSelector(selectConnectionArgs));

  let timer: any;
  const [validate] = useState(() => ajv.getSchema("https://zowe.org/schemas/v2/server-base") || ajv.compile(setupSchema));

  useEffect(() => {
    dispatch(setInitializationStatus(isInitComplete()));
    setShowProgress(initClicked || getProgress('securityStatus'));
    let nextPosition;

    if(getProgress('securityStatus')) {
      nextPosition = document.getElementById('security-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      nextPosition = document.getElementById('container-box-id');
      nextPosition?.scrollIntoView({behavior: 'smooth'});
    }

    updateProgress(getProgress('securityStatus'));
    setInit(true);

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(initClicked || getProgress('securityStatus'));

    if(initClicked) {
      let nextPosition = document.getElementById('start-security-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setStateUpdated(!stateUpdated);
      dispatch(setSecurityStatus(false));
    }
  }, [initClicked]);

  useEffect(() => {
    if(!getProgress('securityStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getInitSecurityProgress().then((res: any) => {
          setSecurityInitializationProgress(res);
        })
      }, 3000);

      if(showProgress) {
        const nextPosition = document.getElementById('start-security-progress');
        nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated]);

  useEffect(() => {
    const allAttributesTrue = Object.values(securityInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setSecurityStatus(true));
      dispatch(setNextStepEnabled(true));
      setShowProgress(initClicked || getProgress('securityStatus'));
    }
  }, [securityInitProgress]);

  const setSecurityInitializationProgress = (securityInitState: InitSubStepsState) => {
    setSecurityInitProgress(securityInitState);
    setSecurityInitState(securityInitState);
    const allAttributesTrue = Object.values(securityInitState).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setSecurityStatus(true));
      dispatch(setNextStepEnabled(true));
    }
  }

  const setStageSkipStatus = (status: boolean) => {
    stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = status;
    stages[STAGE_ID].isSkipped = status;
    mapAndSetSkipStatus(SUB_STAGE_ID, status);
  }

  const updateProgress = (status: boolean) => {
    setStateUpdated(!stateUpdated);
    setStageSkipStatus(!status);
    if(!status) {
      for (let key in securityInitProgress) {
        securityInitProgress[key as keyof(InitSubStepsState)] = false;
        setSecurityInitState(securityInitProgress);
      }
    }
    const allAttributesTrue = Object.values(securityInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    dispatch(setInitializationStatus(isInitComplete()));
    dispatch(setSecurityStatus(status));
    dispatch(setNextStepEnabled(status));
    setSecurityInitializationProgress(getSecurityInitState());
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };


  const process = async (event: any) => {
    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();
    if(!installationArgs.dryRunMode){
      window.electron.ipcRenderer.initSecurityButtonOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
        // Some parts of Wizard pass the response as a string directly into the object
        if (res.status == false && typeof res.details == "string") {
          res.details = { 3: res.details };
        }
        if (res?.details && res.details[3] && res.details[3].indexOf(JCL_UNIX_SCRIPT_OK) == -1) { // This check means we got an error during zwe init security
          alertEmitter.emit('showAlert', 'Please view Job Output for more details', 'error');
          window.electron.ipcRenderer.setStandardOutput(res.details[3]).then((res: any) => {
          toggleEditorVisibility("output");
        })
        updateProgress(false);
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
      updateProgress(false);
      clearInterval(timer);
      securityProceedActions(false);
      stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = true;
      stages[STAGE_ID].isSkipped = true;
      window.electron.ipcRenderer.setStandardOutput(`zwe init security failed:  ${typeof err === "string" ? err : err.toString()}`).then((res: any) => {
        toggleEditorVisibility("output");
      })
    });
  }
  else{
    setSecurityInitState({
      writeYaml: true,
      uploadYaml: true,
      success: true
    });
    updateProgress(true);
  }
  }

  // True - a proceed, False - blocked
  const securityProceedActions = (status: boolean) => {
    dispatch(setNextStepEnabled(status));
    dispatch(setSecurityStatus(status));
    dispatch(setInitializationStatus(isInitComplete()));
  }

  const handleFormChange = (data: any) => {
    let newData = init ? (Object.keys(setupYaml).length > 0 ? setupYaml : data?.zowe?.setup?.security) : (data?.zowe?.setup?.security ? data?.zowe?.setup?.security : data);
    setInit(false);

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
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("yaml")}>View/Edit Yaml</Button>
        {/* <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("jcl")}>View/Submit Job</Button> */}
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("output")}>View Job Output</Button>
      </Box>
      <ContainerCard title="Security" description="Configure Zowe Security.">
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/> }
        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details ?? yaml))}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={(data: any) => handleFormChange(data)} formData={setupYaml}/>
          
          {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Initialize Security Config</Button>
          </FormControl> : null}


          <Box sx={{height: showProgress ? 'calc(40vh - 220px)' : 'auto'}} id="start-security-progress">
          {!showProgress ? null :
          <React.Fragment> 
            <ProgressCard label={`Write configuration file locally to temp directory`} id="init-security-progress-card" status={securityInitProgress?.writeYaml}/>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={securityInitProgress?.uploadYaml}/>
            <ProgressCard label={`Run zwe init security`} id="success-progress-card" status={securityInitProgress?.success}/>
            <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Reinitialize Security Config</Button>
          </React.Fragment>
        }
        </Box>
        </Box>
        <Box sx={{ height: showProgress ? '60vh' : 'auto', minHeight: showProgress ? '60vh' : '10vh' }} id="security-progress"></Box>

      </ContainerCard>
    </div>
  );
};

export default Security;