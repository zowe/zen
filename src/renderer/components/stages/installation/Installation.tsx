/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useCallback, useEffect, useRef, useState} from "react";
import { Box, Button, FormControl, Typography, debounce } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { selectYaml, setYaml, selectSchema, setNextStepEnabled, setLoading} from '../../configuration-wizard/wizardSlice';
import { selectZoweVersion, setInstallationArgs } from './installationSlice';
import { selectConnectionArgs } from '../connection/connectionSlice';
import { setDatasetInstallationStatus, setInitializationStatus } from "../progress/progressSlice";
import { IResponse } from '../../../../types/interfaces';
import ProgressCard from '../../common/ProgressCard';
import ContainerCard from '../../common/ContainerCard';
import JsonForm from '../../common/JsonForms';
import EditorDialog from "../../common/EditorDialog";
import { alertEmitter } from "../../Header";
import { createTheme } from '@mui/material/styles';
import {stages} from "../../configuration-wizard/Wizard";
import { setActiveStep } from "../progress/activeStepSlice";
import { TYPE_YAML, TYPE_OUTPUT, JCL_UNIX_SCRIPT_OK, FALLBACK_YAML, ajv, INIT_STAGE_LABEL, INSTALL_STAGE_LABEL} from '../../common/Utils';
import { getStageDetails, getSubStageDetails } from "../../../../services/StageDetails"; 
import { getProgress, setDatasetInstallationState, getDatasetInstallationState, getInstallationTypeStatus, updateSubStepSkipStatus, getInstallationArguments, datasetInstallationStatus, isInitializationStageComplete } from "../progress/StageProgressStatus";
import { DatasetInstallationState } from "../../../../types/stateInterfaces";
import { validateDatasetIterator } from '../../../../services/DatasetValidation';

