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
import { Box, Button, FormControl, InputLabel, Select, TextField, MenuItem } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import { setInitializationStatus, setCachingServiceStatus } from './progress/progressSlice';
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
import { getProgress, setVsamInitState, updateSubStepSkipStatus, getInstallationArguments, getVsamInitState, isInitializationStageComplete, getCachedZoweVersion } from "./progress/StageProgressStatus";
import { InitSubStepsState } from "../../../types/stateInterfaces";
import { alertEmitter } from "../Header";
import { INIT_STAGE_LABEL, ajv } from "../common/Utils";

const CachingService = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const subStageLabel = 'Caching Service';

  const [STAGE_ID] = useState(getStageDetails(INIT_STAGE_LABEL).id);
  const [SUB_STAGES] = useState(!!getStageDetails(INIT_STAGE_LABEL).subStages);
  const [SUB_STAGE_ID] = useState(SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0);

  const [theme] = useState(createTheme());

  const dispatch = useAppDispatch();
  const [schema] = useState(useAppSelector(selectSchema));
  const yaml = useAppSelector(selectYaml);
  const [setupSchema] = useState(schema?.properties?.zowe?.properties?.setup?.properties?.vsam);
  const setupYaml = yaml?.zowe?.setup?.vsam;
  const [showProgress, setShowProgress] = useState(getProgress('cachingServiceStatus'));
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [vsamInitProgress, setVsamInitProgress] = useState(getVsamInitState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);
  const [allowInitialization, setAllowInitialization] = useState(true);
  const [installationArgs] = useState(getInstallationArguments());
  const [connectionArgs] = useState(useAppSelector(selectConnectionArgs));
  const [stageStatus, setStageStatus] = useState(stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped);
  const stageStatusRef = useRef(stageStatus);
  const [showVsameDatsetName, setShowVsamDatasetName] = useState(false);
  const [storageMode, setStorageMode] = useState(yaml?.components[`caching-service`]?.storage?.mode);
  const storageModeOptions = ['VSAM', 'INFINISPAN'];
  const zoweVersion: number = getCachedZoweVersion();
  const [showStorageModeOptions, setShowStorageModeOptions] = useState(false);

  let timer: any;

  const [defaultErrorMessage] = useState("Please ensure that the volume, storage class & dataset values are accurate.");

  const [validate] = useState(() => ajv.getSchema("https://zowe.org/schemas/v2/server-base") || ajv.compile(setupSchema))

  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);

  useEffect(() => {

    (zoweVersion < 3) ? setStorageMode('VSAM') : setShowStorageModeOptions(true);

    if(storageMode.toUpperCase() !== 'VSAM' && zoweVersion >= 3) {
      dispatchActions(true);
      setShowProgress(false);
      return;
    }

    let nextPosition;
    const stepProgress = getProgress('cachingServiceStatus');

    dispatch(setInitializationStatus(isInitializationStageComplete()));
    setShowProgress(initClicked || stepProgress);

    const nameExists = setupSchema?.properties?.name;
    if(!nameExists) {
      setShowVsamDatasetName(true);
    }

    const vsamDatasetName = yaml?.components[`caching-service`]?.storage?.vsam?.name|| '';
    if(vsamDatasetName) {
      datasetValidation(vsamDatasetName);
    }

    if(stepProgress) {
      nextPosition = document.getElementById('vsam-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      nextPosition = document.getElementById('container-box-id');
      nextPosition?.scrollIntoView({behavior: 'smooth'});
    }

    setInit(true);
    dispatch(setNextStepEnabled(stepProgress));

    return () => {
      alertEmitter.emit('hideAlert');
      updateSubStepSkipStatus(SUB_STAGE_ID, stageStatusRef.current);
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(initClicked || getProgress('cachingServiceStatus'));

    if(initClicked) {
      let nextPosition = document.getElementById('start-vsam-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setStateUpdated(!stateUpdated);
      dispatchActions(false);
    }
  }, [initClicked]);

  useEffect(() => {
    if(!getProgress('cachingServiceStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getInitVsamProgress().then((res: any) => {
          setVsamInitializationProgress(res);
          if(res.success){
            clearInterval(timer);
          }
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
    verifyAndSetVsamInitCompletion(vsamInitProgress);
  }, [vsamInitProgress]);

  const setVsamInitializationProgress = (vsamInitState: InitSubStepsState) => {
    setVsamInitProgress(vsamInitState);
    setVsamInitState(vsamInitState);
    verifyAndSetVsamInitCompletion(vsamInitState);
  }

  const verifyAndSetVsamInitCompletion = (vsamInitState: InitSubStepsState, selectedStorageMode?: string) => {
    const allAttributesTrue = Object.values(vsamInitState).every(value => value === true);
    if(allAttributesTrue) {
      dispatchActions(true);
      setShowProgress(initClicked || getProgress('cachingServiceStatus'));
    } else if (selectedStorageMode && selectedStorageMode.toUpperCase() == 'VSAM') {
      dispatchActions(false);
      setShowProgress(false);
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
      for (let key in vsamInitProgress) {
        vsamInitProgress[key as keyof(InitSubStepsState)] = false;
        setVsamInitState(vsamInitProgress);
      }
    }
    const allAttributesTrue = Object.values(vsamInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    setVsamInitializationProgress(getVsamInitState());
    dispatchActions(status);
  }

  const dispatchActions = (status: boolean) => {
    dispatch(setCachingServiceStatus(status));
    dispatch(setInitializationStatus(isInitializationStageComplete()));
    dispatch(setNextStepEnabled(status));
    setStageSkipStatus(!status);
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const process = async (event: any) => {
    alertEmitter.emit('hideAlert');

    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();

    if(!installationArgs.dryRunMode){
      window.electron.ipcRenderer.initVsamButtonOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
        updateProgress(res.status);
        if(res.error) {
        alertEmitter.emit('showAlert', res.errorMsg+" "+defaultErrorMessage, 'error');
      }
      clearInterval(timer);
    }).catch((err: any) => {
      clearInterval(timer);
      updateProgress(false);
      window.electron.ipcRenderer.setStandardOutput(`zwe init vsam failed:  ${typeof err === "string" ? err : err.toString()}`).then((res: any) => {
        toggleEditorVisibility("output");
      })
    });
    }
    else{
      setVsamInitState({
        writeYaml: true,
        uploadYaml: true,
        success: true
      });
      updateProgress(true);
    }
  }

  const handleFormChange = (data: any) => {
    alertEmitter.emit('hideAlert');

    let newData = init ? (Object.keys(setupYaml).length > 0 ? setupYaml : data?.zowe?.setup?.vsam) : (data?.zowe?.setup?.vsam ? data?.zowe?.setup?.vsam : data);
    setInit(false);

    if (newData) {
      if(validate) {
        validate(newData);

        if(validate.errors) {
          setAllowInitialization(false);
          const { schemaPath, message } = validate.errors[0];
          let errorText = `${schemaPath} ${message}`;
          setStageConfig(false, errorText);
        } else {
          setAllowInitialization(true);
          setStageConfig(true, '');
        }

        let yamlData = {...yaml};
        if(setupSchema?.properties?.name) {
          if(!newData.name) {
            setAllowInitialization(false);
          } else {
            yamlData = handleUpdateVsamName(newData.name);
          }
        }

        const updatedYaml = {...yamlData, zowe: {...yamlData.zowe, setup: {...yamlData.zowe.setup, vsam: newData}}};
        setYamlConfig(updatedYaml);
      }
    }
  };

  const setYamlConfig = (updatedYaml: any) => {
    window.electron.ipcRenderer.setConfig(updatedYaml);
    dispatch(setYaml(updatedYaml));
  }

  const setStageConfig = (isValid: boolean, errorMsg: string) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
  }

  const handleUpdateVsamName = (newName: string): any => {
    const updatedYaml = {
      ...yaml,
      components: {
        ...yaml.components,
        'caching-service': {
          ...yaml.components['caching-service'],
          storage: {
            ...yaml.components['caching-service']?.storage,
            vsam: {
              ...yaml.components['caching-service']?.storage?.vsam,
              name: newName
            }
          }
        }
      }
    };
    return updatedYaml;
  };

  const datasetValidation = (dsName: string) => {
    const DsNamePattern = "^(?=.{1,38}$)[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,21}$";
    const regEx = new RegExp(DsNamePattern);
    setAllowInitialization(regEx.test(dsName));
  }

  const cachingServiceChangeHandler = (newValue: string) => {
    alertEmitter.emit('hideAlert');
    datasetValidation(newValue);
    const updatedYaml = handleUpdateVsamName(newValue);
    setYamlConfig(updatedYaml);
  }

  const updateStorageMode = (event: any) => {
    setStorageMode(event.target.value);
    const updatedYaml = {
      ...yaml,
      components: {
        ...yaml.components,
        'caching-service': {
          ...yaml.components['caching-service'],
          storage: {
            ...yaml.components['caching-service']?.storage,
            mode: event.target.value
          }
        }
      }
    };
    setYamlConfig(updatedYaml);

    if(event.target.value.toUpperCase() !== 'VSAM') {
      dispatchActions(true);
      setShowProgress(false);
    } else {
      verifyAndSetVsamInitCompletion(vsamInitProgress, event.target.value);
    }
  }

  return (
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("yaml")}>View/Edit Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility("output")}>View Job Output</Button>
      </Box>

      <ContainerCard title="CachingService" description="Configure Zowe CachingService.">

        { editorVisible &&
          <EditorDialog
            contentType={contentType}
            isEditorVisible={editorVisible}
            toggleEditorVisibility={toggleEditorVisibility}
          />
        }

        <Box sx={{ width: '60vw' }}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}

          { showStorageModeOptions &&
            <FormControl variant="filled" fullWidth>
              <InputLabel id="storage-mode-label">Storage Mode</InputLabel>
              <Select
                labelId="storage-mode-label"
                id="storage-mode"
                value={storageMode}
                onChange={updateStorageMode}
                label="Storage Mode"
              >
                {storageModeOptions.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }

          { storageMode.toUpperCase() !== 'VSAM' ?
            <></> :  (
            <>
              <JsonForm schema={setupSchema} onChange={(data: any) => handleFormChange(data)} formData={setupYaml}/>

              { showVsameDatsetName &&
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
                    {allowInitialization && <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Zowe Caching Service VSAM data set.</p>}
                    {!allowInitialization && <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'red' }}>Invalid input. Please enter a valid VSAM dataset name.</p>}
                  </div>
                </FormControl>
              }

              { !showProgress ?
                <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
                  <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" disabled={!allowInitialization} onClick={e => process(e)}>
                    Initialize Vsam Config
                  </Button>
                </FormControl> :
                null
              }

              <Box sx={{height: showProgress ? 'calc(100vh - 70vh)' : 'auto'}} id="start-vsam-progress">
                {!showProgress ? null :
                  <React.Fragment>
                    <ProgressCard label={`Write configuration file locally to temp directory`} id="init-vsam-progress-card" status={vsamInitProgress?.writeYaml}/>
                    <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={vsamInitProgress?.uploadYaml}/>
                    <ProgressCard label={`Run zwe init vsam`} id="success-progress-card" status={vsamInitProgress?.success}/>
                    <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" disabled={!allowInitialization} onClick={e => process(e)}>Reinitialize Vsam Config</Button>
                  </React.Fragment>
                }
              </Box>

            </>)}

        </Box>
        <Box sx={{ height: showProgress ? '35vh' : 'auto', minHeight: showProgress ? '35vh' : '10vh' }} id="vsam-progress"></Box>

      </ContainerCard>
    </div>
  );
};

export default CachingService;