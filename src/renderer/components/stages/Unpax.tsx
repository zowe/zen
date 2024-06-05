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
import { selectYaml, setLoading, setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import { selectInstallationArgs, selectZoweVersion} from './installation/installationSlice';
import { selectConnectionArgs } from './connection/connectionSlice';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { setActiveStep } from "./progress/activeStepSlice"; 
import { getStageDetails } from "../../../services/StageDetails";
import { setDownloadUnpaxStatus } from './progress/progressSlice';
import { downloadUnpaxStatus, getDownloadUnpaxState, getInstallationTypeStatus, getProgress, setDownloadUnpaxState } from "./progress/StageProgressStatus";
import React from "react";
import ProgressCard from "../common/ProgressCard";
import { alertEmitter } from "../Header";
import { IResponse } from "../../../types/interfaces";
import { DownloadUnpaxState } from "../../../types/stateInterfaces";

const Unpax = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const stageLabel = 'Unpax';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;

  const dispatch = useAppDispatch();
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [installValue, setInstallValue] = useState(getInstallationTypeStatus()?.installationType || 'download');
  const [paxPath, setPaxPath] = useState(getInstallationTypeStatus()?.userUploadedPaxPath || '');
  const [showProgress, setShowProgress] = useState(getProgress('downloadUnpaxStatus'));
  const [downloadUnpaxProgress, setDownloadUnpaxProgress] = useState(getDownloadUnpaxState());
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const version = useAppSelector(selectZoweVersion);

  const [installationArgs, setInstArgs] = useState(useAppSelector(selectInstallationArgs));
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
      }, 3000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress]);

  const process = (event: any) => {
    event.preventDefault();
    setShowProgress(true);
    dispatch(setDownloadUnpaxStatus(false));
    setDownloadUnpaxProgress(downloadUnpaxStatus);
    dispatch(setNextStepEnabled(false));
    window.electron.ipcRenderer.downloadButtonOnClick(connectionArgs, installationArgs, version, yaml).then((res: IResponse) => {
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
      dispatch(setNextStepEnabled(getProgress('downloadUnpaxStatus') || installValue === "smpe"));
      dispatch(setDownloadUnpaxStatus(getProgress('downloadUnpaxStatus') || installValue === "smpe"));
    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, []);

  return (<>
      {installValue === "smpe" && <ContainerCard title="Continue to Installation" description=""> 
          <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
            {`The SMP/E process has already downloaded the required Zowe runtime files. Please click skip or continue.`}
          </Typography>
      </ContainerCard>}
      {installValue === "download" && <ContainerCard title="Download Zowe Pax" description=""> 
          <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
            {`Zen will download the latest Zowe convenience build in PAX archive format from `}
            <Link href="zowe.org">{'https://zowe.org.'}</Link>
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