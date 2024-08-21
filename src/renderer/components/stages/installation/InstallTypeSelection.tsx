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
import { Box, Button, FormControl, FormControlLabel, Link, Radio, RadioGroup, Typography } from '@mui/material';
import ContainerCard from '../../common/ContainerCard';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { setNextStepEnabled } from '../../configuration-wizard/wizardSlice';
import { selectInstallationArgs, setInstallationArgs, setInstallationType, setLicenseAgreement, setUserUploadedPaxPath } from './installationSlice';
import { setDownloadUnpaxStatus, setInstallationTypeStatus } from "../progress/progressSlice";
import { selectConnectionArgs } from '../connection/connectionSlice';
import CheckCircle from '@mui/icons-material/CheckCircle';
import LicenseDialog from "./LicenseDialog";
import { setActiveStep } from "../progress/activeStepSlice"; 
import { getStageDetails } from "../../../../services/StageDetails";
import { getInstallationTypeStatus, downloadUnpaxStatus, setDownloadUnpaxState } from "../progress/StageProgressStatus";
import { INSTALLATION_TYPE_STAGE_LABEL } from "../../common/Utils";
const InstallationType = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const [stageLabel] = useState(INSTALLATION_TYPE_STAGE_LABEL);

  const [STAGE_ID] = useState(getStageDetails(stageLabel).id);
  const [SUB_STAGES] = useState(!!getStageDetails(stageLabel).subStages);

  const dispatch = useAppDispatch();
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [installValue, setInstallValue] = useState(getInstallationTypeStatus()?.installationType || 'download');
  const [paxPath, setPaxPath] = useState(getInstallationTypeStatus()?.userUploadedPaxPath || '');
  const [showLicense, setShowLicense] = useState(false);
  const [agreeLicense, setAgreeLicense] = useState(getInstallationTypeStatus()?.licenseAgreement || false);

  const installationArgs = useAppSelector(selectInstallationArgs);

  useEffect(() => {
    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, []);

  useEffect(() => {
    if((installValue === "download" && agreeLicense == false) || (installValue === "upload" && paxPath == "")){
      updateProgress(false);
    } else {
      updateProgress(true);
    }
    
  }, [installValue, paxPath, installationArgs, agreeLicense]);
  
  const updateProgress = (status: boolean): void => {
    dispatch(setInstallationTypeStatus(status))
    dispatch(setNextStepEnabled(status));
  }

  const showLicenseAgreement = () => {
    setShowLicense(true);
  }

  const licenseAgreement = (agree: any) => {
    setAgreeLicense(false);
    dispatch(setLicenseAgreement(false));
    if(agree == 1) {
      setAgreeLicense(true);
      dispatch(setLicenseAgreement(true));
    }
    setShowLicense(false);
  }

  const installTypeChangeHandler = (type: string) => {
    dispatch(setInstallationType(type));
    if(type != 'download') {
      dispatch(setLicenseAgreement(false));
    }
    setInstallValue(type);
    updateProgress(false);
    dispatch(setDownloadUnpaxStatus(false));
    setDownloadUnpaxState({
      uploadYaml: false,
      download: false,
      upload: false,
      unpax: false,
      getExampleYaml: false,
      getSchemas: false,
    })
  }

  return (
    <ContainerCard title="Installation Type" description="Please select the desired install method."> 
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">       
        {`Please select an option.`}
      </Typography>
      <FormControl>
        <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            value={installValue}
            name="radio-buttons-group"
            onChange={(e) => {
                dispatch(setInstallationArgs({...installationArgs, installationType: e.target.value}));
                window.electron.ipcRenderer.setConfigByKeyNoValidate("installationArgs", {...installationArgs, installationType: e.target.value});
                dispatch(setInstallationType(e.target.value))
                installTypeChangeHandler(e.target.value)
            }}
        >
            <FormControlLabel value="download" control={<Radio />} label="Download Zowe convenience build PAX from internet" />
            <FormControlLabel value="upload" control={<Radio />} label="Upload Zowe PAX for offline install" />
            <FormControlLabel value="smpe" control={<Radio />} label="SMP/E" />
        </RadioGroup>
    </FormControl>
    {installValue === "smpe" && <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">       
        {`SMP/E installation must be done outside of ZEN. Return to ZEN after completing the SMP/E installation process.`}
    </Typography>}
    {installValue === "download" &&
      <div>
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
          Wizard will download the latest Zowe convenience build in PAX archive format from&nbsp;
          { !agreeLicense && <><br />Please accept the license agreement to continue.<br/></>}
          <Link href="https://www.zowe.org/download" target="_blank" rel="noopener noreferrer">
            {'https://www.zowe.org/download'}
          </Link>
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
          <Button style={{ color: 'white', backgroundColor: '#1976d2', fontSize: 'small', marginTop: '20px'}} 
            onClick={showLicenseAgreement}
          >
            License Agreement
          </Button>
          { agreeLicense && <CheckCircle sx={{ color: 'green', fontSize: '1rem', marginTop: '15px', marginLeft: '11px'}} />}
        </Box>
        {showLicense && <LicenseDialog isAgreementVisible={true} licenseAgreement={licenseAgreement}/>}
      </div>}
    {installValue === "upload" && <><Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">       
        Select a local Zowe PAX file (offline installation).
      </Typography>
      <Button style={{ color: 'white', backgroundColor: '#1976d2', fontSize: 'small', marginTop: '16px'}} type="submit" onClick={e => {
        e.preventDefault();
        if(!installationArgs.dryRunMode){
          window.electron.ipcRenderer.uploadPax().then((res: any) => {
            if(res.filePaths && res.filePaths[0] != undefined){
              setPaxPath(res.filePaths[0]);
              dispatch(setInstallationArgs({...installationArgs, userUploadedPaxPath: res.filePaths[0]}));
              dispatch(setUserUploadedPaxPath(res.filePaths[0]));
            } else {
              setPaxPath("");
            }
          });
        }
        else
          updateProgress(true);
      }}>Upload PAX</Button>
      <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
        {`${paxPath === "" ? "No pax file selected." : paxPath}`}
      </Typography></>}
    </ContainerCard>
  );
};

export default InstallationType;