const Installation = () => {

  const [stageLabel] = useState(INIT_STAGE_LABEL);
  const [subStageLabel] = useState(INSTALL_STAGE_LABEL);

  const [STAGE_ID] = useState(getStageDetails(stageLabel).id);
  const [SUB_STAGES] = useState(!!getStageDetails(stageLabel).subStages);
  const [SUB_STAGE_ID]= useState(SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0);

  const [theme] = useState(createTheme());

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command
  const dispatch = useAppDispatch();
  // this schema will be used in the case where the user, for some reason, clicks "skip installation" without downloading or uploading a Zowe pax
  // Maybe we shouldnt allow the user to skip the installation stage??

  const [schema] = useState(useAppSelector(selectSchema));
  const [yaml, setLocalYaml] = useState(useAppSelector(selectYaml));
  const [connectionArgs] = useState(useAppSelector(selectConnectionArgs));
  const [setupSchema, setSetupSchema] = useState(schema?.properties?.zowe?.properties?.setup?.properties?.dataset);
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.dataset || FALLBACK_YAML?.zowe?.setup?.dataset);
  const [showProgress, setShowProgress] = useState(getProgress('datasetInstallationStatus'));
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [contentType, setContentType] = useState('');
  const [mvsDatasetInitProgress, setMvsDatasetInitProgress] = useState(getDatasetInstallationState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);
  const [installationArgs, setInstArgs] = useState(getInstallationArguments());
  const [version] = useState(useAppSelector(selectZoweVersion));
  const [stageStatus, setStageStatus] = useState(stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped);
  const stageStatusRef = useRef(stageStatus);

  let timer: any;
  const [installationType] = useState(getInstallationTypeStatus().installationType);

  const [validate] = useState(() => ajv.getSchema("https://zowe.org/schemas/v2/server-base") || ajv.compile(setupSchema));

  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);
  
  const datasetPropertiesCount = setupSchema ? Object.keys(setupSchema.properties).length : 0;

  useEffect(() => {
    dispatch(setInitializationStatus(isInitializationStageComplete()));

    if(getProgress("datasetInstallationStatus")) {
      const nextPosition = document.getElementById('save-installation-progress');
      if(nextPosition) nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const nextPosition = document.getElementById('container-box-id');
      if(nextPosition) nextPosition.scrollIntoView({behavior: 'smooth'});
    }

    if(installationArgs != undefined && !installationArgs.dryRunMode){
      window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
        function mergeInstallationArgsAndYaml(yaml: any){
          let yamlObj = JSON.parse(JSON.stringify(yaml));
          // console.log('merging yaml obj:', JSON.stringify(yamlObj));
          delete yamlObj.installationArgs;
          if (installationArgs.installationDir) {
            yamlObj.zowe.runtimeDirectory = installationArgs.installationDir;
          } else if(!installationArgs.installationDir && yamlObj.zowe.runtimeDirectory){
            //setting this because it is needed many places in InstallationHandler.tsx. This whole architecture has become an absolute mess.
            dispatch(setInstallationArgs({...installationArgs, installationDir: yamlObj.zowe.runtimeDirectory}));
          }
          if (installationArgs.workspaceDir) {
            yamlObj.zowe.workspaceDirectory = installationArgs.workspaceDir;
          }
          if (installationArgs.logDir) {
            yamlObj.zowe.logDirectory = installationArgs.logDir;
          }
          if (installationArgs.extensionDir) {
            yamlObj.zowe.extensionDirectory = installationArgs.extensionDir;
          }
          if (installationArgs.rbacProfile) {
            yamlObj.zowe.rbacProfileIdentifier = installationArgs.rbacProfile;
          }
          if ((yamlObj.zowe.job?.name === undefined || yamlObj.zowe.job?.name === '') && installationArgs.jobName) { //this undefined check is necessary because InstallationStage.jobName has a defualt, and therefore this would always overwrite the value in the config
            if(yamlObj.zowe.job === undefined){
              yamlObj.zowe.job = {
                name: installationArgs.jobName
              }
            } else {
              yamlObj.zowe.job.name = installationArgs.jobName;
            }
          }
          if ((yamlObj.zowe.job?.prefix === undefined || yamlObj.zowe.job?.prefix === '') && installationArgs.jobPrefix) {
            yamlObj.zowe.job.prefix = installationArgs.jobPrefix;
          }
          if (installationArgs.cookieId) {
            yamlObj.zowe.cookieIdentifier = installationArgs.cookieId;
          }
          if (installationArgs.javaHome) {
            if(yamlObj.java === undefined) yamlObj.java = {home: ""}
            yamlObj.java.home = installationArgs.javaHome;
          }
          if (installationArgs.nodeHome) {
            if(yamlObj.node === undefined) yamlObj.node = {home: ""}
            yamlObj.node.home = installationArgs.nodeHome;
          }
          if(yamlObj.zOSMF === undefined) yamlObj.zOSMF = {host: "", port: 443, applId: ""}
          if (installationArgs.zosmfHost) {
            yamlObj.zOSMF.host = installationArgs.zosmfHost;
          }
          if ((yamlObj.zOSMF.port === undefined || yamlObj.zOSMF.port === '') && installationArgs.zosmfPort) {
            yamlObj.zOSMF.port = Number(installationArgs.zosmfPort);
          }
          if ((yamlObj.zOSMF.applId === undefined || yamlObj.zOSMF.applId === '') && installationArgs.zosmfApplId) {
            yamlObj.zOSMF.applId = installationArgs.zosmfApplId;
          }
          return yamlObj;
        }
        if(res.details.zowe === undefined){
          //for fallback scenario where user does NOT download or upload a pax and clicks "skip" on the installation stage. sets in redux but not on disk. This should never occur
          let yamlObj = mergeInstallationArgsAndYaml(FALLBACK_YAML);
          // console.log('setting yaml:', yamlObj);
          setLocalYaml(yamlObj)
          dispatch(setYaml(yamlObj))
        } else {
          let yamlObj = mergeInstallationArgsAndYaml(res.details);
          if(res.details.zowe?.setup?.dataset === undefined){
            dispatch(setYaml({...yamlObj, zowe: {...yamlObj.zowe, setup: {...yamlObj.zowe.setup, dataset: FALLBACK_YAML.zowe.setup.dataset}} }));
          } else {
            dispatch(setYaml(yamlObj));
            setSetupYaml(yamlObj.zowe.setup.dataset);
          }
        }
      })
    }

    setIsFormInit(true);

    dispatch(setNextStepEnabled(getProgress('datasetInstallationStatus')));
    
    if(installationType === 'smpe') {
      const status = getProgress('datasetInstallationStatus');
      setStageSkipStatus(!status);
      installProceedActions(status);
    }

    return () => {
      updateSubStepSkipStatus(SUB_STAGE_ID, stageStatusRef.current);
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
      alertEmitter.emit('hideAlert');
    }
  }, []);

  useEffect(() => {
    setShowProgress((initClicked || getProgress('datasetInstallationStatus')));

    if(initClicked) {
      const nextPosition = document.getElementById('installation-progress');
      if(nextPosition) nextPosition.scrollIntoView({ behavior: 'smooth', block: 'end' });
      installProceedActions(false);
      setStateUpdated(!stateUpdated);
    }
  }, [initClicked]);

  useEffect(() => {
    const allAttributesTrue = Object.values(mvsDatasetInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      installProceedActions(true);
      setStageSkipStatus(false);
    }
  }, [mvsDatasetInitProgress]);

  useEffect(() => {
    const stageComplete = mvsDatasetInitProgress.uploadYaml && mvsDatasetInitProgress.initMVS && mvsDatasetInitProgress.install;
    if(!stageComplete && showProgress) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getInstallationProgress().then((res: any) => {
          setMvsDatasetInitializationProgress(res);
          if(res.success){
            clearInterval(timer);
          }
        })
      }, 3000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated, mvsDatasetInitProgress]);

  const setMvsDatasetInitializationProgress = (datasetInitState: DatasetInstallationState) => {
    setMvsDatasetInitProgress(datasetInitState);
    setDatasetInstallationState(datasetInitState);
    const allAttributesTrue = Object.values(datasetInitState).every(value => value === true);
    if(allAttributesTrue) {
      installProceedActions(true);
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
      for (let key in mvsDatasetInitProgress) {
        mvsDatasetInitProgress[key as keyof(DatasetInstallationState)] = false;
        setDatasetInstallationState(mvsDatasetInitProgress);
      }
    }
    const allAttributesTrue = Object.values(mvsDatasetInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    setMvsDatasetInitializationProgress(getDatasetInstallationState());
    installProceedActions(status);
  }

  // True - a proceed, False - blocked
  const installProceedActions = (status: boolean) => {
    dispatch(setDatasetInstallationStatus(status));
    dispatch(setInitializationStatus(isInitializationStageComplete()));
    dispatch(setNextStepEnabled(status));
    setStageSkipStatus(!status);
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const process = async (event: any) => {

    const areDatasetsValid = validateDatasets();
    if (!areDatasetsValid){
      event.preventDefault();
      return;
    }

    alertEmitter.emit('hideAlert');
    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();
    dispatch(setLoading(true));
    // FIXME: runtime dir is hardcoded, fix there and in InstallActions.ts - Unpax and Install functions
    if(!installationArgs.dryRunMode){
    Promise.all([
      window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.setup.dataset', setupYaml),
    ]).then(async () => {
      dispatch(setLoading(false));
      setYaml(window.electron.ipcRenderer.getConfig());
      setShowProgress(true);
      dispatch(setLoading(false)); /* change skipDownload ?? false --> true to skip upload/download steps for quicker development */
      window.electron.ipcRenderer.installButtonOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
        // Some parts of Wizard pass the response as a string directly into the object
        if (res.status == false && typeof res.details == "string") {
          res.details = { 3: res.details };
        }
        if (!res.status && res?.details && res.details[3] && res.details[3].indexOf(JCL_UNIX_SCRIPT_OK) == -1) { // This check means we got an error during zwe install
          alertEmitter.emit('showAlert', 'Please view Job Output for more details', 'error');
          window.electron.ipcRenderer.setStandardOutput(JSON.stringify(res.details[3], null, 2).replace(/\\\\r\\\\n/gm, '\r\n')).then((res: any) => {
            toggleEditorVisibility("output");
          })
          updateProgress(false);
          clearInterval(timer);
        } else {
          updateProgress(res.status);
          clearInterval(timer);
        }
      }).catch((err: any) => {
        clearInterval(timer);
        updateProgress(false);
        window.electron.ipcRenderer.setStandardOutput(`zwe init mvs failed:  ${typeof err === "string" ? err : err.toString()}`).then((res: any) => {
          toggleEditorVisibility("output");
        })
      });
    })
  }
  else{
    dispatch(setLoading(false));
    setMvsDatasetInitializationProgress({
      uploadYaml: true,
      install: true,
      initMVS: true
    })
    updateProgress(true);
    }
  }

  const validateDatasets = () => {

    if(Object.keys(setupYaml).length < datasetPropertiesCount) {
      const errorMessage = `One or more required dataset values are missing. Please ensure all fields are filled in.`;
      alertEmitter.emit('showAlert', errorMessage, 'error');
      return false;
    }

    const {isValid, key} = validateDatasetIterator(setupYaml);

    if (!isValid) {
      const errorMessage = `The dataset '${key.toUpperCase()}' is invalid. Please verify the dataset name and try again.`;
      alertEmitter.emit('showAlert', errorMessage, 'error');
      return false;
    }

    return true;
  };

  const debouncedChange = useCallback(
    debounce((state: any)=>{handleFormChange(state)}, 1000),
    []
  )

  const handleFormChange = async (data: any, isYamlUpdated?: boolean) => {
    let updatedData = isFormInit ? (Object.keys(setupYaml).length > 0 ? setupYaml : data.zowe.setup.dataset) : (data.zowe?.setup?.dataset ? data.zowe.setup.dataset : data);
    
    setIsFormInit(false);

    if(validate) {
      validate(updatedData);
      if(validate.errors) {
        const errPath = validate.errors[0].schemaPath;
        const errMsg = validate.errors[0].message;
        setStageConfig(false, errPath+' '+errMsg, updatedData);
      } else {
        const newYaml = {...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, dataset: updatedData}}};
        setLocalYaml(newYaml);
        window.electron.ipcRenderer.setConfig(newYaml)
        setStageConfig(true, '', updatedData);
      }
    }
  }

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    if(!isValid) {
      alertEmitter.emit('showAlert', errorMsg, 'error');
    }
    setSetupYaml(data);
  }

  return (
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        {/* <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button> */}
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Installation" description="Provide installation details."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={(data: any) => {
          const updatedData = isFormInit ? (Object.keys(setupYaml).length > 0 ? setupYaml : data.zowe.setup.dataset) : (data.zowe?.setup?.dataset ? data.zowe.setup.dataset : data);
          setStageConfig(true, '', updatedData);
        }
        }/>}
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap', marginBottom: '50px', color: 'text.secondary', fontSize: '13px' }}>
        {installationType === 'smpe' ? `Please input the corresponding values used during the SMPE installation process.` : `Ready to download Zowe ${version} and deploy it to the ${installationArgs.installationDir}\nThen we will install the MVS data sets, please provide the HLQ below.\n`}
        </Typography>

        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details ?? yaml))}>
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
        </Box>
        {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>{'Install MVS datasets'}</Button>
          {/* <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e, true)}>{installationType === 'smpe' ? 'Save' : 'SKIP DOWNLOAD and Install MVS datasets'}</Button> */}
        </FormControl> : null}
        <Box sx={{height: showProgress ? 'calc(50vh - 220px)' : '0'}} id="start-installation-progress">
        {!showProgress ? null :
          <React.Fragment>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={mvsDatasetInitProgress.uploadYaml}/>
            <ProgressCard label="Run installation script (zwe install)" id="install-progress-card" status={mvsDatasetInitProgress.install}/>
            <ProgressCard label="Run MVS dataset initialization script (zwe init mvs)" id="install-progress-card" status={mvsDatasetInitProgress.initMVS}/>
            <Button id="reinstall-button" sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>{'Reinstall MVS datasets'}</Button>
          </React.Fragment>
        }
        </Box>
        <Box sx={{ height: '0', minHeight: '0' }} id="save-installation-progress"></Box>
        <Box sx={{ height: showProgress ? '45vh' : 'auto' }} id="installation-progress"></Box>
      </ContainerCard>
    </div>
  );
};

export default Installation;