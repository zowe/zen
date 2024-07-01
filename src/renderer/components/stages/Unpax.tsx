/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import {useEffect, useState} from "react";
import { Box, Button, Link, Typography } from '@mui/material';
import ContainerCard from '../common/ContainerCard';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import { selectZoweVersion} from './installation/installationSlice';
import { selectConnectionArgs } from './connection/connectionSlice';
import { setActiveStep } from "./progress/activeStepSlice"; 
import { getStageDetails } from "../../../services/StageDetails";
import { setDownloadUnpaxStatus } from './progress/progressSlice';
import { downloadUnpaxStatus, getDownloadUnpaxState, getInstallationArguments, getInstallationTypeStatus, getProgress, setDownloadUnpaxState } from "./progress/StageProgressStatus";
import React from "react";
import ProgressCard from "../common/ProgressCard";
import { alertEmitter } from "../Header";
import { IResponse } from "../../../types/interfaces";
import { UNPAX_STAGE_LABEL } from "../common/Utils";

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
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const version = useAppSelector(selectZoweVersion);

  const [installationArgs, setInstArgs] = useState(getInstallationArguments());
  let timer: any;

  useEffect(() => {
    const stageComplete = downloadUnpaxProgress.uploadYaml && downloadUnpaxProgress.download && downloadUnpaxProgress.upload && downloadUnpaxProgress.unpax;
    if(!stageComplete && showProgress) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getDownloadUnpaxProgress().then((res: any) => {
          setDownloadUnpaxProgress(res);
          setDownloadUnpaxState(res);
          if(stageComplete){
            dispatch(setNextStepEnabled(true));
            dispatch(setDownloadUnpaxStatus(true));
            clearInterval(timer);
          }
        })
      }, 3000)
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress]);

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
    setShowProgress(true);
    dispatch(setDownloadUnpaxStatus(false));
    setDownloadUnpaxProgress(downloadUnpaxStatus);
    dispatch(setNextStepEnabled(false));

    if(!installationArgs.dryRunMode){
      window.electron.ipcRenderer.downloadButtonOnClick(connectionArgs, {...installationArgs, userUploadedPaxPath: paxPath}, version).then((res: IResponse) => {
        if(!res.status){ //errors during runInstallation()
          alertEmitter.emit('showAlert', res.details, 'error');
        }
        if(res.details?.mergedYaml != undefined){
          dispatch(setYaml(res.details.mergedYaml));
          window.electron.ipcRenderer.setConfig(res.details.mergedYaml);
        }
        dispatch(setNextStepEnabled(res.status));
        dispatch(setDownloadUnpaxStatus(res.status));
      clearInterval(timer);
    }).catch(() => {
      clearInterval(timer);
      dispatch(setNextStepEnabled(false));
    });
  }
  else{
    setDownloadUnpaxProgress(downloadUnpaxProgressAndStateTrue);
    setDownloadUnpaxState(downloadUnpaxProgressAndStateTrue);
    dispatch(setNextStepEnabled(true));
    dispatch(setDownloadUnpaxStatus(true));
  }
  }

  const fetchExampleYaml = (event: any) => {
    event.preventDefault();
    setShowProgress(true);
    dispatch(setDownloadUnpaxStatus(false));
    setDownloadUnpaxProgress(downloadUnpaxStatus);
    dispatch(setNextStepEnabled(false));
    if(!installationArgs.dryRunMode){

      window.electron.ipcRenderer.fetchExampleYamlBtnOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
        if(!res.status){ //errors during runInstallation()
        alertEmitter.emit('showAlert', res.details.message ? res.details.message : res.details, 'error');
      }
      if(res.details?.mergedYaml != undefined){
        dispatch(setYaml(res.details.mergedYaml));
        window.electron.ipcRenderer.setConfig(res.details.mergedYaml);
      }
      dispatch(setNextStepEnabled(res.status));
      dispatch(setDownloadUnpaxStatus(res.status));
      clearInterval(timer);
    }).catch(() => {
      clearInterval(timer);
      dispatch(setNextStepEnabled(false));
    });
  }
  else{
    setDownloadUnpaxProgress(downloadUnpaxProgressAndStateTrue);
    setDownloadUnpaxState(downloadUnpaxProgressAndStateTrue);
    dispatch(setNextStepEnabled(true));
    dispatch(setDownloadUnpaxStatus(true));
  }
  }

  useEffect(() => {
      window.electron.ipcRenderer.getConfigByKey("installationArgs").then((res: IResponse) => {
        if(res != undefined){
          setInstArgs((res as any));
        }
      })
      let nextPosition;
      if(getProgress('downloadUnpaxStatus')) {
        nextPosition = document.getElementById('download-progress-card');
        nextPosition?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      dispatch(setNextStepEnabled(getProgress('downloadUnpaxStatus')));
      dispatch(setDownloadUnpaxStatus(getProgress('downloadUnpaxStatus')));
    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, []);

  return (<>
      {installValue === "smpe" && <ContainerCard title="Continue to Initialization" description="">
          <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
            {`The SMP/E process has already downloaded the required Zowe runtime files. Zen will now retrieve the example-zowe.yaml and schemas for the yaml. Skip this step if you have already fetched these files.`}
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
            {`Zen will download the latest Zowe convenience build in PAX archive format from `}
            <Link href="https://zowe.org" target="_blank" rel="noopener noreferrer">
              {'https://zowe.org'}
            </Link>
            {` Skip this step if you have already downloaded Zowe.`}
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
            {`Zen will upload and unpax the Zowe runtime files from ${paxPath}. Skip this step if you have already uploaded a Zowe pax.`}
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
