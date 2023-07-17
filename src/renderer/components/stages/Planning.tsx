/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useEffect, useState} from "react";
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import ContainerCard from '../common/ContainerCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { setYaml, setSchema, setNextStepEnabled, setLoading } from '../wizard/wizardSlice';
import { selectConnectionArgs, setConnectionArgs } from './connection/connectionSlice';
import { setZoweVersion, setInstallationArgs, selectInstallationArgs, selectZoweVersion } from './installation/installationSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { IResponse } from '../../../types/interfaces';

const serverSchema = {
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "https://zowe.org/schemas/v2/server-common",
  "title": "Common types",
  "description": "Configuration types that are common in Zowe and may be referenced by multiple components",
  "$defs": {
    "semverVersion": {
      "$anchor": "zoweSemverVersion",
      "type": "string",
      "description": "A semantic version, see https://semver.org/",
      "pattern": "^[0-9]*\\.[0-9]*\\.[0-9]*(-*[a-zA-Z][0-9a-zA-Z\\-\\.]*)?(\\+[0-9a-zA-Z\\-\\.]*)?$"
    },
    "semverRange": {
      "$anchor": "zoweSemverRange",
      "type": "string",
      "description": "A semantic version, see https://semver.org/",
      "pattern": "^(([\\^\\~\\>\\<]?)|(>=?)|(<=?))[0-9]*\\.[0-9]*\\.[0-9]*(-*[a-zA-Z][0-9a-zA-Z\\-\\.]*)?(\\+[0-9a-zA-Z\\-\\.]*)?$"
    },
    "dataset": {
      "$anchor": "zoweDataset",
      "type": "string",
      "description": "A 44-char all caps dotted ZOS name",
      "pattern": "^([A-Z\\$\\#\\@]){1}([A-Z0-9\\$\\#\\@\\-]){0,7}(\\.([A-Z\\$\\#\\@]){1}([A-Z0-9\\$\\#\\@\\-]){0,7}){0,11}$",
      "minLength": 3,
      "maxLength": 44
    },
    "datasetMember": {
      "$anchor": "zoweDatasetMember",
      "type": "string",
      "description": "A 1-8-char all caps dataset member name",
      "pattern": "^([A-Z\$\#\@]){1}([A-Z0-9\$\#\@]){0,7}$",
      "minLength": 1,
      "maxLength": 8
    },
    "jobname": {
      "$anchor": "zoweJobname",
      "type": "string",
      "pattern": "^([A-Z\\$\\#\\@]){1}([A-Z0-9\\$\\#\\@]){0,7}$",
      "minLength": 3,
      "maxLength": 8
    },
    "user": {
      "$anchor": "zoweUser",
      "type": "string",
      "pattern": "^([A-Z0-9$#@]){1,8}$",
      "minLength": 1,
      "maxLength": 8
    },
    "token": {
      "$anchor": "zoweToken",
      "type": "string",
      "pattern": "^([A-Z0-9$#@.]){1,32}$",
      "minLength": 1,
      "maxLength": 32
    },
    "path": {
      "$anchor": "zowePath",
      "type": "string",
      "pattern": "^([^\\0]){1,1024}$",
      "minLength": 1,
      "maxLength": 1024
    },
    "file": {
      "$anchor": "zoweFile",
      "type": "string",
      "pattern": "^([^\\\\0]){1,256}$",
      "minLength": 1,
      "maxLength": 256
    },
    "reverseDomainNotation": {
      "$anchor": "zoweReverseDomainNotation",
      "type": "string",
      "pattern": "^[A-Za-z]{2,6}(\\.[A-Za-z0-9-]{1,62}[A-Za-z0-9])+$"
    },
    "ipv4": {
      "$anchor": "zoweIpv4",
      "type": "string",
      "pattern": "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
    },
    "tcpPort": {
      "$anchor": "zoweTcpPort",
      "type": "integer",
      "description": "TCP network port",
      "minimum": 1024,
      "maximum": 65535
    },
    "reservedTcpPort": {
      "$anchor": "zoweReservedTcpPort",
      "type": "integer",
      "description": "Reserved TCP network ports. Can be used but discouraged due to their standardized use by common programs",
      "deprecated": true,
      "minimum": 1,
      "maximum": 1023
    }
  }
}

