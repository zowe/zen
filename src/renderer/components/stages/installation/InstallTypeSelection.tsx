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
import { selectInstallationArgs, selectZoweVersion, setInstallationArgs } from './installationSlice';
import { selectConnectionArgs } from '../connection/connectionSlice';
import JsonForm from '../../common/JsonForms';
import { IResponse } from '../../../../types/interfaces';
import ProgressCard from '../../common/ProgressCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LicenseDialog from "./LicenseDialog";

const InstallationType = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const dispatch = useAppDispatch();
//   const schema = useAppSelector(selectSchema);
//   const yaml = useAppSelector(selectYaml);
  const connectionArgs = useAppSelector(selectConnectionArgs);
//   const setupSchema = schema.properties.zowe.properties.setup.properties.dataset;
//   const [setupYaml, setSetupYaml] = useState(yaml.zowe.setup.dataset);
  const [installValue, setInstallValue] = useState("download");
  const [paxPath, setPaxPath] = useState("");
  const [smpePath, setSmpePath] = useState("");
  const [smpePathValidated, setSmpePathValidated] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [agreeLicense, setAgreeLicense] = useState(false);

  const installationArgs = useAppSelector(selectInstallationArgs);
  const version = useAppSelector(selectZoweVersion);
  let timer: any;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if((installValue === "download" && agreeLicense == false) || (installValue === "upload" && paxPath == "") || installValue === "smpe" && installationArgs.smpeDir == ""){
        dispatch(setNextStepEnabled(false));
    } else {
        dispatch(setNextStepEnabled(true));
    }
    
  }, [installValue, paxPath, installationArgs, agreeLicense]);

  const showLicenseAgreement = () => {
    setShowLicense(true);
  }

  const licenseAgreement = (agree: any) => {
    setAgreeLicense(false);
    if(agree && (agree == 1 || (agreeLicense && agree == -1))) {
      setAgreeLicense(true);
    }
    setShowLicense(false);
  }

  return (
    <ContainerCard title="Installation Type" description="Please select the desired install method"> 
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">       
        {`Please select an option`}
      </Typography>
      <FormControl>
        <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="download"
            name="radio-buttons-group"
            onChange={(e) => {
                dispatch(setInstallationArgs({...installationArgs, installationType: e.target.value}))
                setInstallValue(e.target.value)
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
            label="SMPE Installation Location"
            variant="standard"
            helperText="Location of Zowe SMPE installation."
            value={installationArgs.smpeDir}
            onChange={(e) => {
                dispatch(setInstallationArgs({...installationArgs, smpeDir: e.target.value}));
                setSmpePath(e.target.value)
            }}
        />
    </FormControl>}
    {installValue === "smpe" && <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
        <Button sx={{boxShadow: 'none', mr: '12px'}} type={"submit"} variant="text" onClick={async e => {
            e.preventDefault();
            window.electron.ipcRenderer.checkDirExists(connectionArgs, smpePath).then((res: boolean) => {
                setSmpePathValidated(res);
            })
        }}>Validate location</Button>
        {smpePathValidated ? <CheckCircleOutlineIcon color="success" sx={{ fontSize: 32 }}/> : <Typography sx={{color: "gray"}}>{'Enter a valid path.'}</Typography> }
    </FormControl>}
    {installValue === "download" &&
      <div>
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} color="text.secondary">
          {`Zen will download the latest Zowe convenience build in PAX archive format from `}
          <Link href="zowe.org">{'https://zowe.org'}</Link>
        </Typography>
        <Button onClick={showLicenseAgreement}>License Agreement</Button>
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
