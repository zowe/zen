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
import CheckCircle from '@mui/icons-material/CheckCircle';
import { setYaml, setSchema, setNextStepEnabled, setLoading, selectYaml } from '../configuration-wizard/wizardSlice';
import { selectConnectionArgs, setConnectionArgs } from './connection/connectionSlice';
import { setPlanningStatus, selectPlanningStatus } from './progressSlice';
import { setZoweVersion, setInstallationArgs, selectInstallationArgs, selectZoweVersion } from './installation/installationSlice';
import { setJobStatement, setJobStatementValid, setJobStatementValidMsg, setLocationValidationDetails, selectJobStatement, selectJobStatementValid, selectJobStatementValidMsg, selectLocValidationDetails } from "./PlanningSlice";
import { useAppDispatch, useAppSelector } from '../../hooks';
import { IResponse } from '../../../types/interfaces';
import Alert from "@mui/material/Alert";
import { alertEmitter } from "../Header";
import { Checkbox, FormControlLabel } from "@mui/material";
import EditorDialog from "../common/EditorDialog";

// TODO: Our current theoretical cap is 72 (possibly minus a couple for "\n", 70?) But we force more chars in InstallationHandler.tsx
// This is all I want to manually test for now. Future work can min/max this harder
const JCL_UNIX_SCRIPT_CHARS = 55;

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
      "pattern": "^([A-Z$#@]){1}([A-Z0-9$#@]){0,7}$",
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
  const [localYaml, setLocalYaml] = useState(useAppSelector(selectYaml));

  const jobStatementValid = useAppSelector(selectJobStatementValid);
  const jobStatementValidMsg = useAppSelector(selectJobStatementValidMsg);

  const locationValidationDetails = useAppSelector(selectLocValidationDetails);

  const planningStatus = useAppSelector(selectPlanningStatus);
  
  const [step, setStep] = useState(0);

  const [jobHeaderSaved, setJobHeaderSaved] = useState(false);
  const [isJobStatementUpdated, setIsJobStatementUpdated] = useState(false);
  const [jobStatementValue, setJobStatementValue] = useState(useAppSelector(selectJobStatement));
  
  const [locationsValidated, setLocationsValidated] = useState(false);
  const [isLocationsUpdated, setIsLocationsUpdated] = useState(false);
  const [validationDetails, setValidationDetails] = useState({javaVersion: '', nodeVersion: '', spaceAvailableMb: '', error: ''});
  const [showZosmfAttributes, setShowZosmfAttributes] = useState(true);

  const zoweVersion = useAppSelector(selectZoweVersion);
  const installationArgs: any = useAppSelector(selectInstallationArgs);
  const [requiredSpace, setRequiredSpace] = useState(1300); //in megabytes
  // let localYaml: any = getZoweConfig();

  const [contentType, setContentType] = useState('output');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  const toggleEditorVisibility = (type?: any) => {
    if (type) {
      setContentType(type);
    }
    setEditorVisible(!editorVisible);
  };

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    // FIXME: Add a popup warning in case failed to get config files
    // FIXME: Save yaml and schema on disk to not to pull it each time?
    // REVIEW: Replace JobStatement text area with set of text fields?

    if(jobStatementValid && !isJobStatementUpdated) {
      saveJobHeader(null);
      return;
    }

    window.electron.ipcRenderer.getZoweVersion().then((res: IResponse) => dispatch(setZoweVersion(res.status ? res.details : '' )));

    window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
      if (res.status) {
        dispatch(setYaml(res.details.config));
        setLocalYaml(res.details.config);
        const schema = res.details.schema;
        // FIXME: Link schema by $ref properly - https://jsonforms.io/docs/ref-resolving
        schema.properties.zowe.properties.setup.properties.dataset.properties.parmlibMembers.properties.zis = serverSchema.$defs.datasetMember;
        schema.properties.zowe.properties.setup.properties.certificate.properties.pkcs12.properties.directory = serverSchema.$defs.path;
        schema.$id = serverSchema.$id;
        if(schema.$defs?.networkSettings?.properties?.server?.properties?.listenAddresses?.items){
          delete schema.$defs?.networkSettings?.properties?.server?.properties?.listenAddresses?.items?.ref;
          schema.$defs.networkSettings.properties.server.properties.listenAddresses.items = serverSchema.$defs.ipv4
        }
        dispatch(setSchema(schema));
        let installationDir = '';
        if (res.details.config?.zowe?.runtimeDirectory && res.details.config?.zowe?.workspaceDirectory) {
          const getParentDir = (path: string): string => path.split('/').filter((i: string, ind: number) => i || !ind).slice(0, -1).join('/');
          const runtimeParent = getParentDir(res.details.config?.zowe?.runtimeDirectory);
          const workspaceParent = getParentDir(res.details.config?.zowe?.workspaceDirectory);
          if (runtimeParent === workspaceParent) installationDir = runtimeParent;
        }
        dispatch(setInstallationArgs({...installationArgs, installationDir: res.details.config?.zowe?.runtimeDirectory ?? ''}));
      } else {
        window.electron.ipcRenderer.getExampleZowe().then((res: IResponse) => {
          dispatch(setYaml(res.details));
          setLocalYaml(res.details);
          return res.status
        }).then((yamlStatus: boolean) => {
          window.electron.ipcRenderer.getZoweSchema().then((res: IResponse) => {
            const schema = res.details;
            // FIXME: Link schema by $ref properly - https://jsonforms.io/docs/ref-resolving
            schema.properties.zowe.properties.setup.properties.dataset.properties.parmlibMembers.properties.zis = serverSchema.$defs.datasetMember;
            schema.properties.zowe.properties.setup.properties.certificate.properties.pkcs12.properties.directory = serverSchema.$defs.path;
            schema.$id = serverSchema.$id;
            if(schema.$defs?.networkSettings?.properties?.server?.properties?.listenAddresses?.items){
              delete schema.$defs?.networkSettings?.properties?.server?.properties?.listenAddresses?.items?.ref;
              schema.$defs.networkSettings.properties.server.properties.listenAddresses.items = serverSchema.$defs.ipv4
            }
            dispatch(setSchema(schema));
          }); 
        }); 
      }
    })
  }, []);  

  useEffect(() => {
    dispatch(setNextStepEnabled(jobHeaderSaved && locationsValidated));
    // dispatch(setNextStepEnabled(true));
  }, [jobHeaderSaved, locationsValidated]);

  useEffect(() => {
    const nextPosition = document.getElementById(`position-${step}`);
    nextPosition.scrollIntoView({behavior: 'smooth'});
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
          nodeHome && dispatch(setInstallationArgs({...installationArgs, nodeHome: nodeHome}))
          javaHome && dispatch(setInstallationArgs({...installationArgs, javaHome: javaHome}))

        } catch (error) {
          return {status: false, details: error.message}
        }
      }
      return res;
    });
  }

  const saveJobHeader = (e: any) => {
    
    if(jobStatementValid && !isJobStatementUpdated) {
      setJobHeaderSaved(true);
      setEditorContent(jobStatementValidMsg);
      setContentType('output');
      if (step < 1) {
        setStep(1);
      }
      if(planningStatus && !isLocationsUpdated) {
        validateLocations(null);
      }
      return;
    }
    e.preventDefault();
    dispatch(setLoading(true));
    window.electron.ipcRenderer.saveJobHeader(jobStatementValue)
      .then(() => getENVVars())
      .then((res: IResponse) => {
        setEditorContent(res.details);
        setContentType('output');
        if (!res.status) { // Failure case
          dispatch(setJobStatementValidMsg(res.details));
          console.warn('Failed to verify job statement');
          alertEmitter.emit('showAlert', 'Failed to verify job statement', 'error');
        } else { // Success JCL case
          dispatch(setJobStatementValid(true));
          alertEmitter.emit('hideAlert');
          if(locationsValidated) {
            dispatch(setPlanningStatus(true));
            dispatch(setNextStepEnabled(true));
            setStep(2);
          } else if (step < 1) {
            setStep(1);
          }
        }
        setJobHeaderSaved(res.status);
        dispatch(setLoading(false));
      })
      .catch((err: Error) => {
        setEditorContent(err.message);
        setContentType('output');
        console.warn(err);
        dispatch(setJobStatementValidMsg(err.message));
        dispatch(setJobStatementValid(false));
        alertEmitter.emit('showAlert', err.message, 'error');
        dispatch(setLoading(false));
      });    
  }

  const validateLocations = (e: any, click?: boolean) => {
   
    if(planningStatus && !isLocationsUpdated && !click) {
      setLocationsValidated(true);
      setValidationDetails(locationValidationDetails);
      setEditorContent(jobStatementValidMsg);
      setContentType('output');
      dispatch(setNextStepEnabled(true));
      setStep(2);
      return;
    }

    e.preventDefault();
    setValidationDetails({...validationDetails, error: ''});
    if (!localYaml?.java?.home || !localYaml?.node?.home || !localYaml?.zowe?.runtimeDirectory) {
      console.warn('Please fill in all values');
      alertEmitter.emit('showAlert', 'Please fill in all values', 'error');
      //showAlert('Please fill in all values', 'success', 5000);
      return;
    }
    dispatch(setLoading(true));

    // TODO: Possible feature for future: add to checkDir to see if existing Zowe install exists.
    // Then give the user ability to use existing zowe.yaml to auto-fill in fields from Zen
    Promise.all([
      window.electron.ipcRenderer.checkJava(connectionArgs, localYaml?.java?.home),
      window.electron.ipcRenderer.checkNode(connectionArgs, localYaml?.node?.home),
      window.electron.ipcRenderer.checkDirOrCreate(connectionArgs, localYaml?.zowe?.runtimeDirectory),
      window.electron.ipcRenderer.checkDirOrCreate(connectionArgs, localYaml?.zowe?.workspaceDirectory),
      window.electron.ipcRenderer.checkDirOrCreate(connectionArgs, localYaml?.zowe?.extensionDirectory),
      window.electron.ipcRenderer.checkDirOrCreate(connectionArgs, localYaml?.zowe?.logDirectory),
    ]).then((res: Array<IResponse>) => {
      const details = {javaVersion: '', nodeVersion: '', spaceAvailableMb: '', error: ''};
      setEditorContent(res.map(item=>item?.details).join('\n'));
      setContentType('output');

      // If res[?] doesn't exist, ?-th window.electronc.ipcRender call failed...
      try {
        details.javaVersion = res[0].details.split('\n').filter((i: string) => i.trim().startsWith('java version'))[0].trim().slice(14, -1);
      } catch (error) {
        details.error = details.error + `Can't get Java version `;
        console.warn(res[0].details);
      }
      try {
        details.nodeVersion = res[1].details.split('\n').filter((i: string) => i.trim().startsWith('v'))[0].slice(1);
      } catch (error) {
        details.error = details.error + `Can't get Node.js version `;
        console.warn(res[1].details);
      }
      if (res[2].status == false) { // Checking run-time directory existence or creating it failed?
        details.error = details.error + res[2].details;
        console.warn(res[2].details);
      }
      if (res[3].status == false) { // workspace directory
        details.error = details.error + res[3].details;
        console.warn(res[3].details);
      }
      if (res[4].status == false) { // extensions directory
        details.error = details.error + res[4].details;
        console.warn(res[4].details);
      }
      if (res[5].status == false) { // logs directory
        details.error = details.error + res[5].details;
        console.warn(res[5].details);
      }
      //Do not check space because space on ZFS is dynamic. you can have more space than USS thinks.
      // try {
      //   const dfOut: string = res[2].details.split('\n').filter((i: string) => i.trim().startsWith(installationArgs.installationDir.slice(0, 3)))[0];
      //   details.spaceAvailableMb = dfOut.match(/\d+\/\d+/g)[0].split('/')[0];
      //   // FIXME: Space requirement is made up, Zowe 2.9.0 convenience build is 515Mb and growing per version. Make it double for extracted files.
      //   if (parseInt(details.spaceAvailableMb, 10) < requiredSpace) { 
      //     details.error = details.error + `Not enough space, you need at least ${requiredSpace}MB; `;
      //   }
      // } catch (error) {
      //   details.error = details.error + `Can't check space available; `;
      //   console.warn(res[2].details);
      // }
      setValidationDetails(details);
      dispatch(setLocationValidationDetails(details))
      dispatch(setLoading(false));
      if (!details.error) {
        alertEmitter.emit('hideAlert');
        setLocationsValidated(true);
        dispatch(setPlanningStatus(true));
        setStep(2);
      } else {
        alertEmitter.emit('showAlert', details.error, 'error');
      }
    })
  }

  const onJobStatementChange = (newJobStatement: string) => {
    setIsJobStatementUpdated(true);
    setJobStatementValue(newJobStatement);
    setJobHeaderSaved(false);
    setPlanningStatus(false);
    dispatch(setJobStatement(newJobStatement));
    dispatch(setPlanningStatus(false))
    setStep(0);
  }

  const formChangeHandler = () => {
    setIsLocationsUpdated(true);
    setPlanningStatus(false);
    setLocationsValidated(false);
    dispatch(setPlanningStatus(false));
    dispatch(setNextStepEnabled(false));
    setStep(1);
  }

  return (
    <React.Fragment><span id="position-0"></span>
    <ContainerCard title="Before you start" description="Prerequisites, requirements and roles needed to install.">
      <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} content={editorContent}/>
      <Box sx={{height: step === 0 ? 'calc(100vh - 200px)' : 'auto'}}>
        <Typography sx={{ mb: 2 }} color="text.secondary"> 
          {/* TODO: Allow to choose Zowe version here by click here, support for other instalation types? */}
          {zoweVersion ? `About to install latest Zowe version: ${zoweVersion} from the convenience build. Approximate required space: ${requiredSpace}MB` : ''}
        </Typography>
        <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">     
        {/* <Describe permissions that may be needed in detail>  */}  
        {`The basic role for the installation is the system programmer ( OMVS / z/OS ) 
For some stages, you may need additional permissions: 
    - A security administrator to configure proper permissions in z/OS and z/OSMF and to generate certificates for Zowe.
    - A network administrator to define a set of ports that can be used by Zowe.`}
        </Typography>
        <Typography sx={{ mb: 1 }} color="text.secondary">
          <Link href="https://docs.zowe.org/stable/user-guide/install-zos" rel="noreferrer" target="_blank">Here is the most up to date, high-level installation overview for Zowe</Link>
        </Typography>
        <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">    
        {`Zen will run installation (zwe install) and initialization (zwe init) commands on the mainframe by submitting jobs through the FTP connection. 
Please customize the job statement below to match your system requirements.
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
            value={jobStatementValue}
            onChange={(e) => {dispatch(setConnectionArgs({...connectionArgs, jobStatement: e.target.value})); onJobStatementChange(e.target.value)}}
            variant="standard"
          />
        </FormControl>
        <FormControl sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', justifyContent: 'center'}} type={step === 0 ? "submit" : "button"} variant="text" onClick={e => saveJobHeader(e)}>Save and validate</Button>
          {jobHeaderSaved ? 
            <CheckCircle sx={{ color: 'green', fontSize: '1rem' }} /> : null}
        </FormControl>
      </Box>
      {step > 0 
        ? <Box sx={{height: step === 1 ? 'calc(100vh - 272px)' : 'auto', p: '36px 0'}} onChange={(e) => {
            dispatch(setYaml(localYaml));
            formChangeHandler();
            }}
          >
          <Typography id="position-1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">       
            {`Now let's define some properties like z/OS Unix locations, identifiers, and z/OSMF details (optional).`}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
          <FormControl>
            <div>
              <TextField
                id="installation-input"
                required
                style={{marginLeft: 0}}
                label="Run-time Directory (or installation location)"
                variant="standard"
                value={localYaml?.zowe?.runtimeDirectory || installationArgs.installationDir}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, installationDir: e.target.value}));
                  setLocalYaml((prevYaml: { zowe: any; }) => ({
                    ...prevYaml,
                    zowe: {...prevYaml.zowe, runtimeDirectory: e.target.value}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('zowe.runtimeDirectory', e.target.value).then((res: any) => {
                    // console.log('updated zowe.runtimeDirectory')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Readable z/OS Unix location for Zowe source files. Approximate space: {`${requiredSpace}MB`}</p>
            </div>
          </FormControl>
          <FormControl>
            <div>
              <TextField
                id="workspace-input"
                required
                style={{marginLeft: 0}}
                label="Workspace Directory"
                variant="standard"
                value={localYaml?.zowe?.workspaceDirectory ?? ''}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, workspaceDir: e.target.value}));
                  setLocalYaml((prevYaml: { zowe: any; }) => ({
                    ...prevYaml,
                    zowe: {...prevYaml.zowe, workspaceDirectory: e.target.value}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('zowe.workspaceDirectory', e.target.value).then((res: any) => {
                    // console.log('updated zowe.workspaceDirectory')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Read and writeable z/OS Unix location for the Zowe workspace.</p>
            </div>
          </FormControl>
          <FormControl>
            <div>
              <TextField
                id="log-input"
                required
                style={{marginLeft: 0}}
                label="Log Directory"
                variant="standard"
                value={localYaml?.zowe?.logDirectory || installationArgs.logDir}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, logDir: e.target.value}));
                  setLocalYaml((prevYaml: { zowe: any; }) => ({
                    ...prevYaml,
                    zowe: {...prevYaml.zowe, logDirectory: e.target.value}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('zowe.logDirectory', e.target.value).then((res: any) => {
                    // console.log('updated zowe.logDirectory')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Read and writeable z/OS Unix location for Zowe's logs.</p>
            </div>
          </FormControl>
          <FormControl>
            <div>
              <TextField
                id="extension-input"
                required
                style={{marginLeft: 0}}
                label="Extensions Directory"
                variant="standard"
                value={localYaml?.zowe?.extensionDirectory || installationArgs.extensionDir}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, extensionDir: e.target.value}));
                  setLocalYaml((prevYaml: { zowe: any; }) => ({
                    ...prevYaml,
                    zowe: {...prevYaml.zowe, extensionDirectory: e.target.value}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('zowe.extensionDirectory', e.target.value).then((res: any) => {
                    // console.log('updated zowe.extensionDirectory')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Read and writeable z/OS Unix location to contain Zowe's extensions.</p>
            </div>
          </FormControl>
          <FormControl>
            <div>
              <TextField
                id="rbac-input"
                required
                style={{marginLeft: 0}}
                label="Rbac Profile Identifier"
                variant="standard"
                value={localYaml?.zowe?.rbacProfileIdentifier || installationArgs.rbacProfile}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, rbacProfile: e.target.value}));
                  setLocalYaml((prevYaml: { zowe: any; }) => ({
                    ...prevYaml,
                    zowe: {...prevYaml.zowe, rbacProfileIdentifier: e.target.value}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('zowe.rbacProfileIdentifier', e.target.value).then((res: any) => {
                    // console.log('updated zowe.rbacProfileIdentifier')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>ID used for determining resource names as used in RBAC authorization checks.</p>
            </div>
          </FormControl>
          </div>
          <div style={{ flex: 1 }}>
          <FormControl>
            <div>
              <TextField
                id="job-name-input"
                required
                style={{marginLeft: 0}}
                label="Job Name"
                variant="standard"
                value={localYaml?.zowe?.job?.name || installationArgs.jobName}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, jobName: e.target.value}));
                  setLocalYaml((prevYaml: { zowe: any; }) => ({
                    ...prevYaml,
                    zowe: {...prevYaml.zowe, job: {...prevYaml.zowe.job, name: e.target.value}}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('zowe.job.name', e.target.value).then((res: any) => {
                    // console.log('updated zowe.job.name')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Job name of the Zowe primary ZWESLSTC started task.</p>
            </div>
          </FormControl>
          <FormControl>
            <div>
              <TextField
                id="job-prefix-input"
                required
                style={{marginLeft: 0}}
                label="Job Prefix"
                variant="standard"
                value={localYaml?.zowe?.job?.prefix || installationArgs.jobPrefix}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, jobPrefix: e.target.value}));
                  setLocalYaml((prevYaml: { zowe: any; }) => ({
                    ...prevYaml,
                    zowe: {...prevYaml.zowe, job: {...prevYaml.zowe.job, prefix: e.target.value}}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('zowe.job.prefix', e.target.value).then((res: any) => {
                    // console.log('updated zowe.job.prefi')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Short prefix to identify/customize address spaces created by the Zowe job.</p>
            </div>
          </FormControl>
          <FormControl>
            <div>
              <TextField
                id="cookie-input"
                required
                style={{marginLeft: 0}}
                label="Cookie Identifier"
                variant="standard"
                value={localYaml?.zowe?.cookieIdentifier || installationArgs.cookieId}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, cookieId: e.target.value}));
                  setLocalYaml((prevYaml: { zowe: any; }) => ({
                    ...prevYaml,
                    zowe: {...prevYaml.zowe, cookieIdentifier: e.target.value}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('zowe.cookieIdentifier', e.target.value).then((res: any) => {
                    // console.log('updated zowe.cookieIdentifier')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>ID that can be used by the servers to distinguish their cookies from unrelated Zowe installs.</p>
            </div>
          </FormControl>
          <FormControl>
            <div>
              <TextField
                id="java-home-input"
                required
                style={{marginLeft: 0}}
                label="Java location"
                variant="standard"
                value={localYaml?.java?.home || installationArgs.javaHome}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, javaHome: e.target.value}));
                  setLocalYaml((prevYaml: { java: any; }) => ({
                    ...prevYaml,
                    java: {...prevYaml.java, home: e.target.value}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('java.home', e.target.value).then((res: any) => {
                    // console.log('updated zowe.java.home')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>z/OS Unix location of Java.</p>
            </div>
          </FormControl>
          <FormControl>
            <div>
              <TextField
                id="node-home-input"
                required
                style={{marginLeft: 0}}
                label="Node.js location"
                variant="standard"
                value={localYaml?.node?.home || installationArgs.nodeHome}
                onChange={(e) => {
                  dispatch(setInstallationArgs({...installationArgs, nodeHome: e.target.value}));
                  setLocalYaml((prevYaml: { node: any; }) => ({
                    ...prevYaml,
                    node: {...prevYaml.node, home: e.target.value}
                  }))
                  window.electron.ipcRenderer.setConfigByKey('node.home', e.target.value).then((res: any) => {
                    // console.log('updated zowe.node.home')
                  })
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>z/OS Unix location of Node.js.</p>
            </div>
          </FormControl>
          </div>
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={showZosmfAttributes}
                onChange={(e) => {
                  setShowZosmfAttributes(e.target.checked);
                  formChangeHandler();
                }}
              />
            }
            label="Set z/OSMF Attributes (optional)"
          />

          {showZosmfAttributes && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <FormControl>
                  <div>
                    <TextField
                      id="zosmf-host"
                      required
                      style={{marginLeft: 0}}
                      label="z/OSMF Host"
                      variant="standard"
                      value={localYaml?.zOSMF?.host || connectionArgs.host}
                      onChange={(e) => {
                        dispatch(setInstallationArgs({...installationArgs, zosmfHost: e.target.value}));
                        setLocalYaml((prevYaml: any) => ({
                          ...prevYaml,
                          zOSMF: {...prevYaml.zOSMF, host: e.target.value}
                        }))
                        window.electron.ipcRenderer.setConfigByKey('zOSMF.host', e.target.value).then((res: any) => {
                          // console.log('updated zowe.zOSMF.host')
                        })
                      }}
                    />
                    <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Host (or domain name) of your z/OSMF instance.</p>
                  </div>
                </FormControl>
                <FormControl>
                  <div>
                    <TextField
                      id="zosmf-port"
                      required
                      style={{marginLeft: 0}}
                      label="z/OSMF Port"
                      variant="standard"
                      type="number"
                      value={localYaml?.zOSMF?.port || installationArgs.zosmfPort}
                      onChange={(e) => {
                        dispatch(setInstallationArgs({...installationArgs, zosmfPort: e.target.value}));
                        setLocalYaml((prevYaml: any) => ({
                          ...prevYaml,
                          zOSMF: {...prevYaml.zOSMF, port: Number( e.target.value)}
                        }))
                        window.electron.ipcRenderer.setConfigByKey('zOSMF.port', Number(e.target.value)).then((res: any) => {
                          // console.log('updated zowe.zOSMF.port')
                        })
                      }}
                    />
                    <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Port number of your z/OSMF instance.</p>
                  </div>
                </FormControl>
              </div>
              <div style={{ flex: 1 }}>
                <FormControl>
                  <div>
                    <TextField
                      id="zosmf-appl-id"
                      required
                      style={{marginLeft: 0}}
                      label="z/OSMF Application Id"
                      variant="standard"
                      value={localYaml?.zOSMF?.applId || installationArgs.zosmfApplId}
                      onChange={(e) => {
                        dispatch(setInstallationArgs({...installationArgs, zosmfApplId: e.target.value}));
                        setLocalYaml((prevYaml: { zOSMF: any; }) => ({
                          ...prevYaml,
                          zOSMF: {...prevYaml.zOSMF, applId: e.target.value}
                        }))
                        window.electron.ipcRenderer.setConfigByKey('zOSMF.applId', e.target.value).then((res: any) => {
                          // console.log('updated zowe.zOSMF.applId')
                        })
                      }}
                    />
                    <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Application ID of your z/OSMF instance.</p>

                  </div>
                </FormControl>
              </div>
            </div>
          )}
          <FormControl sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Button sx={{boxShadow: 'none'}} type={step === 1 ? "submit" : "button"} variant="text" onClick={e => validateLocations(e, true)}>Validate locations</Button>
            {locationsValidated ? <CheckCircle sx={{ color: 'green', fontSize: '1rem' }} /> : validationDetails.error ? null: null}
          </FormControl>
        </Box>
        : <div/> }
      {/* <Add a checklist of components / settings user want to use, filter further steps accordingly */}
      {step > 1 
        ? <Box sx={{height: step === 2 ? 'calc(100vh - 272px)' : 'auto', p: '36px 0'}}>
          <Typography id="position-2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">       
          {`Found Java version: ${validationDetails.javaVersion}, Node version: ${validationDetails.nodeVersion}

All set, ready to proceed.`
}
          </Typography>
        </Box>
        : <div/> }
    </ContainerCard>
    </React.Fragment>
  );
};

export default Planning;

