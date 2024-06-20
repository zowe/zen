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
import { getProgress, setCertificateInitState, getCertificateInitState, mapAndSetSkipStatus, getInstallationArguments, isInitComplete } from "./progress/StageProgressStatus";
import { CertInitSubStepsState } from "../../../types/stateInterfaces";
import { TYPE_YAML, TYPE_OUTPUT, INIT_STAGE_LABEL, CERTIFICATES_STAGE_LABEL, ajv, deepMerge } from "../common/Constants";

const Certificates = () => {

  const [theme] = useState(createTheme());

  const [STAGE_ID] = useState(getStageDetails(INIT_STAGE_LABEL).id);
  const [SUB_STAGES] = useState(!!getStageDetails(INIT_STAGE_LABEL).subStages);
  const [SUB_STAGE_ID] = useState(SUB_STAGES ? getSubStageDetails(STAGE_ID, CERTIFICATES_STAGE_LABEL).id : 0);

  const dispatch = useAppDispatch();
  const [schema, setLocalSchema] = useState(useAppSelector(selectSchema));
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const [connectionArgs] = useState(useAppSelector(selectConnectionArgs));
  const [installationArgs] = useState(getInstallationArguments());
  const [setupSchema] = useState(schema?.properties?.zowe?.properties?.setup?.properties?.certificate);
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.certificate);
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

  let timer: any;

  const [validate] = useState(() => ajv.getSchema("https://zowe.org/schemas/v2/server-base") || ajv.compile(setupSchema))

  useEffect(() => {
    dispatch(setInitializationStatus(isInitComplete()));
    if(getProgress('certificateStatus')) {
      const nextPosition = document.getElementById('start-certificate-progress');
      nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const nextPosition = document.getElementById('container-box-id');
      nextPosition.scrollIntoView({behavior: 'smooth'});
    }

    setShowProgress(initClicked || getProgress('certificateStatus'));
    updateProgress(getProgress('certificateStatus'));
    setIsFormInit(true);

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(initClicked || getProgress('certificateStatus'));

    if(initClicked) {
      let nextPosition = document.getElementById('start-certificate-progress');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }, [initClicked]);

  useEffect(() => {
    if(!getProgress('certificateStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getCertificateProgress().then((res: any) => {
          setCertificateInitializationProgress(res)
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
      dispatch(setNextStepEnabled(true));
      dispatch(setCertificateStatus(true));
      setShowProgress(initClicked || getProgress('certificateStatus'));
    }
  }, [certificateInitProgress]);

  const setCertificateInitializationProgress = (certificateInitState: CertInitSubStepsState) => {
    setCertificateInitProgress(certificateInitState);
    setCertificateInitState(certificateInitState);
    const allAttributesTrue = Object.values(certificateInitState).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setNextStepEnabled(true));
      dispatch(setCertificateStatus(true));
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
      for (let key in certificateInitProgress) {
        certificateInitProgress[key as keyof(CertInitSubStepsState)] = false;
        setCertificateInitState(certificateInitProgress);
      }
    }
    const allAttributesTrue = Object.values(certificateInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    dispatch(setNextStepEnabled(status));
    dispatch(setInitializationStatus(isInitComplete()));
    dispatch(setCertificateStatus(status));
    setCertificateInitializationProgress(getCertificateInitState());
  }

  const reinitialize = (event: any) => {
    setReinit(true);
    process(event);
  }

  const process = async (event: any) => {
    setInitClicked(true);
    updateProgress(false);
    event.preventDefault();
    window.electron.ipcRenderer.initCertsButtonOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
      clearInterval(timer);
      updateProgress(res.status);
      if(!res.status){
        window.electron.ipcRenderer.setStandardOutput(JSON.stringify(res.details.jobOutput, null, 2)).then((res: any) => {
          toggleEditorVisibility("output");
        })
      }
      if(res.details.updatedYaml != undefined){
        var merge = deepMerge(res.details.updatedYaml, yaml);
        merge.zowe.certificate = res.details.updatedYaml.zowe?.certificate;
        window.electron.ipcRenderer.setConfig(merge);
        setLYaml(merge);
        dispatch(setYaml(merge));
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
          window.electron.ipcRenderer.setConfig({...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, certificate: newData}}});
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
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        {/* <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button> */}
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Certificates" description="Configure Zowe Certificates."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/> }
        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details ?? yaml))}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
          {/* <JsonForm schema={verifyCertsSchema} onChange={handleVerifyCertsChange} formData={verifyCertsYaml}/> */}
          <p style={{fontSize: "24px"}}>Verify Certificates</p>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={verifyCerts}
              onChange={(e) => {
                const newConfig = {...yaml, zowe: {...yaml?.zowe, verifyCertificates: e.target.value}};
                window.electron.ipcRenderer.setConfig(newConfig);
                setLYaml(newConfig)
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