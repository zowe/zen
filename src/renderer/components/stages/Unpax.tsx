/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import {useEffect, useRef, useState} from "react";
import { Box, Button, Link, Typography } from '@mui/material';
import ContainerCard from '../common/ContainerCard';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, setNextStepEnabled, setSchema, setYaml } from '../configuration-wizard/wizardSlice';
import { selectZoweVersion} from './installation/installationSlice';
import { selectConnectionArgs } from './connection/connectionSlice';
import { setActiveStep } from "./progress/activeStepSlice"; 
import { getStageDetails } from "../../../services/StageDetails";
import { setDownloadUnpaxStatus } from './progress/progressSlice';
import { downloadUnpaxStatus, getDownloadUnpaxState, getInstallationArguments, getInstallationTypeStatus, getProgress, setDownloadUnpaxState, updateStepSkipStatus } from "./progress/StageProgressStatus";
import React from "react";
import ProgressCard from "../common/ProgressCard";
import { alertEmitter } from "../Header";
import { IResponse } from "../../../types/interfaces";
import { UNPAX_STAGE_LABEL } from "../common/Utils";
import { stages } from "../configuration-wizard/Wizard";
import { DownloadUnpaxState } from "../../../../src/types/stateInterfaces";
const Unpax = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const [stageLabel] = useState(UNPAX_STAGE_LABEL);

  const [STAGE_ID] = useState(getStageDetails(stageLabel).id);
  const [SUB_STAGES] = useState(!!getStageDetails(stageLabel).subStages);

  const dispatch = useAppDispatch();
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [installValue, setInstallValue] = useState(getInstallationTypeStatus()?.installationType || 'download');
  const [paxPath, setPaxPath] = useState(getInstallationTypeStatus()?.userUploadedPaxPath || '');
  const [showProgress, setShowProgress] = useState(getProgress('downloadUnpaxStatus'));
  const [downloadUnpaxProgress, setDownloadUnpaxProgress] = useState(getDownloadUnpaxState());
  const [yaml, setLocalYaml] = useState(useAppSelector(selectYaml));
  const version = useAppSelector(selectZoweVersion);

  const [stateUpdated, setStateUpdated] = useState(false);
  const [stageStatus, setStageStatus] = useState(stages[STAGE_ID].isSkipped);
  const stageStatusRef = useRef(stageStatus);
  const [isYamlFetched, setIsYamlFetched] = useState(false);

  const [installationArgs, setInstArgs] = useState(getInstallationArguments());
  let timer: any;

  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);

  useEffect(() => {
    window.electron.ipcRenderer.getConfigByKey("installationArgs").then((res: IResponse) => {
      if(res != undefined){
        setInstArgs((res as any));
      }
    })

    let nextPosition;
    const stepProgress = getProgress('downloadUnpaxStatus')

    if(stepProgress) {
      nextPosition = document.getElementById('download-progress-card');
      nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    dispatch(setNextStepEnabled(stepProgress));

    return () => {
      updateStepSkipStatus(STAGE_ID, stageStatusRef.current);
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, []);

  useEffect(() => {
    const stageComplete = downloadUnpaxProgress.uploadYaml && downloadUnpaxProgress.download && downloadUnpaxProgress.upload && downloadUnpaxProgress.unpax;
    if(!stageComplete && showProgress && !(downloadUnpaxProgress.getExampleYaml && downloadUnpaxProgress.getSchemas)) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getDownloadUnpaxProgress().then((res: any) => {
          let success;
          setDownloadAndUnpaxProgress(res);

          if(isYamlFetched) {
            success = res.getExampleYaml && res.getSchemas;
          } else {
            success = res.download && res.getExampleYaml && res.getSchemas && res.unpax && res.upload && res.uploadYaml;
          }

          if(success){
            clearInterval(timer);
          }
        })
      }, 3000)
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated]);

  useEffect(() => {
    const allAttributesTrue = Object.values(downloadUnpaxProgress).every(value => value === true);
    if(allAttributesTrue) {
      dispatchActions(true);
      setShowProgress(getProgress('downloadUnpaxStatus'));
    }
  }, [downloadUnpaxProgress]);

  const setDownloadAndUnpaxProgress = (downloadUnpaxState: DownloadUnpaxState) => {
    setDownloadUnpaxProgress(downloadUnpaxState);
    setDownloadUnpaxState(downloadUnpaxState);
    let allAttributesTrue = Object.values(downloadUnpaxState).every(value => value === true);
    if(isYamlFetched) {
      allAttributesTrue = downloadUnpaxState.getSchemas && downloadUnpaxState.getExampleYaml;
      setIsYamlFetched(false);
    }
    if(allAttributesTrue) {
      dispatchActions(true);
    }
  }

  const setStageSkipStatus = (status: boolean) => {
    stages[STAGE_ID].isSkipped = status;
    setStageStatus(status);
  }

  const updateProgress = (status: boolean) => {
    setStateUpdated(!stateUpdated);
    setStageSkipStatus(!status);
    if(!status) {
      for (let key in downloadUnpaxProgress) {
        downloadUnpaxProgress[key as keyof DownloadUnpaxState] = false;
        setDownloadUnpaxState(downloadUnpaxProgress);
      }
    }
    const allAttributesTrue = Object.values(downloadUnpaxProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    setDownloadAndUnpaxProgress(getDownloadUnpaxState());
    dispatchActions(status);
  }

  const dispatchActions = (status: boolean) => {
    dispatch(setDownloadUnpaxStatus(status));
    dispatch(setNextStepEnabled(status));
    setStageSkipStatus(!status);
  }

  const downloadUnpaxProgressAndStateTrue = {
    uploadYaml: true,
    download: true,
    upload: true,
    unpax: true,
    getExampleYaml: true,
    getSchemas: true,
  };

  const process = (event: any) => {
    event.preventDefault();
    updateProgress(false);
    setShowProgress(true);

    if(!installationArgs.dryRunMode){
      window.electron.ipcRenderer.downloadButtonOnClick(connectionArgs, {...installationArgs, userUploadedPaxPath: paxPath}, version).then((res: IResponse) => {
        if(!res.status){ //errors during runInstallation()
          alertEmitter.emit('showAlert', res.details, 'error');
          updateProgress(false);
        }
        if(res.details?.mergedYaml != undefined){
          dispatch(setYaml(res.details.mergedYaml));
          window.electron.ipcRenderer.setConfig(res.details.mergedYaml);
        }
        if(res.details?.yamlSchema != undefined) {
          dispatch(setSchema(res.details.yamlSchema));
          window.electron.ipcRenderer.setSchema(res.details.yamlSchema);
        }
        clearInterval(timer);
        updateProgress(res.status);
      }).catch(() => {
        clearInterval(timer);
        updateProgress(false);
      });
    } else{
      setDownloadUnpaxProgress(downloadUnpaxProgressAndStateTrue);
      setDownloadUnpaxState(downloadUnpaxProgressAndStateTrue);
      dispatch(setNextStepEnabled(true));
      dispatch(setDownloadUnpaxStatus(true));
    }
  }

  const fetchExampleYaml = (event: any) => {
    setIsYamlFetched(true);
    event.preventDefault();
    setShowProgress(true);
    updateProgress(false);

    if(!installationArgs.dryRunMode){
    window.electron.ipcRenderer.fetchExampleYamlBtnOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
      setDownloadUnpaxProgress({
        ...downloadUnpaxProgress,
        getExampleYaml: false,
        getSchemas: false, 
      });
      if(!res.status){ //errors during runInstallation()
        alertEmitter.emit('showAlert', res.details.message ? res.details.message : res.details, 'error');
        updateProgress(false);
      }
      if(res.details?.mergedYaml != undefined){
        dispatch(setYaml(res.details.mergedYaml));
        window.electron.ipcRenderer.setConfig(res.details.mergedYaml);
      }
      if(res.details?.yamlSchema != undefined) {
        dispatch(setSchema(res.details.yamlSchema));
        window.electron.ipcRenderer.setSchema(res.details.yamlSchema);
      }
      updateProgress(res.status);
      clearInterval(timer);
    }).catch((err: any) => {
      clearInterval(timer);
      alertEmitter.emit('showAlert', typeof err === "string" ? err : err.toString(), 'error');
      updateProgress(false);
    });
  }
  else{
    setDownloadUnpaxProgress(downloadUnpaxProgressAndStateTrue);
    setDownloadUnpaxState(downloadUnpaxProgressAndStateTrue);
    dispatch(setNextStepEnabled(true));
    dispatch(setDownloadUnpaxStatus(true));
  }
  }

  return (<>
      {installValue === "smpe" && <ContainerCard title="Continue to Initialization" description="">
          <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
            {`The SMP/E process has already downloaded the required Zowe runtime files. Wizard will now retrieve the example-zowe.yaml and schemas for the yaml. Skip this step if you have already fetched these files.`}
          </Typography>
          {!showProgress && <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
            <Button style={{ color: 'white', backgroundColor: '#1976d2', fontSize: 'small', marginTop: '20px'}} 
              onClick={(e) => fetchExampleYaml(e)}
            >
              Retrieve example-zowe.yaml
            </Button>
          </Box>}
          {showProgress && 
            <React.Fragment>
              <ProgressCard label={`Retrieve example-zowe.yaml from installation files`} id="yaml-progress-card" status={downloadUnpaxProgress.getExampleYaml}/>
              <ProgressCard label="Retrieve server-common and yaml schemas from installation files" id="schema-progress-card" status={downloadUnpaxProgress.getSchemas}/>
              <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => fetchExampleYaml(e)}>Re-fetch example-zowe.yaml</Button>
            </React.Fragment>
          }
      </ContainerCard>}
      {installValue === "download" && <ContainerCard title="Download Zowe Pax" description=""> 
          <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
            {`Wizard will download the latest Zowe convenience build in PAX archive format from `}
            <Link href="https://www.zowe.org/download" target="_blank" rel="noopener noreferrer">
              {'https://www.zowe.org/download'}
            </Link>
            {`. Skip this step if you have already downloaded Zowe.`}
          </Typography>
          {!showProgress && <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
            <Button style={{ color: 'white', backgroundColor: '#1976d2', fontSize: 'small', marginTop: '20px'}} 
              onClick={(e) => process(e)}
            >
              Begin Download
            </Button>
          </Box>}
          {showProgress && 
            <React.Fragment>
              <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={downloadUnpaxProgress.uploadYaml}/>
              <ProgressCard label="Download convenience build pax locally" id="download-progress-card" status={downloadUnpaxProgress.download}/>
              <ProgressCard label={`Upload pax file to ${installationArgs.installationDir}`} id="upload-progress-card" status={downloadUnpaxProgress.upload}/>
              <ProgressCard label="Unpax installation files" id="unpax-progress-card" status={downloadUnpaxProgress.unpax}/>
              <ProgressCard label={`Retrieve example-zowe.yaml from installation files`} id="yaml-progress-card" status={downloadUnpaxProgress.getExampleYaml}/>
              <ProgressCard label="Retrieve server-common and yaml schemas from installation files" id="schema-progress-card" status={downloadUnpaxProgress.getSchemas}/>
              <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Re-download Zowe</Button>
            </React.Fragment>
          }
      </ContainerCard>}
      {installValue === "upload" && <ContainerCard title="Upload Zowe Pax" description=""> 
          <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
            {`Wizard will upload and unpax the Zowe runtime files from ${paxPath}. Skip this step if you have already uploaded a Zowe pax.`}
          </Typography>
          {!showProgress && <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
            <Button style={{ color: 'white', backgroundColor: '#1976d2', fontSize: 'small', marginTop: '20px'}} 
              onClick={(e) => process(e)}
            >
              Begin Upload
            </Button>
          </Box>}
          {showProgress && 
            <React.Fragment>
              <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={downloadUnpaxProgress.uploadYaml}/>
              <ProgressCard label={`Upload pax file to ${installationArgs.installationDir}`} id="upload-progress-card" status={downloadUnpaxProgress.upload}/>
              <ProgressCard label="Unpax installation files" id="unpax-progress-card" status={downloadUnpaxProgress.unpax}/>
              <ProgressCard label={`Retrieve example-zowe.yaml from installation files`} id="yaml-progress-card" status={downloadUnpaxProgress.getExampleYaml}/>
              <ProgressCard label="Retrieve server-common and yaml schemas from installation files" id="schema-progress-card" status={downloadUnpaxProgress.getSchemas}/>
              <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>Re-upload Pax</Button>
            </React.Fragment>
          }
      </ContainerCard>}
    </>
  );
};

export default Unpax;
