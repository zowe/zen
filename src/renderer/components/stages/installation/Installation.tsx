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
import { selectYaml, setYaml, selectSchema, setNextStepEnabled, setLoading } from '../../configuration-wizard/wizardSlice';
import { selectInstallationArgs, selectZoweVersion } from './installationSlice';
import { selectConnectionArgs } from '../connection/connectionSlice';
import { setDatasetInstallationStatus, setInitializationStatus ,selectDatasetInstallationStatus, selectInitializationStatus } from "../progress/progressSlice";
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
import { getStageDetails, getSubStageDetails } from "../progress/progressStore"; 

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
  const schema = useAppSelector(selectSchema);
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const setupSchema = schema?.properties?.zowe?.properties?.setup?.properties?.dataset;
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.dataset);
  const [showProgress, toggleProgress] = useState(false);
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [installationProgress, setInstallationProgress] = useState({
    uploadYaml: false,
    download: false,
    upload: false,
    unpax: false,
    install: false,
    initMVS: false
  });

  const installationArgs = useAppSelector(selectInstallationArgs);
  const version = useAppSelector(selectZoweVersion);
  let timer: any;

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

  const isStepSkipped = !useAppSelector(selectDatasetInstallationStatus);
  const isInitializationSkipped = !useAppSelector(selectInitializationStatus);
  
  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    stages[stageId].subStages[subStageId].isSkipped = isStepSkipped;
    stages[stageId].isSkipped = isInitializationSkipped;
    setIsFormInit(true);

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    timer = setInterval(() => {
      window.electron.ipcRenderer.getInstallationProgress().then((res: any) => {
        setInstallationProgress(res);
      })
    }, 3000);
    const nextPosition = document.getElementById('installation-progress');
    nextPosition.scrollIntoView({behavior: 'smooth'});
  }, [showProgress]);

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const process = (event: any) => {
    event.preventDefault();
    dispatch(setLoading(true));
    const {javaHome, nodeHome, installationDir, installationType, smpeDir} = installationArgs;
    // FIXME: runtime dir is hardcoded, fix there and in InstallActions.ts - Unpax and Install functions

    Promise.all([
      window.electron.ipcRenderer.setConfigByKey('zowe.setup.dataset', setupYaml),
    ]).then(async () => {
      if(installationType === 'smpe'){
        dispatch(setNextStepEnabled(true));
        dispatch(setDatasetInstallationStatus(true));
        dispatch(setInitializationStatus(true));
        dispatch(setLoading(false));
      } else {
        setYaml(window.electron.ipcRenderer.getConfig());
        toggleProgress(true);
        dispatch(setLoading(false));
        const config = (await window.electron.ipcRenderer.getConfig()).details.config ?? yaml;
        window.electron.ipcRenderer.installButtonOnClick(connectionArgs, installationArgs, version, yaml).then((res: IResponse) => {
          if(!res.status){ //errors during runInstallation()
            alertEmitter.emit('showAlert', res.details, 'error');
          }
          dispatch(setNextStepEnabled(res.status));
          dispatch(setDatasetInstallationStatus(res.status));
          dispatch(setDatasetInstallationStatus(true));
          dispatch(setInitializationStatus(true));
          clearInterval(timer);
        }).catch(() => {
          clearInterval(timer);
          dispatch(setNextStepEnabled(false));
          dispatch(setInitializationStatus(false));
          dispatch(setDatasetInstallationStatus(false));
          stages[stageId].subStages[subStageId].isSkipped = true;
          stages[stageId].isSkipped = true;
          console.warn('Installation failed');
        });
      }
    })
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
    <div>
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Installation" description="Provide installation details."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>}
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap', marginBottom: '50px', color: 'text.secondary', fontSize: '13px' }}>
          {installationArgs.installationType === 'smpe' ? `Please input the corresponding values used during the SMPE installation process.` : `Ready to download Zowe ${version} and deploy it to the ${installationArgs.installationDir}\nThen we will install MVS data sets, please provide HLQ below\n`}
        </Typography>

        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details.config ?? yaml))}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
        </Box>  
        {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>{installationArgs.installationType === 'smpe' ? 'Save' : 'Install MVS datasets'}</Button>
        </FormControl> : null}
        <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="installation-progress">
        {!showProgress ? null :
          <React.Fragment>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={installationProgress.uploadYaml}/>
            <ProgressCard label="Download convenience build pax locally" id="download-progress-card" status={installationProgress.download}/>
            <ProgressCard label={`Upload pax file to ${installationArgs.installationDir}`} id="upload-progress-card" status={installationProgress.upload}/>
            <ProgressCard label="Unpax installation files" id="unpax-progress-card" status={installationProgress.unpax}/>
            <ProgressCard label="Run installation script (zwe install)" id="install-progress-card" status={installationProgress.install}/>
            <ProgressCard label="Run MVS dataset initialization script (zwe init mvs)" id="install-progress-card" status={installationProgress.initMVS}/>
          </React.Fragment>
        }
        </Box> 
      </ContainerCard>
    </div>
    
  );
};

export default Installation;