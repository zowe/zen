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
import { selectYaml, setYaml, selectSchema, setNextStepEnabled, setLoading, setSchema } from '../../configuration-wizard/wizardSlice';
import { selectInstallationArgs, selectZoweVersion, selectInstallationType, setInstallationArgs } from './installationSlice';
import { selectConnectionArgs } from '../connection/connectionSlice';
import { setDatasetInstallationStatus, setInitializationStatus } from "../progress/progressSlice";
import { IResponse } from '../../../../types/interfaces';
import ProgressCard from '../../common/ProgressCard';
import ContainerCard from '../../common/ContainerCard';
import JsonForm from '../../common/JsonForms';
import EditorDialog from "../../common/EditorDialog";
import Ajv from "ajv";
import { alertEmitter } from "../../Header";
import { createTheme } from '@mui/material/styles';
import {stages} from "../../configuration-wizard/Wizard";
import { setActiveStep } from "../progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "../../../../utils/StageDetails"; 
import { setProgress, getProgress, setDatasetInstallationState, getDatasetInstallationState, getInstallationTypeStatus, mapAndSetSkipStatus, getInstallationArguments } from "../progress/StageProgressStatus";
import { DatasetInstallationState } from "../../../../types/stateInterfaces";
import { FALLBACK_SCHEMA, FALLBACK_YAML } from "../../../../utils/yamlSchemaDefaults";