const Planning = () => {

  const dispatch = useAppDispatch();

  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [step, setStep] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [jobHeaderSaved, setJobHeaderSaved] = useState(false);
  const [jobStatementValidation, setJobStatementValidation] = useState('');
  const [locationsValidated, setLocationsValidated] = useState(false);
  const [validationDetails, setValidationDetails] = useState({javaVersion: '', nodeVersion: '', spaceAvailableMb: '', error: ''});

  const zoweVersion = useAppSelector(selectZoweVersion);
  const installationArgs: any = useAppSelector(selectInstallationArgs);

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    // FIXME: Add a popup warning in case failed to get config files
    // FIXME: Save yaml and schema on disk to not to pull it each time?
    // REVIEW: Replace JobStatement text area with set of text fields?
  
    window.electron.ipcRenderer.getZoweVersion().then((res: IResponse) => dispatch(setZoweVersion(res.status ? res.details : '' )));

    window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
      if (res.status) {
        dispatch(setYaml(res.details.config));
        const schema = res.details.schema;
        // FIXME: Link schema by $ref properly - https://jsonforms.io/docs/ref-resolving
        schema.properties.zowe.properties.setup.properties.dataset.properties.parmlibMembers.properties.zis = serverSchema.$defs.datasetMember;
        dispatch(setSchema(schema));
        let installationDir = '', javaHome, nodeHome;
        if (res.details.config?.zowe?.runtimeDirectory && res.details.config?.zowe?.workspaceDirectory) {
          const getParentDir = (path: string): string => path.split('/').filter((i: string, ind: number) => i || !ind).slice(0, -1).join('/');
          const runtimeParent = getParentDir(res.details.config.zowe.runtimeDirectory);
          const workspaceParent = getParentDir(res.details.config.zowe.workspaceDirectory);
          if (runtimeParent === workspaceParent) installationDir = runtimeParent;
        }
        javaHome = (res.details.config?.java?.home) ? res.details.config.java.home : '';
        nodeHome = (res.details.config?.node?.home) ? res.details.config.node.home : '';
        dispatch(setInstallationArgs({...installationArgs, installationDir, javaHome, nodeHome}));
      } else {
        window.electron.ipcRenderer.getExampleZowe().then((res: IResponse) => {
          dispatch(setYaml(res.details));
          return res.status
        }).then((yamlStatus: boolean) => {
          window.electron.ipcRenderer.getZoweSchema().then((res: IResponse) => {
            const schema = res.details;
            // FIXME: Link schema by $ref properly - https://jsonforms.io/docs/ref-resolving
            schema.properties.zowe.properties.setup.properties.dataset.properties.parmlibMembers.properties.zis = serverSchema.$defs.datasetMember;
            dispatch(setSchema(schema));
          }); 
        }); 
      }
    })
  }, []);  

  useEffect(() => {
    dispatch(setNextStepEnabled(jobHeaderSaved && locationsValidated));
  }, [jobHeaderSaved, locationsValidated]);

  useEffect(() => {
    const nextPosition = document.getElementById(`position-${step}`);
    nextPosition.scrollIntoView({behavior: 'smooth'});
    setTimeout(() => {
      setOpacity(1);
    }, 500);
  }, [step]);

  const getENVVars = () => {
    return window.electron.ipcRenderer.getENVVars(connectionArgs).then((res: IResponse) => {
      if (res.status) {
        try {
          const lines = res.details.split('\n').map((l: string) => l.trim()).filter((l: string) => !l.includes("echo"));
          let nodeHome, javaHome;
          lines.map((line: string) => {
            if (line.includes('node')) nodeHome = installationArgs.nodeHome ? installationArgs.nodeHome : line;
            if (line.includes('java')) javaHome = installationArgs.javaHome ? installationArgs.javaHome : line;
          });
          dispatch(setInstallationArgs({...installationArgs, javaHome, nodeHome}));
        } catch (error) {
          return {status: false, details: error.message}
        }
      }
      return res;
    });
  }

  const saveJobHeader = (e: any) => {
    e.preventDefault();
    setJobStatementValidation('');
    dispatch(setLoading(true));
    window.electron.ipcRenderer.saveJobHeader(connectionArgs.jobStatement)
      .then(() => getENVVars())
      .then((res: IResponse) => {
        if (!res.status) {
          setJobStatementValidation(res.details);
          console.warn('Failed to verify job statement');
        } else {
          if (step < 1) {
            setOpacity(0);
            setStep(1);
          }
        }
        setJobHeaderSaved(res.status);
        dispatch(setLoading(false));
      })
      .catch((err: Error) => {
        console.warn(err);
        setJobStatementValidation(err.message);
        dispatch(setLoading(false));
      });    
  }

  const validateLocations = (e: any) => {
    e.preventDefault();
    setValidationDetails({...validationDetails, error: ''});
    if (!installationArgs.javaHome || !installationArgs.nodeHome || !installationArgs.installationDir) {
      console.warn('Please fill in all values');
      return;
    }
    dispatch(setLoading(true));

    Promise.all([
      window.electron.ipcRenderer.checkJava(connectionArgs, installationArgs.javaHome),
      window.electron.ipcRenderer.checkNode(connectionArgs, installationArgs.nodeHome),
      window.electron.ipcRenderer.checkSpace(connectionArgs, installationArgs.installationDir)
    ]).then((res: Array<IResponse>) => {
      const details = {javaVersion: '', nodeVersion: '', spaceAvailableMb: '', error: ''}
      try {
        details.javaVersion = res[0].details.split('\n').filter((i: string) => i.trim().startsWith('java version'))[0].trim().slice(14, -1);
      } catch (error) {
        details.error = details.error + `Can't get java version; `;
        console.warn(res[0].details);
      }
      try {
        details.nodeVersion = res[1].details.split('\n').filter((i: string) => i.trim().startsWith('v'))[0].slice(1);
      } catch (error) {
        details.error = details.error + `Can't get node version; `;
        console.warn(res[1].details);
      }
      try {
        const dfOut: string = res[2].details.split('\n').filter((i: string) => i.trim().startsWith(installationArgs.installationDir.slice(0, 3)))[0];
        details.spaceAvailableMb = dfOut.match(/\d+\/\d+/g)[0].split('/')[0];
        // FIXME: Space requirement is made up, Zowe 2.9.0 convenience build is 515Mb and growing per version. Make it double for extracted files.
        if (parseInt(details.spaceAvailableMb, 10) < 1300) { 
          details.error = details.error + `Not enough space, you need at least 1300MB; `;
        }
      } catch (error) {
        details.error = details.error + `Can't check space available; `;
        console.warn(res[2].details);
      }
      setValidationDetails(details);
      dispatch(setLoading(false));
      if (!details.error) {
        setLocationsValidated(true);
        setStep(2);
        setOpacity(0);
      }
    })
  }

  return (
    <ContainerCard title="Before you start" description="Prerequisites, requirements and roles needed to install">
      <Box sx={{height: step === 0 ? 'calc(100vh - 200px)' : 'auto', opacity: step === 0 ? 1 : opacity}}>
        <Typography sx={{ mb: 2 }} color="text.secondary"> 
          {/* TODO: Allow to choose Zowe version here by click here, support for other instalation types? */}
          {zoweVersion ? `About to install latest Zowe version: ${zoweVersion} from the convenience build` : ''}
        </Typography>
        <Typography id="position-0" sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">     
        {/* <Describe permissions that may be needed in detail>  */}  
        {`The basic role for the installation is the system programmer ( OMVS / z/OS ) 
At some stages, you may need additional permissions: 
    - Security administrator role will be required for configuring proper permissions in z/OS and z/OSMF and to generate certificates for Zowe.
    - Network administrator help may be needed to define a set of ports that can be used by Zowe.`}
        </Typography>
        <Typography sx={{ mb: 1 }} color="text.secondary">
          <Link href="https://docs.zowe.org/stable/user-guide/install-zos" rel="noreferrer" target="_blank">High-level installation overview on Zowe Docs</Link>
        </Typography>
        <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">    
        {`We will be running installation and configuration commands on the mainframe by submitting jobs through the FTP connection. 
Please customize job statement below to match your system requirements.
  `}
        </Typography>
        <FormControl>
          <TextField
            sx={{
              '& .MuiInputBase-root': { height: '120px', minWidth: '72ch', fontFamily: 'monospace' },
            }}
            label="Job statement"
            multiline
            maxRows={6}
            value={connectionArgs.jobStatement}
            onChange={(e) => {dispatch(setConnectionArgs({...connectionArgs, jobStatement: e.target.value}))}}
            variant="standard"
          />
        </FormControl>
        <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type={step === 0 ? "submit" : "button"} variant="text" onClick={e => saveJobHeader(e)}>Save and validate</Button>
          {jobHeaderSaved ? 
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 32 }}/> : jobStatementValidation ? <Typography sx={{color: "red"}}>{jobStatementValidation}</Typography> : null}
        </FormControl>
      </Box>
      {step > 0 
        ? <Box sx={{height: step === 1 ? 'calc(100vh - 272px)' : 'auto', p: '36px 0', opacity: step === 1 ? 1 : opacity}}>
          <Typography id="position-1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">       
            {`Now let's define general USS locations`}
          </Typography>
          <FormControl>
            <TextField 
              id="installation-input"
              required
              style={{marginLeft: 0}}
              label="Installation location"
              variant="standard"
              helperText="Location for Zowe source files"
              value={installationArgs.installationDir}
              onChange={(e) => dispatch(setInstallationArgs({...installationArgs, installationDir: e.target.value}))}
            />
          </FormControl>
          <FormControl>
            <TextField 
              id="java-home-input"
              required
              style={{marginLeft: 0}}
              label="Java location"
              variant="standard"
              helperText="Location of Java in USS"
              value={installationArgs.javaHome}
              onChange={(e) => dispatch(setInstallationArgs({...installationArgs, javaHome: e.target.value}))}
            />
          </FormControl>
          <FormControl>
            <TextField 
              id="node-home-input"
              required
              style={{marginLeft: 0}}
              label="Node JS location"
              variant="standard"
              helperText="Location of Node JS in USS"
              value={installationArgs.nodeHome}
              onChange={(e) => dispatch(setInstallationArgs({...installationArgs, nodeHome: e.target.value}))}
            />
          </FormControl>
          <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
            <Button sx={{boxShadow: 'none', mr: '12px'}} type={step === 1 ? "submit" : "button"} variant="text" onClick={e => validateLocations(e)}>Validate locations</Button>
            {locationsValidated ? <CheckCircleOutlineIcon color="success" sx={{ fontSize: 32 }}/> : validationDetails.error ? <Typography sx={{color: "red"}}>{validationDetails.error}</Typography> : null}
          </FormControl>
        </Box>
        : <div/> }
      {step > 1 
        ? <Box sx={{height: step === 2 ? 'calc(100vh - 272px)' : 'auto', p: '36px 0', opacity: step === 2 ? 1 : opacity}}>
          <Typography id="position-2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">       
            {`Found Java version: ${validationDetails.javaVersion}, Node version: ${validationDetails.nodeVersion}, Space available: ${validationDetails.spaceAvailableMb}MB

All set, ready to proceed.

<Add a checklist of components / settings user want to use, filter further steps accordingly`
}
          </Typography>
        </Box>
        : <div/> }
    </ContainerCard>
  );
};

export default Planning;

