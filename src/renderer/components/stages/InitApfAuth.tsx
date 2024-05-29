/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useEffect, useState} from "react";
import { Box, Button, FormControl, TextField, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectOutput, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { selectConnectionArgs } from './connection/connectionSlice';
import { setApfAuthStatus, setInitializationStatus, selectApfAuthStatus, selectInitializationStatus } from './progress/progressSlice';
import { IResponse } from '../../../types/interfaces';
import ProgressCard from '../common/ProgressCard';
import ContainerCard from '../common/ContainerCard';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";
import { selectInstallationArgs } from "./installation/installationSlice";
import { createTheme } from '@mui/material/styles';
import { alertEmitter } from "../Header";
import { stages } from "../configuration-wizard/Wizard";
import { setActiveStep, selectActiveStepIndex, selectActiveSubStepIndex, selectIsSubstep } from "./progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { setProgress, getProgress, setApfAuthState, getApfAuthState, mapAndSetSkipStatus, getInstallationArguments } from "./progress/StageProgressStatus";
import { InitSubStepsState } from "../../../types/stateInterfaces";
import { JCL_UNIX_SCRIPT_OK } from "../common/Constants";

const InitApfAuth = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const stageLabel = 'Initialization';
  const subStageLabel = 'APF Auth';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;
  const SUB_STAGE_ID = SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0;

  const theme = createTheme();

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.dataset);
  const [showProgress, setShowProgress] = useState(getProgress('apfAuthStatus'));
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [apfAuthInitProgress, setApfAuthInitProgress] = useState(getApfAuthState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);
  const [reinit, setReinit] = useState(false);

  const installationArgs = getInstallationArguments();
  let timer: any;

  const ajv = new Ajv();
  ajv.addKeyword("$anchor");
  let datasetSchema;
  let validate: any;
  if(schema) {
    datasetSchema = schema.properties.zowe.properties.setup.properties.dataset;
  }

  if(datasetSchema) {
    validate = ajv.compile(datasetSchema);
  }

  const isStepSkipped = !useAppSelector(selectApfAuthStatus);
  const isInitializationSkipped = !useAppSelector(selectInitializationStatus);

  useEffect(() => {
    let nextPosition;
    if(getProgress('apfAuthStatus')) {
      nextPosition = document.getElementById('start-apf-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      nextPosition = document.getElementById('container-box-id');
      nextPosition?.scrollIntoView({behavior: 'smooth'});
    }

    updateProgress(getProgress('apfAuthStatus'));
    setInit(true);

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(initClicked || getProgress('apfAuthStatus'));

    if(initClicked) {
      let nextPosition = document.getElementById('apf-progress');
      nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if(reinit) {
        setReinit(false);
        nextPosition = document.getElementById('start-apf-progress');
        nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setStateUpdated(!stateUpdated);
      dispatch(setApfAuthStatus(false));
    }
  }, [initClicked]);

  useEffect(() => {
    const allAttributesTrue = Object.values(apfAuthInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setNextStepEnabled(true));
      dispatch(setApfAuthStatus(true));
      setShowProgress(initClicked || getProgress('apfAuthStatus'));
    }
  }, [apfAuthInitProgress]);

  useEffect(() => {
    if(!getProgress('apfAuthStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getApfAuthProgress().then((res: any) => {
          setApfAuthorizationInitProgress(res);
        })
      }, 3000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated]);

  const setApfAuthorizationInitProgress = (aftAuthorizationState: InitSubStepsState) => {
    setApfAuthState(aftAuthorizationState);
    setApfAuthInitProgress(aftAuthorizationState);
    const allAttributesTrue = Object.values(aftAuthorizationState).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setNextStepEnabled(true));
      dispatch(setApfAuthStatus(true));
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
      for (let key in apfAuthInitProgress) {
        apfAuthInitProgress[key as keyof(InitSubStepsState)] = false;
        setApfAuthState(apfAuthInitProgress);
      }
    }
    const allAttributesTrue = Object.values(apfAuthInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    dispatch(setNextStepEnabled(status));
    dispatch(setInitializationStatus(status));
    dispatch(setApfAuthStatus(status));
    setApfAuthorizationInitProgress(getApfAuthState());
  }
  
  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const reinitialize = (event: any) => {
    setReinit(true);
    process(event);
  }

  const process = (event: any) => {
    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();
    window.electron.ipcRenderer.apfAuthButtonOnClick(connectionArgs, installationArgs, yaml).then((res: IResponse) => {
         // Some parts of Zen pass the response as a string directly into the object
         if (res.status == false && typeof res.details == "string") {
          res.details = { 3: res.details };
        }
        if (res?.details && res.details[3] && res.details[3].indexOf(JCL_UNIX_SCRIPT_OK) == -1) { // This check means we got an error during zwe init apfAuth
          alertEmitter.emit('showAlert', 'Please view Job Output for more details', 'error');
          window.electron.ipcRenderer.setStandardOutput(res.details[3]).then((res: any) => {
            toggleEditorVisibility("output");
          })
          updateProgress(false); //res.status may not necessarily be false, even if things go wrong
          apfAuthProceedActions(false);
          stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = true;
          clearInterval(timer);
        } else {
          updateProgress(res.status);
          apfAuthProceedActions(res.status);
          stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = !res.status;
          clearInterval(timer);
        }
      }).catch((err: any) => {
        clearInterval(timer);
        apfAuthProceedActions(false);
        updateProgress(false);
        // TODO: Test this
        //alertEmitter.emit('showAlert', err.toString(), 'error');
        stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = true;
        stages[STAGE_ID].isSkipped = true;
        if (typeof err === "string") {
          console.warn('zwe init apfauth failed', err);
        } else {
          console.warn('zwe init apfauth failed', err?.toString()); // toString() throws run-time error on undefined or null
        }
      });
  }

  // True - a proceed, False - blocked
  const apfAuthProceedActions = (status: boolean) => {
    dispatch(setNextStepEnabled(status));
    dispatch(setApfAuthStatus(status));
    dispatch(setInitializationStatus(status));
  }

  const formChangeHandler = (data: any, isYamlUpdated?: boolean) => {
    let updatedData = init ? (Object.keys(yaml?.zowe.setup.dataset).length > 0 ? yaml?.zowe.setup.dataset : data) : (data ? data : yaml?.zowe.setup.dataset);
    
    setInit(false);

    updatedData = isYamlUpdated ? data.zowe.setup.dataset : updatedData;
    if (updatedData && setupYaml && setupYaml.prefix !== updatedData.prefix) {
      const newPrefix = updatedData.prefix ? updatedData.prefix : '';
      const newData = Object.keys(setupYaml).reduce((acc, k) => {
        if (typeof(setupYaml[k]) === 'string' && setupYaml[k].startsWith(`${setupYaml.prefix}.`)) {
          return {...acc, [k]: setupYaml[k].replace(setupYaml.prefix, newPrefix), prefix: newPrefix}
        }
        return {...acc, [k]: setupYaml[k]}
      }, {});
    }

    if(validate) {
      validate(updatedData);
      if(validate.errors) {
        const errPath = validate.errors[0].schemaPath;
        const errMsg = validate.errors[0].message;
        setStageConfig(false, errPath+' '+errMsg, updatedData, false);
      } else {
        // setConfiguration(section, updatedData, true);
        setStageConfig(true, '', updatedData, true);
      }
    }
  }

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any, proceed: boolean) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setSetupYaml(data);
    updateProgress(proceed);
  }

  return (
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("yaml")}>View/Edit Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("jcl")}>View/Submit Job</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("output")}>View Job Output</Button>
      </Box>
      <ContainerCard title="APF Authorize Load Libraries" description="Run the `zwe init apfauth` command to APF authorize load libraries.">
      <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={formChangeHandler}/>
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap', marginBottom: '50px', color: 'text.secondary', fontSize: '13px' }}>
        {`Please review the following dataset setup configuration values before pressing run. If you need to make changes, go back to the previous step.\n`}
        </Typography>
        <Box sx={{ width: '60vw' }}>
            <TextField
                sx={{
                '& .MuiInputBase-root': { height: '60px', minWidth: '72ch', fontFamily: 'monospace' },
                }}
                label="Dataset Prefix"
                multiline
                maxRows={6}
                value={setupYaml.prefix ?? ""}
                variant="filled"
                disabled
            />
            <TextField
                sx={{
                '& .MuiInputBase-root': { height: '60px', minWidth: '72ch', fontFamily: 'monospace' },
                }}
                label="APF Authorized Load Library"
                multiline
                maxRows={6}
                value={setupYaml.authLoadlib ?? ""}
                variant="filled"
                disabled
            />
            <TextField
                sx={{
                '& .MuiInputBase-root': { height: '60px', minWidth: '72ch', fontFamily: 'monospace' },
                }}
                label="Zowe ZIS Plugins Load Library"
                multiline
                maxRows={6}
                value={setupYaml.authPluginLib ?? ""}
                variant="filled"
                disabled
            />
        </Box>
        {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Initialize APF Authorizations</Button>
        </FormControl> : null}
        <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="start-apf-progress">
        {!showProgress ? null :
          <React.Fragment> 
            <ProgressCard label="Write configuration file locally to temp directory" id="download-progress-card" status={apfAuthInitProgress?.writeYaml}/>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={apfAuthInitProgress?.uploadYaml}/>
            <ProgressCard label={`Run zwe init apfauth command`} id="upload-progress-card" status={apfAuthInitProgress?.success}/>
            <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => reinitialize(e)}>Reinitialize APF Authorizations</Button>
          </React.Fragment>
        }
        </Box>
        <Box sx={{ height: showProgress ? '60vh' : 'auto', minHeight: '60vh' }} id="apf-progress"></Box>
      </ContainerCard>
    </div>
    
  );
};

export default InitApfAuth;