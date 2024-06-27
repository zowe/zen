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
import { Box, Button, FormControl, TextField } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import { setInitializationStatus, setVsamStatus } from './progress/progressSlice';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { IResponse } from "../../../types/interfaces";
import ProgressCard from "../common/ProgressCard";
import React from "react";
import { createTheme } from '@mui/material/styles';
import { stages } from "../configuration-wizard/Wizard";
import { setActiveStep } from "./progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { setProgress, getProgress, setVsamInitState, mapAndSetSubStepSkipStatus, getInstallationArguments, getVsamInitState } from "./progress/StageProgressStatus";
import { InitSubStepsState } from "../../../types/stateInterfaces";
import { alertEmitter } from "../Header";

const Vsam = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const stageLabel = 'Initialization';
  const subStageLabel = 'Vsam';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;
  const SUB_STAGE_ID = SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0;

  const theme = createTheme();

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const setupSchema = schema?.properties?.zowe?.properties?.setup?.properties?.vsam;
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.vsam);
  const [showProgress, setShowProgress] = useState(getProgress('vsamStatus'));
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [vsamInitProgress, setVsamInitProgress] = useState(getVsamInitState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);
  const [reinit, setReinit] = useState(false);

  const [vsamDatasetName, setVsamDatasetName] = useState("");
  const [isDsNameValid, setIsDsNameValid] = useState(true);
  const [initError, setInitError] = useState(false);
  const [initErrorMsg, setInitErrorMsg] = useState('');

  const installationArgs = getInstallationArguments();
  const connectionArgs = useAppSelector(selectConnectionArgs);
  let timer: any;

  const defaultErrorMessage = "Please ensure that the volume, storage class & dataset values are accurate.";

  const ajv = new Ajv();
  ajv.addKeyword("$anchor");
  let vsamSchema;
  let validate: any;
  if(schema) {
    vsamSchema = schema?.properties?.zowe?.properties?.setup?.properties?.vsam;
  }

  if(vsamSchema) {
    validate = ajv.compile(vsamSchema);
  }

  useEffect(() => {

    setShowProgress(initClicked || getProgress('vsamStatus'));
    let nextPosition;

    const vsamDatasetName = yaml?.components[`caching-service`]?.storage?.vsam?.name|| '';
    if(vsamDatasetName) {
      datasetValidation(vsamDatasetName);
    }

    if(getProgress('vsamStatus')) {
      nextPosition = document.getElementById('vsam-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      nextPosition = document.getElementById('container-box-id');
      nextPosition?.scrollIntoView({behavior: 'smooth'});
    }

    updateProgress(getProgress('vsamStatus') && !stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped);
    setInit(true);

    return () => {
      alertEmitter.emit('hideAlert');
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(initClicked || getProgress('vsamStatus'));

    if(initClicked) {
      let nextPosition = document.getElementById('start-vsam-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setStateUpdated(!stateUpdated);
      dispatch(setVsamStatus(false));
    }
  }, [initClicked]);

  useEffect(() => {
    if(!getProgress('vsamStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getInitVsamProgress().then((res: any) => {
          setVsamInitializationProgress(res);
        })
      }, 3000);

      if(showProgress) {
        const nextPosition = document.getElementById('start-vsam-progress');
        nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated]);

  useEffect(() => {
    const allAttributesTrue = Object.values(vsamInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setVsamStatus(true));
      dispatch(setNextStepEnabled(true));
      setShowProgress(initClicked || getProgress('vsamStatus'));
    }
  }, [vsamInitProgress]);

  const setVsamInitializationProgress = (vsamInitState: InitSubStepsState) => {
    setVsamInitProgress(vsamInitState);
    setVsamInitState(vsamInitState);
    const allAttributesTrue = Object.values(vsamInitState).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setVsamStatus(true));
      dispatch(setNextStepEnabled(true));
    }
  }

  const setStageSkipStatus = (status: boolean) => {
    stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = status;
    stages[STAGE_ID].isSkipped = status;
    mapAndSetSubStepSkipStatus(SUB_STAGE_ID, status);
  }

  const updateProgress = (status: boolean) => {
    setStateUpdated(!stateUpdated);
    setStageSkipStatus(!status);
    if(!status) {
      for (let key in vsamInitProgress) {
        vsamInitProgress[key as keyof(InitSubStepsState)] = false;
        setVsamInitState(vsamInitProgress);
      }
    }
    const allAttributesTrue = Object.values(vsamInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    dispatch(setInitializationStatus(status));
    dispatch(setVsamStatus(status));
    dispatch(setNextStepEnabled(status));
    setVsamInitializationProgress(getVsamInitState());
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const reinitialize = (event: any) => {
    setReinit(true);
    process(event);
  }

  const process = async (event: any) => {
    alertEmitter.emit('hideAlert');

    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();
    window.electron.ipcRenderer.initVsamButtonOnClick(connectionArgs, installationArgs, (await window.electron.ipcRenderer.getConfig()).details ?? yaml).then((res: IResponse) => {
      updateProgress(res.status);
      if(res.error) {
        setInitError(true);
        setInitErrorMsg(`${res ? res.errorMsg : ''} ${defaultErrorMessage}`);
        alertEmitter.emit('showAlert', res.errorMsg+" "+defaultErrorMessage, 'error');
      }
      clearInterval(timer);
    }).catch((error: any) => {
      clearInterval(timer);
      updateProgress(false);
      console.warn('zwe init vsam failed');
    });
  }

  const handleFormChange = (data: any) => {
    alertEmitter.emit('hideAlert');

    let newData = init ? (Object.keys(setupYaml).length > 0 ? setupYaml : data?.zowe?.setup?.vsam) : (data?.zowe?.setup?.vsam ? data?.zowe?.setup?.vsam : data);
    setInit(false);

    if (newData) {
      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setStageConfig(false, errPath+' '+errMsg, newData, data);
        } else {
          window.electron.ipcRenderer.setConfig({...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, vsam: newData}}});
          setStageConfig(true, '', newData, data);
        }
      }
    }
  };

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any, updatedYaml?: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setSetupYaml(data);
    if(updatedYaml?.zowe) {
      setLYaml(updatedYaml);
    }
    handleUpdateYaml(data, updatedYaml);
  }

  const handleUpdateYaml = (data: any, newYaml: any) => {
    const currentYaml = newYaml?.zowe ? newYaml : yaml;
    const updatedYaml = {
      ...currentYaml,
      zowe: {
        ...currentYaml.zowe,
        setup: {
          ...currentYaml.zowe.setup,
          vsam: {
            ...data,
          }
        }
      }
    };
    setLYaml(updatedYaml);
    dispatch(setYaml(updatedYaml));
  }

  const handleUpdateVsamName = (newName: string) => {
    const updatedYaml = {
      ...yaml,
      components: {
        ...yaml.components,
        'caching-service': {
          ...yaml.components['caching-service'],
          storage: {
            ...yaml.components['caching-service'].storage,
            vsam: {
              ...yaml.components['caching-service'].storage.vsam,
              name: newName
            }
          }
        }
      }
    };
    setLYaml(updatedYaml);
    dispatch(setYaml(updatedYaml));
  };

  const datasetValidation = (dsName: string) => {
    const DsNamePattern = "^[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,21}$";
    const regEx = new RegExp(DsNamePattern);
    setIsDsNameValid(regEx.test(dsName));
  }


  const cachingServiceChangeHandler = (newValue: string) => {
    alertEmitter.emit('hideAlert');
    datasetValidation(newValue);
    handleUpdateVsamName(newValue);
  }

  return (
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("yaml")}>View/Edit Yaml</Button>
        {/* <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("jcl")}>View/Submit Job</Button> */}
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("output")}>View Job Output</Button>
      </Box>
      <ContainerCard title="Vsam" description="Configure Zowe Vsam.">
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/> }

        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details ?? yaml))}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={(data: any) => handleFormChange(data)} formData={setupYaml}/>
          
          <FormControl>
            <div>
              <TextField
                id="vsam-dataset-name"
                required
                style={{marginLeft: 0}}
                label="Vsam Dataset Name"
                variant="standard"
                value={yaml?.components[`caching-service`]?.storage?.vsam?.name || ""}
                onChange={(e) => {
                  cachingServiceChangeHandler(e.target.value);
                }}
              />
              {isDsNameValid && <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Zowe Caching Service VSAM data set.</p>}
              {!isDsNameValid && <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'red' }}>Invalid input. Please enter a valid VSAM dataset name.</p>}
            </div>
          </FormControl>

          {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" disabled={!isDsNameValid} onClick={e => process(e)}>Initialize Vsam Config</Button>
          </FormControl> : null}


          <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="start-vsam-progress">
            {!showProgress ? null :
            <React.Fragment> 
              <ProgressCard label={`Write configuration file locally to temp directory`} id="init-vsam-progress-card" status={vsamInitProgress?.writeYaml}/>
              <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={vsamInitProgress?.uploadYaml}/>
              <ProgressCard label={`Run zwe init vsam`} id="success-progress-card" status={vsamInitProgress?.success}/>
              <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" disabled={!isDsNameValid} onClick={e => reinitialize(e)}>Reinitialize Vsam Config</Button>
            </React.Fragment>
            }
          </Box>
        </Box>
        <Box sx={{ height: showProgress ? '35vh' : 'auto', minHeight: showProgress ? '35vh' : '10vh' }} id="vsam-progress"></Box>

      </ContainerCard>
    </div>
  );
};

export default Vsam;