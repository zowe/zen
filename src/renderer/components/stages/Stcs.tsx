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
import { Box, Button, FormControl, TextField, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import { setStcsStatus, setInitializationStatus } from './progress/progressSlice';
import ContainerCard from '../common/ContainerCard';import EditorDialog from "../common/EditorDialog";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { IResponse } from "../../../types/interfaces";
import ProgressCard from "../common/ProgressCard";
import React from "react";
import { createTheme } from '@mui/material/styles';
import { stages } from "../configuration-wizard/Wizard";
import { setActiveStep } from "./progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { getProgress, setStcsInitState, getStcsInitState, updateSubStepSkipStatus, getInstallationArguments, isInitializationStageComplete } from "./progress/StageProgressStatus";
import { InitSubStepsState } from "../../../types/stateInterfaces";
import { alertEmitter } from "../Header";
import { INIT_STAGE_LABEL, STC_STAGE_LABEL, ajv } from "../common/Utils";

const Stcs = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command
  const [subStageLabel] = useState(STC_STAGE_LABEL);

  const [STAGE_ID] = useState(getStageDetails(INIT_STAGE_LABEL).id);
  const [SUB_STAGES] = useState(!!getStageDetails(INIT_STAGE_LABEL).subStages);
  const [SUB_STAGE_ID] = useState(SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0);

  const [theme] = useState(createTheme());

  const dispatch = useAppDispatch();
  const [schema, setLocalSchema] = useState(useAppSelector(selectSchema));
  const [yaml, setLocalYaml] = useState(useAppSelector(selectYaml));
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.security?.stcs);
  const [setupDsYaml, setSetupDsYaml] = useState(yaml?.zowe?.setup?.dataset);
  const [showProgress, setShowProgress] = useState(getProgress('stcsStatus'));
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [stcsInitProgress, setStcsInitProgress] = useState(getStcsInitState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);
  const [stageStatus, setStageStatus] = useState(stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped);
  const stageStatusRef = useRef(stageStatus);

  const [installationArgs] = useState(getInstallationArguments());
  const [connectionArgs] = useState(useAppSelector(selectConnectionArgs));
  let timer: any;
  const [DEFAULT_ZOWE] = useState('ZWESLSTC');
  const [DEFAULT_ZIS] = useState('ZWESISTC');
  const [DEFAULT_AUX] = useState('ZWESASTC');

  const [defaultErrorMessage] = useState("Please ensure that the values for security.stcs attributes and dataset.proclib are accurate.");
  const [validate] = useState(() => ajv.getSchema("https://zowe.org/schemas/v2/server-base") || ajv.compile(schema?.properties?.zowe?.properties?.setup?.properties?.security?.properties?.stcs))

  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);

  useEffect(() => {
    let nextPosition;
    const stepProgress = getProgress('stcsStatus');

    dispatch(setInitializationStatus(isInitializationStageComplete()));
    setShowProgress(initClicked || stepProgress);

    if(stepProgress) {
      nextPosition = document.getElementById('stcs-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      nextPosition = document.getElementById('container-box-id');
      nextPosition?.scrollIntoView({behavior: 'smooth'});
    }

    setInit(true);
    dispatch(setNextStepEnabled(stepProgress));

    if(!setupYaml) {
      const newYaml = {...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, security: {...yaml.zowe.setup.security, stcs: {zowe: DEFAULT_ZOWE, zis: DEFAULT_ZIS, aux: DEFAULT_AUX}}}}};
      window.electron.ipcRenderer.setConfig(newYaml);
      setSetupYaml({zowe: DEFAULT_ZOWE, zis: DEFAULT_ZIS, aux: DEFAULT_AUX});
      setLocalYaml(newYaml);
      dispatch(setYaml(newYaml));
    }

    return () => {
      alertEmitter.emit('hideAlert');
      updateSubStepSkipStatus(SUB_STAGE_ID, stageStatusRef.current);
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(initClicked || getProgress('stcsStatus'));

    if(initClicked) {
      let nextPosition = document.getElementById('start-stcs-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      dispatchActions(false);
      setStateUpdated(!stateUpdated);
    }
  }, [initClicked]);

  useEffect(() => {
    if(!getProgress('stcsStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getInitStcsProgress().then((res: any) => {
          setStcsInitializationProgress(res);
          if(res.success){
            clearInterval(timer);
          }
        })
      }, 3000);

      if(showProgress) {
        const nextPosition = document.getElementById('start-stcs-progress');
        nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated]);

  useEffect(() => {
    const allAttributesTrue = Object.values(stcsInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      dispatchActions(true);
      setShowProgress(initClicked || getProgress('stcsStatus'));
    }
  }, [stcsInitProgress]);

  const setStcsInitializationProgress = (stcsInitState: InitSubStepsState) => {
    setStcsInitProgress(stcsInitState);
    setStcsInitState(stcsInitState);
    const allAttributesTrue = Object.values(stcsInitState).every(value => value === true);
    if(allAttributesTrue) {
      dispatchActions(true);
    }
  }

  const setStageSkipStatus = (status: boolean) => {
    stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = status;
    stages[STAGE_ID].isSkipped = !isInitializationStageComplete();
    setStageStatus(status);
  }

  const updateProgress = (status: boolean) => {
    setStateUpdated(!stateUpdated);
    if(!status) {
      for (let key in stcsInitProgress) {
        stcsInitProgress[key as keyof(InitSubStepsState)] = false;
        setStcsInitState(stcsInitProgress);
      }
    }
    const allAttributesTrue = Object.values(stcsInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    setStcsInitializationProgress(getStcsInitState());
    dispatchActions(status);
  }

  const dispatchActions = (status: boolean) => {
    dispatch(setStcsStatus(status));
    dispatch(setInitializationStatus(isInitializationStageComplete()));
    dispatch(setNextStepEnabled(status));
    setStageSkipStatus(!status);
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const reinitialize = (event: any) => {
    process(event);
  }

  const process = async (event: any) => {
    alertEmitter.emit('hideAlert');

    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();
    
    if(!installationArgs.dryRunMode){
      window.electron.ipcRenderer.initStcsButtonOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
        updateProgress(res.status);
        if(res.error) {
          alertEmitter.emit('showAlert', res.errorMsg+" "+defaultErrorMessage, 'error');
        }
        clearInterval(timer);
      }).catch((err: any) => {
        clearInterval(timer);
        updateProgress(false);
        window.electron.ipcRenderer.setStandardOutput(`zwe init stc failed:  ${typeof err === "string" ? err : err.toString()}`).then((res: any) => {
          toggleEditorVisibility("output");
        })
      });
    }
    else{
      setStcsInitState({
        writeYaml: true,
        uploadYaml: true,
        success: true
      });
      updateProgress(true);
    }
  }

  const handleFormChange = (data: any) => {
    let newData = init ? (Object.keys(setupYaml).length > 0 ? setupYaml : data?.zowe?.setup?.security?.stcs) : (data?.zowe?.setup?.security?.stcs ? data?.zowe?.setup?.security?.stcs : data);
    setInit(false);

    if (newData) {
      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setStageConfig(false, errPath+' '+errMsg, newData);
        } else {
          window.electron.ipcRenderer.setConfig({...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, security: {...yaml.zowe.setup.security, stcs: newData}}}});
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
      <ContainerCard title="Stcs" description="Install Zowe Main Started Tasks.">
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={(data: any) => {
          const newData = init ? (Object.keys(setupYaml).length > 0 ? setupYaml : data?.zowe?.setup?.security?.stcs) : (data?.zowe?.setup?.security?.stcs ? data?.zowe?.setup?.security?.stcs : data);
          setStageConfig(true, '', newData);
        }
        }/> }
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap', color: 'text.secondary', fontSize: '13px' }}>
          {`Please review the following started task (STC) configuration values from the security stage before initializing stcs.\n`}
        </Typography>
        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details ?? yaml))}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          
          <Box sx={{ width: '60vw' }}>
            <TextField
                sx={{
                '& .MuiInputBase-root': { height: '60px', minWidth: '72ch', fontFamily: 'monospace' },
                }}
                label="Zowe"
                value={setupYaml?.zowe ?? DEFAULT_ZOWE}
                variant="filled"
                disabled
            />
            <TextField
                sx={{
                '& .MuiInputBase-root': { height: '60px', minWidth: '72ch', fontFamily: 'monospace' },
                }}
                label="Zis"
                value={setupYaml?.zis ?? DEFAULT_ZIS}
                variant="filled"
                disabled
            />
            <TextField
                sx={{
                '& .MuiInputBase-root': { height: '60px', minWidth: '72ch', fontFamily: 'monospace' },
                }}
                label="Aux"
                value={setupYaml?.aux ?? DEFAULT_AUX}
                variant="filled"
                disabled
            />
            <TextField
                sx={{
                '& .MuiInputBase-root': { height: '60px', minWidth: '72ch', fontFamily: 'monospace' },
                }}
                label="Dataset Proclib"
                value={setupDsYaml?.proclib ?? ''}
                variant="filled"
                disabled
            />
        </Box>

          {!setupDsYaml?.proclib && <p style={{color:'red', fontSize: '12px'}}>The `dataset.proclib` is empty. Please ensure it contains the valid dataset name in the installation tab.</p>}

          {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" disabled={!setupDsYaml?.proclib} onClick={e => process(e)}>Initialize STC Config</Button>
          </FormControl> : null}


          <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="start-stcs-progress">
            {!showProgress ? null :
            <React.Fragment>
              <ProgressCard label={`Write configuration file locally to temp directory`} id="init-stcs-progress-card" status={stcsInitProgress.writeYaml}/>
              <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={stcsInitProgress.uploadYaml}/>
              <ProgressCard label={`Run zwe init stcs`} id="success-progress-card" status={stcsInitProgress.success}/>
              <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => reinitialize(e)}>Reinitialize STC Config</Button>
            </React.Fragment>
            }
          </Box>
        </Box>
        <Box sx={{ height: showProgress ? '1vh' : 'auto', minHeight: showProgress ? '1vh' : '0vh' }} id="stcs-progress"></Box>
      </ContainerCard>
    </div>
  );
};

export default Stcs;