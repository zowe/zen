/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useEffect, useRef, useState} from "react";
import { Box, Button, FormControl, FormControlLabel, FormLabel, Link, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import ContainerCard from '../../common/ContainerCard';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { selectYaml, setYaml, selectSchema, setNextStepEnabled, setLoading } from '../../configuration-wizard/wizardSlice';
import { selectInstallationArgs, selectZoweVersion, setInstallationArgs, setInstallationType, setSmpeDir, setLicenseAgreement, setSmpeDirValid, selectInstallationType, selectSmpeDir, selectLicenseAgreement, selectSmpeDirValid } from './installationSlice';
import { setInstallationTypeStatus } from "../progress/progressSlice"; 
import { selectConnectionArgs } from '../connection/connectionSlice';
import JsonForm from '../../common/JsonForms';
import { IResponse } from '../../../../types/interfaces';
import ProgressCard from '../../common/ProgressCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircle from '@mui/icons-material/CheckCircle';
import LicenseDialog from "./LicenseDialog";
import { setActiveStep } from "../progress/activeStepSlice"; 
import { getStageDetails } from "../progress/progressStore"; 

const InstallationType = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const stageLabel = 'Installation Type';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;

  const dispatch = useAppDispatch();
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [installValue, setInstallValue] = useState(useAppSelector(selectInstallationType));
  const [paxPath, setPaxPath] = useState("");
  const [smpePath, setSmpePath] = useState(useAppSelector(selectSmpeDir));
  const [smpePathValidated, setSmpePathValidated] = useState(useAppSelector(selectSmpeDirValid));
  const [showLicense, setShowLicense] = useState(false);
  const [agreeLicense, setAgreeLicense] = useState(useAppSelector(selectLicenseAgreement));

  const installationArgs = useAppSelector(selectInstallationArgs);
  const version = useAppSelector(selectZoweVersion);
  let timer: any;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, []);

  useEffect(() => {
    if((installValue === "download" && agreeLicense == false) || (installValue === "upload" && paxPath == "") || installValue === "smpe" && (smpePath === "" || !smpePathValidated)){
        dispatch(setNextStepEnabled(false));
    } else {
        dispatch(setInstallationTypeStatus(true))
        dispatch(setNextStepEnabled(true));
    }
    
  }, [installValue, paxPath, installationArgs, agreeLicense, smpePathValidated]);

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
    setInstallValue(type);
    dispatch(setInstallationTypeStatus(false))
  }

  const onSmpePathChange = (path: string) => {
    dispatch(setSmpeDir(path));
    setSmpePath(path);
    dispatch(setSmpeDirValid(false));
    setSmpePathValidated(false);
    dispatch(setInstallationTypeStatus(false))
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
                dispatch(setInstallationArgs({...installationArgs, installationType: e.target.value}))
                installTypeChangeHandler(e.target.value)
            }}
        >
            <FormControlLabel value="download" control={<Radio />} label="Download Zowe convenience build PAX from internet" />
            <FormControlLabel value="upload" control={<Radio />} label="Upload Zowe PAX for offline install" />
            <FormControlLabel value="smpe" control={<Radio />} label="SMP/E" />
        </RadioGroup>
    </FormControl>
    {installValue === "smpe" && <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">       
        {`SMP/E installation must be done outside of ZEN. Return to ZEN and input the location Zowe was installed to before continuing.`}
    </Typography>}
    {installValue === "smpe" && <FormControl>
        <TextField 
            id="smpe-install-path"
            required
            style={{marginLeft: 0}}
            label="Runtime Directory"
            variant="standard"
            helperText="Absolute path of the Zowe 'runtime' directory from SMPE installation process."
            value={installationArgs.smpeDir}
            onChange={(e) => {
                dispatch(setInstallationArgs({...installationArgs, smpeDir: e.target.value}));
                setSmpePath(e.target.value);
                onSmpePathChange(e.target.value);
            }}
        />
    </FormControl>}
    {installValue === "smpe" && <FormControl sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Button sx={{boxShadow: 'none', mr: '12px'}} type={"submit"} variant="text" onClick={async e => {
            e.preventDefault();
            window.electron.ipcRenderer.checkDirExists(connectionArgs, smpePath).then((res: boolean) => {
                setSmpePathValidated(res);
                dispatch(setSmpeDirValid(true))
            })
        }}>Validate location</Button>
        {smpePathValidated ? <CheckCircle sx={{ color: 'green', fontSize: '1rem', marginTop: '15px', marginLeft: '11px'}} /> : <Typography sx={{color: "gray"}}>{'Enter a valid path.'}</Typography> }
    </FormControl>}
    {installValue === "download" &&
      <div>
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
          {`Zen will download the latest Zowe convenience build in PAX archive format from `}
          <Link href="zowe.org">{'https://zowe.org'}</Link>
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
    {installValue === "upload" &&   <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">       
        {`Select a local Zowe PAX file (offline installation).`}
      </Typography>}
    {installValue === "upload" && <><Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => {
        e.preventDefault();
        window.electron.ipcRenderer.uploadPax().then((res: any) => {
          if(res.filePaths && res.filePaths[0] != undefined){
            setPaxPath(res.filePaths[0]);
            dispatch(setInstallationArgs({...installationArgs, userUploadedPaxPath: res.filePaths[0]}));
          } else {
            setPaxPath("");
            dispatch(setInstallationArgs({...installationArgs, userUploadedPaxPath: ''}));
          }
        });
      }}>Upload PAX</Button>
      <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
        {`${paxPath === "" ? "No pax file selected." : paxPath}`}
      </Typography></>}
    </ContainerCard>
  );
};

export default InstallationType;