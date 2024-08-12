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
import { Box, Button, FormControl, FormHelperText, MenuItem, Select } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setInitializationStatus, setCertificateStatus } from './progress/progressSlice';
import { selectYaml, selectSchema, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { IResponse } from "../../../../src/types/interfaces";
import React from "react";
import ProgressCard from "../common/ProgressCard";
import { createTheme } from '@mui/material/styles';
import { stages } from "../configuration-wizard/Wizard";
import { setActiveStep } from "./progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { getProgress, setCertificateInitState, getCertificateInitState, updateSubStepSkipStatus, getInstallationArguments, isInitializationStageComplete } from "./progress/StageProgressStatus";
import { CertInitSubStepsState } from "../../../types/stateInterfaces";
import { TYPE_YAML, TYPE_OUTPUT, INIT_STAGE_LABEL, CERTIFICATES_STAGE_LABEL, ajv, deepMerge } from "../common/Utils";

const Certificates = () => {

  const [theme] = useState(createTheme());
  const updtYaml = useAppSelector(selectYaml);

  const [STAGE_ID] = useState(getStageDetails(INIT_STAGE_LABEL).id);
  const [SUB_STAGES] = useState(!!getStageDetails(INIT_STAGE_LABEL).subStages);
  const [SUB_STAGE_ID] = useState(SUB_STAGES ? getSubStageDetails(STAGE_ID, CERTIFICATES_STAGE_LABEL).id : 0);

  const dispatch = useAppDispatch();
  const [schema, setLocalSchema] = useState(useAppSelector(selectSchema));
  // const [yaml, setLocalYaml] = useState(updtYaml);
  const yaml = useAppSelector(selectYaml);
  const [connectionArgs] = useState(useAppSelector(selectConnectionArgs));
  const [installationArgs] = useState(getInstallationArguments());
  const [setupSchema] = useState(schema?.properties?.zowe?.properties?.setup?.properties?.certificate);
  // const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.certificate);
  const setupYaml = yaml?.zowe?.setup?.certificate;
  const [verifyCerts, setVerifyCerts] = useState(yaml?.zowe?.verifyCertificates ?? "STRICT");
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [showProgress, setShowProgress] = useState(getProgress('certificateStatus'));
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [certificateInitProgress, setCertificateInitProgress] = useState(getCertificateInitState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);
  const [reinit, setReinit] = useState(false);
  const [stageStatus, setStageStatus] = useState(stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped);
  const stageStatusRef = useRef(stageStatus);

  let timer: any;

  const [validate] = useState(() => ajv.getSchema("https://zowe.org/schemas/v2/server-base") || ajv.compile(setupSchema))

  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);

  useEffect(() => {
    const stepProgress = getProgress('certificateStatus');

    dispatch(setInitializationStatus(isInitializationStageComplete()));
    setShowProgress(initClicked || stepProgress);

    if(stepProgress) {
      const nextPosition = document.getElementById('start-certificate-progress');
      nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const nextPosition = document.getElementById('container-box-id');
      nextPosition.scrollIntoView({behavior: 'smooth'});
    }

    dispatch(setNextStepEnabled(stepProgress));

    setIsFormInit(true);

    return () => {
      updateSubStepSkipStatus(SUB_STAGE_ID, stageStatusRef.current);
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(initClicked || getProgress('certificateStatus'));

    if(initClicked) {
      let nextPosition = document.getElementById('start-certificate-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      dispatchActions(false);
      setStateUpdated(!stateUpdated);
    }

  }, [initClicked]);

  useEffect(() => {
    if(!getProgress('certificateStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getCertificateProgress().then((res: any) => {
          setCertificateInitializationProgress(res);
          if(res.success){
            clearInterval(timer);
          }
        })
      }, 3000);
    }

    if(showProgress) {
      const nextPosition = document.getElementById('start-certificate-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated]);

  useEffect(() => {
    const allAttributesTrue = Object.values(certificateInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      dispatchActions(true);
      setShowProgress(initClicked || getProgress('certificateStatus'));
    }
  }, [certificateInitProgress]);

  const setCertificateInitializationProgress = (certificateInitState: CertInitSubStepsState) => {
    setCertificateInitProgress(certificateInitState);
    setCertificateInitState(certificateInitState);
    const allAttributesTrue = Object.values(certificateInitState).every(value => value === true);
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
      for (let key in certificateInitProgress) {
        certificateInitProgress[key as keyof(CertInitSubStepsState)] = false;
        setCertificateInitState(certificateInitProgress);
      }
    }
    const allAttributesTrue = Object.values(certificateInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    setCertificateInitializationProgress(getCertificateInitState());
    dispatchActions(status);
  }

  const dispatchActions = (status: boolean) => {
    dispatch(setCertificateStatus(status));
    dispatch(setInitializationStatus(isInitializationStageComplete()));
    dispatch(setNextStepEnabled(status));
    setStageSkipStatus(!status);
  }

  const reinitialize = (event: any) => {
    setReinit(true);
    process(event);
  }

  const process = async (event: any) => {
    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();
    if(!installationArgs.dryRunMode){
      window.electron.ipcRenderer.initCertsButtonOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
        clearInterval(timer);
        updateProgress(res.status);
        if(!res.status){
          window.electron.ipcRenderer.setStandardOutput(JSON.stringify(res.details.jobOutput, null, 2)).then((res: any) => {
          toggleEditorVisibility("output");
        })
      }
      if(res.details.updatedYaml != undefined){
        const updatedCerts = res.details.updatedYaml.zowe?.certificate;
        const updatedYaml = {...yaml, zowe: {...yaml.zowe, certificate: updatedCerts}};
        // setSetupYaml(res.details.updatedYaml.zowe?.setup.certificate);
        window.electron.ipcRenderer.setConfig(updatedYaml);
        dispatch(setYaml(updatedYaml));
      }
      }).catch((e: any) => {
        clearInterval(timer);
        updateProgress(false);
        console.warn('zwe init certificate failed', e);
        window.electron.ipcRenderer.setStandardOutput(`zwe init certificate failed:  ${e}`).then((res: any) => {
          toggleEditorVisibility("output");
        })
      });
    }
    else{
      setCertificateInitState(
        {
          writeYaml: true,
          uploadYaml: true,
          zweInitCertificate: true
        }
      )
      updateProgress(true);
    }
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };
  
  const handleFormChange = (data: any) => {
    if(data?.zowe?.verifyCertificates){
      setVerifyCerts(data.zowe.verifyCertificates);
    }
    let newData = isFormInit ? (Object.keys(setupYaml).length > 0 ? setupYaml : data?.zowe?.setup?.certificate) : (data?.zowe?.setup?.certificate ? data?.zowe?.setup?.certificate : data);
    setIsFormInit(false);

    if (newData) {
      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setStageConfig(false, errPath+' '+errMsg, newData);
        } else {
          setStageConfig(true, '', newData);
        }
        const updatedYaml = {...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, certificate: newData}}};
        window.electron.ipcRenderer.setConfig(updatedYaml);
        // setLocalYaml(updatedYaml);
        dispatch(setYaml(updatedYaml));
      }
    }
  };

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    // setSetupYaml(data);
  } 

  return (
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        {/* <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button> */}
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Certificates" description="Configure Zowe Certificates."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={(data: any) => {
          if(data?.zowe?.verifyCertificates){
            setVerifyCerts(data.zowe.verifyCertificates);
          }
          const newData = isFormInit ? (Object.keys(setupYaml).length > 0 ? setupYaml : data?.zowe?.setup?.certificate) : (data?.zowe?.setup?.certificate ? data?.zowe?.setup?.certificate : data);
          setStageConfig(true, '', newData);
        }
        }/> }
        <Box sx={{ width: '60vw' }}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={{type: "object", ...setupSchema}} onChange={handleFormChange} formData={setupYaml}/>
          <p style={{fontSize: "24px"}}>Verify Certificates</p>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={verifyCerts}
              onChange={(e) => {
                dispatchActions(false);
                const newConfig = {...yaml, zowe: {...yaml?.zowe, verifyCertificates: e.target.value, setup: {...yaml.zowe.setup}}};
                window.electron.ipcRenderer.setConfig(newConfig);
                // setLocalYaml(newConfig);
                dispatch(setYaml(newConfig));
                setVerifyCerts(e.target.value);
              }}
            >
              {schema?.properties?.zowe?.properties?.verifyCertificates.enum && schema?.properties?.zowe?.properties?.verifyCertificates.enum.map((option: any, index: any) => {
                return <MenuItem value={option} key={`menu-item-${index}`}>{option}</MenuItem>
              })
              }
              {/* Fallback menu items which should never be reached */}
              {(schema?.properties?.zowe?.properties?.verifyCertificates.enum === undefined || schema?.properties?.zowe?.properties?.verifyCertificates.enum.length === 0) &&
                <><MenuItem value={"STRICT"}>STRICT</MenuItem>
                <MenuItem value={"NONSTRICT"}>NONSTRICT</MenuItem>
                <MenuItem value={"DISABLED"}>DISABLED</MenuItem></>
              }
            </Select>
            <FormHelperText>{schema?.properties?.zowe?.properties?.verifyCertificates.description}</FormHelperText>
          </FormControl>
          {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Initialize Zowe Certificates</Button>
          </FormControl> : null}
        </Box>
        <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="start-certificate-progress">
        {!showProgress ? null :
          <React.Fragment> 
            <ProgressCard label="Write configuration file to local disk" id="download-progress-card" status={certificateInitProgress?.writeYaml}/>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={certificateInitProgress?.uploadYaml}/>
            <ProgressCard label="Run certificate initialization script (zwe init certifiate)" id="install-progress-card" status={certificateInitProgress?.zweInitCertificate}/>
            <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => reinitialize(e)}>Reinitialize Zowe Certificates</Button>
          </React.Fragment>
        }
        </Box>
        <Box sx={{ height: showProgress ? '10vh' : 'auto'}} id="certificate-progress"></Box>
      </ContainerCard>
    </div>
  );
};

export default Certificates;