const Installation = () => {

  const stageLabel = 'Initialization';
  const subStageLabel = 'Installation';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;
  const SUB_STAGE_ID = SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0;

  const theme = createTheme();

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const stageId = 3;
  const subStageId = 0;
  const dispatch = useAppDispatch();
  // this schema will be used in the case where the user, for some reason, clicks "skip installation" without downloading or uploading a Zowe pax
  // Maybe we shouldnt allow the user to skip the installation stage??

  const reduxSchema = useAppSelector(selectSchema);
  const [schema] = useState(typeof reduxSchema === "object" && Object.keys(reduxSchema).length > 0 ? reduxSchema : FALLBACK_SCHEMA);
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [setupSchema, setSetupSchema] = useState(schema?.properties?.zowe?.properties?.setup?.properties?.dataset || FALLBACK_SCHEMA.properties?.zowe?.properties?.setup?.properties?.dataset);
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.dataset || FALLBACK_YAML?.zowe?.setup?.dataset);
  const [showProgress, setShowProgress] = useState(getProgress('datasetInstallationStatus'));
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [mvsDatasetInitProgress, setMvsDatasetInitProgress] = useState(getDatasetInstallationState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);

  const [installationArgs, setInstArgs] = useState(getInstallationArguments());
  const version = useAppSelector(selectZoweVersion);
  let timer: any;
  const installationType = getInstallationTypeStatus().installationType;

  const section = 'dataset';
  // const initConfig = getConfiguration(section);

  const TYPE_YAML = "yaml";
  const TYPE_JCL = "jcl";
  const TYPE_OUTPUT = "output";

  const ajv = new Ajv();
  ajv.addKeyword("$anchor");
  let datasetSchema;
  let validate: any;
  if(schema) {
    datasetSchema = schema?.properties?.zowe?.properties?.setup?.properties?.dataset;
  }

  if(datasetSchema) {
    validate = ajv.compile(datasetSchema);
  }
  
  useEffect(() => {

    if(getProgress("datasetInstallationStatus")) {
      if(installationType !== 'smpe') {
        const nextPosition = document.getElementById('start-installation-progress');
        nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const nextPosition = document.getElementById('save-installation-progress');
        nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
      }
    } else {
      const nextPosition = document.getElementById('container-box-id');
      nextPosition.scrollIntoView({behavior: 'smooth'});
    }

    window.electron.ipcRenderer.getConfigByKey("installationArgs").then((res: IResponse) => {
      if(res != undefined){
        console.log("got installation args:", JSON.stringify(res));
        setInstArgs((res as any));
      }
    })

    setIsFormInit(true);

    window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
      function mergeInstallationArgsAndYaml(yaml: any){
        let yamlObj = JSON.parse(JSON.stringify(yaml));
        console.log('merging yaml obj:', JSON.stringify(yamlObj));
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
        if (installationArgs.jobName) {
          yamlObj.zowe.job.name = installationArgs.jobName;
        }
        if (installationArgs.jobPrefix) {
          yamlObj.zowe.job.prefix = installationArgs.jobPrefix;
        }
        if (installationArgs.cookieId) {
          yamlObj.zowe.cookieIdentifier = installationArgs.cookieId;
        }
        if (installationArgs.javaHome) {
          yamlObj.java.home = installationArgs.javaHome;
        }
        if (installationArgs.nodeHome) {
          yamlObj.node.home = installationArgs.nodeHome;
        }
        if (installationArgs.zosmfHost) {
          yamlObj.zOSMF.host = installationArgs.zosmfHost;
        }
        if (installationArgs.zosmfPort) {
          yamlObj.zOSMF.port = Number(installationArgs.zosmfPort);
        }
        if (installationArgs.zosmfApplId) {
          yamlObj.zOSMF.applId = installationArgs.zosmfApplId;
        }
        return yamlObj;
      }
      if(res.details.zowe === undefined){
        //for fallback scenario where user does NOT download or upload a pax and clicks "skip" on the installation stage. sets in redux but not on disk
        let yamlObj = mergeInstallationArgsAndYaml(FALLBACK_YAML);
        // console.log('setting yaml:', yamlObj);
        setLYaml(yamlObj)
        dispatch(setYaml(yamlObj))
      } else {
        // console.log('got config:', JSON.stringify(res.details));
        let yamlObj = mergeInstallationArgsAndYaml(res.details);
        if(res.details.zowe?.setup?.dataset === undefined){
          // console.log('setting yaml:',{...yamlObj, zowe: {...yamlObj.zowe, setup: {...yamlObj.zowe.setup, dataset: FALLBACK_YAML.zowe.setup.dataset}} });
          dispatch(setYaml({...yamlObj, zowe: {...yamlObj.zowe, setup: {...yamlObj.zowe.setup, dataset: FALLBACK_YAML.zowe.setup.dataset}} }));
        } else {
          dispatch(setYaml(yamlObj));
        }
      }
    })

    window.electron.ipcRenderer.getSchema().then((res: IResponse) => {
      if(res.details === undefined){
        //for fallback scenario where user does NOT download or upload a pax and clicks "skip" on the installation stage. sets in redux
        dispatch(setSchema(FALLBACK_SCHEMA));
      }
    })
    
    if(installationType === 'smpe') {
      const status = getProgress('datasetInstallationStatus');
      setStageSkipStatus(!status);
      setDsInstallStageStatus(status);
    } else {
      updateProgress(getProgress('datasetInstallationStatus'));
    }

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(installationType!=='smpe' && (initClicked || getProgress('datasetInstallationStatus')));

    if(initClicked) {
      const nextPosition = document.getElementById('installation-progress');
      nextPosition.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setStateUpdated(!stateUpdated);
      dispatch(setDatasetInstallationStatus(false));
    }
  }, [initClicked]);

  useEffect(() => {
    const allAttributesTrue = Object.values(mvsDatasetInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setNextStepEnabled(true));
      dispatch(setDatasetInstallationStatus(true));
      setShowProgress(installationType!=='smpe' && (initClicked || getProgress('datasetInstallationStatus')));
    }
  }, [mvsDatasetInitProgress]);

  useEffect(() => {
    if(!getProgress('datasetInstallationStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getInstallationProgress().then((res: any) => {
          setMvsDatasetInitializationProgress(res);
        })
      }, 3000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated]);

  const setMvsDatasetInitializationProgress = (datasetInitState: DatasetInstallationState) => {
    setMvsDatasetInitProgress(datasetInitState);
    setDatasetInstallationState(datasetInitState);
    const allAttributesTrue = Object.values(datasetInitState).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setNextStepEnabled(true));
      dispatch(setDatasetInstallationStatus(true));
    }
  }

  const setStageSkipStatus = (status: boolean) => {
    stages[stageId].subStages[subStageId].isSkipped = status;
    stages[stageId].isSkipped = status;
    mapAndSetSkipStatus(subStageId, status);
  }

  const setDsInstallStageStatus = (status: boolean) => {
    dispatch(setNextStepEnabled(status));
    dispatch(setInitializationStatus(status));
    dispatch(setDatasetInstallationStatus(status));
  }

  const updateProgress = (status: boolean) => {
    setStateUpdated(!stateUpdated);
    setStageSkipStatus(!status);
    if(!status) {
      for (let key in mvsDatasetInitProgress) {
        mvsDatasetInitProgress[key as keyof(DatasetInstallationState)] = false;
        setDatasetInstallationState(mvsDatasetInitProgress);
      }
    }
    const allAttributesTrue = Object.values(mvsDatasetInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    setDsInstallStageStatus(status);
    setMvsDatasetInitializationProgress(getDatasetInstallationState());
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const process = (event: any, skipDownload?: boolean) => {

    if(!(installationType === 'smpe')) {
      setInitClicked(true);
      updateProgress(false);
    }
    event.preventDefault();
    dispatch(setLoading(true));
    // FIXME: runtime dir is hardcoded, fix there and in InstallActions.ts - Unpax and Install functions

    if(installationType === 'smpe'){
      setStageSkipStatus(false);
      setDsInstallStageStatus(true);
      dispatch(setLoading(false));
      setShowProgress(false);
    } else {
      setYaml(window.electron.ipcRenderer.getConfig());
      setShowProgress(true);
      dispatch(setLoading(false));
      window.electron.ipcRenderer.installButtonOnClick(connectionArgs, installationArgs, version, yaml, skipDownload ?? false).then((res: IResponse) => {
        if(!res.status){ //errors during runInstallation()
          alertEmitter.emit('showAlert', res.details, 'error');
        }
        if(res.details?.mergedYaml != undefined){
          dispatch(setYaml(res.details.mergedYaml));
          window.electron.ipcRenderer.setConfig(res.details.mergedYaml);
        }
        updateProgress(true);
        clearInterval(timer);
      }).catch(() => {
        clearInterval(timer);
        updateProgress(false);
      });
    }
  }

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
        window.electron.ipcRenderer.setConfig(newYaml)
        setStageConfig(true, '', updatedData);
      }
    }
  }

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setSetupYaml(data);
  }

  return (
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Installation" description="Provide installation details."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>}
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap', marginBottom: '50px', color: 'text.secondary', fontSize: '13px' }}>
          {installationType === 'smpe' ? `Please input the corresponding values used during the SMPE installation process.` : `Ready to download Zowe ${version} and deploy it to the ${installationArgs.installationDir}\nThen we will install MVS data sets, please provide HLQ below\n`}
        </Typography>

        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details.config ?? yaml))}>
          {!isFormValid && formError && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
        </Box>
        {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>{installationType === 'smpe' ? 'Save' : 'Install MVS datasets'}</Button>
          {/* <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e, true)}>{installationType === 'smpe' ? 'Save' : 'SKIP DOWNLOAD and Install MVS datasets'}</Button> */}
        </FormControl> : null}
        <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : '0'}} id="start-installation-progress">
        {!showProgress ? null :
          <React.Fragment>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={mvsDatasetInitProgress.uploadYaml}/>
            <ProgressCard label="Download convenience build pax locally" id="download-progress-card" status={mvsDatasetInitProgress.download}/>
            <ProgressCard label={`Upload pax file to ${installationArgs.installationDir}`} id="upload-progress-card" status={mvsDatasetInitProgress.upload}/>
            <ProgressCard label="Unpax installation files" id="unpax-progress-card" status={mvsDatasetInitProgress.unpax}/>
            <ProgressCard label="Run installation script (zwe install)" id="install-progress-card" status={mvsDatasetInitProgress.install}/>
            <ProgressCard label="Run MVS dataset initialization script (zwe init mvs)" id="install-progress-card" status={mvsDatasetInitProgress.initMVS}/>
            <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>{installationType === 'smpe' ? 'Save' : 'Reinstall MVS datasets'}</Button>
          </React.Fragment>
        }
        </Box>
        <Box sx={{ height: '0', minHeight: '0' }} id="save-installation-progress"></Box>
        <Box sx={{ height: showProgress ? '55vh' : 'auto', minHeight: '55vh' }} id="installation-progress"></Box>
      </ContainerCard>
    </div>
  );
};

export default Installation;