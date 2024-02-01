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
import { selectYaml, selectSchema, setNextStepEnabled, setLoading } from '../configuration-wizard/wizardSlice';
import { selectConnectionArgs } from './connection/connectionSlice';
import { setApfAuthStatus, setInitializationStatus, selectApfAuthStatus, selectInitializationStatus } from './progressSlice';
import { IResponse } from '../../../types/interfaces';
import { setConfiguration, getConfiguration, getZoweConfig } from '../../../services/ConfigService';
import ProgressCard from '../common/ProgressCard';
import ContainerCard from '../common/ContainerCard';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";
import { selectInstallationArgs } from "./installation/installationSlice";
import { createTheme } from '@mui/material/styles';
import {stages} from "../configuration-wizard/Wizard";
import { alertEmitter } from "../Header";

const InitApfAuth = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const theme = createTheme();

  const stageId = 3;
  const subStageId = 1;
  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const setupSchema = schema?.properties?.zowe?.properties?.setup?.properties?.dataset;
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.dataset);
  const [showProgress, toggleProgress] = useState(false);
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [apfProgress, setApfProgress] = useState({
    writeYaml: false,
    uploadYaml: false,
    success: false,
  });

  const installationArgs = useAppSelector(selectInstallationArgs);
  let timer: any;

  const section = 'dataset';
  const initConfig = getConfiguration(section);

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
    dispatch(setNextStepEnabled(false));
    stages[stageId].subStages[subStageId].isSkipped = isStepSkipped;
    stages[stageId].isSkipped = isInitializationSkipped;
    if(Object.keys(initConfig) && Object.keys(initConfig).length != 0) {
      setSetupYaml(initConfig);
    }
    setInit(true);
  }, []);

  useEffect(() => {
    timer = setInterval(() => {
      window.electron.ipcRenderer.getApfAuthProgress().then((res: any) => {
        setApfProgress(res);
      })
    }, 3000);
    const nextPosition = document.getElementById('apf-progress');
    nextPosition.scrollIntoView({behavior: 'smooth'});
  }, [showProgress]);


  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const process = (event: any) => {
    event.preventDefault();
    toggleProgress(true);
    window.electron.ipcRenderer.apfAuthButtonOnClick(connectionArgs, installationArgs, getZoweConfig()).then((res: IResponse) => {
        if(!res.status){
          alertEmitter.emit('showAlert', res.details, 'error');
          toggleProgress(false);
        } else {
          apfAuthButtonProceedNextSteps(res.status);
          stages[stageId].subStages[subStageId].isSkipped = !res.status;
          clearInterval(timer);
        }
      }).catch((err: any) => {
        alertEmitter.emit('showAlert', err.toString(), 'error');
        toggleProgress(false);
        clearInterval(timer);
        apfAuthButtonProceedNextSteps(false);
        stages[stageId].subStages[subStageId].isSkipped = true;
        stages[stageId].isSkipped = true;
        console.warn('zwe init apfauth failed', err);
      });
  }

  const apfAuthButtonProceedNextSteps = (status: boolean) => {
    dispatch(setNextStepEnabled(status));
    dispatch(setInitializationStatus(status));
    dispatch(setApfAuthStatus(status));
  }

  const editHLQ = (data: any, isYamlUpdated?: boolean) => {
    let updatedData = init ? (Object.keys(initConfig).length > 0 ? initConfig: data) : (data ? data : initConfig);
    
    setInit(false);

    updatedData = isYamlUpdated ? data.dataset : updatedData;
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
        setConfiguration(section, updatedData, true);
        setStageConfig(true, '', updatedData, true);
      }
    }
  }

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any, proceed: boolean) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setSetupYaml(data);
    dispatch(setNextStepEnabled(proceed));
  }

  return (
    <div>
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("yaml")}>View/Edit Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("jcl")}>View/Submit Job</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("output")}>View Job Output</Button>
      </Box>
      <ContainerCard title="APF Authorize Load Libraries" description="Run the `zwe init apfauth` command to APF authorize load libraries.">
      <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={editHLQ}/>
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
                value={setupYaml.prefix}
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
                value={setupYaml.authLoadlib}
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
                value={setupYaml.authPluginLib}
                variant="filled"
                disabled
            />
        </Box>
        {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Run 'zwe init apfauth'</Button>
        </FormControl> : null}
        <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="apf-progress">
        {!showProgress ? null :
          <React.Fragment>
            <ProgressCard label="Write configuration file locally to temp directory" id="download-progress-card" status={apfProgress.writeYaml}/>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={apfProgress.uploadYaml}/>
            <ProgressCard label={`Run zwe init apfauth command`} id="upload-progress-card" status={apfProgress.success}/>
          </React.Fragment>
        }
        </Box> 
      </ContainerCard>
    </div>
    
  );
};

export default InitApfAuth;