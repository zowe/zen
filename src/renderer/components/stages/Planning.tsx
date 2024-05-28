/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useEffect, useMemo, useState} from "react";
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import ContainerCard from '../common/ContainerCard';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { setYaml, setSchema, setNextStepEnabled, setLoading, selectYaml } from '../configuration-wizard/wizardSlice';
import { selectConnectionArgs, setConnectionArgs, setJobStatementVal } from './connection/connectionSlice';
import { setPlanningStatus, selectPlanningStatus } from './progress/progressSlice';
import { setZoweVersion, setInstallationArgs, selectInstallationArgs, selectZoweVersion } from './installation/installationSlice';
import { setJobStatement, setJobStatementValid, setJobStatementValidMsg, setLocationValidationDetails, setIsLocationValid, selectJobStatement, selectJobStatementValid, selectJobStatementValidMsg, selectLocValidationDetails } from "./PlanningSlice";
import { useAppDispatch, useAppSelector } from '../../hooks';
import { IResponse } from '../../../types/interfaces';
import { alertEmitter } from "../Header";
import { Checkbox, FormControlLabel } from "@mui/material";
import { setActiveStep } from './progress/activeStepSlice';
import EditorDialog from "../common/EditorDialog";
import { getStageDetails } from "../../../services/StageDetails";
import { getProgress, getPlanningStageStatus, setPlanningValidationDetailsState, getPlanningValidationDetailsState } from "./progress/StageProgressStatus";
import { EXAMPLE_YAML, YAML_SCHEMA } from "../common/Constants";

// TODO: Our current theoretical cap is 72 (possibly minus a couple for "\n", 70?) But we force more chars in InstallationHandler.tsx
// This is all I want to manually test for now. Future work can min/max this harder
const JCL_UNIX_SCRIPT_CHARS = 55;

const Planning = () => {

  const [stageLabel] = useState('Planning');

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;

  const dispatch = useAppDispatch();

  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [localYaml, setLocalYaml] = useState(useAppSelector(selectYaml));

  // const jobStatementValid = useAppSelector(selectJobStatementValid);
  const [jobStatementValid, setJobStatementValidation] = useState(getPlanningStageStatus()?.isJobStatementValid);
  const jobStatementValidMsg = useAppSelector(selectJobStatementValidMsg);

  const locationValidationDetails = useAppSelector(selectLocValidationDetails);

  const planningStatus = useAppSelector(selectPlanningStatus);
  
  const [step, setStep] = useState(0);

  const [jobHeaderSaved, setJobHeaderSaved] = useState(false);
  const [isJobStatementUpdated, setIsJobStatementUpdated] = useState(false);
  // const [jobStatementValue, setJobStatementValue] = useState(useAppSelector(selectJobStatement));
  const [jobStatementValue, setJobStatementValue] = useState(getPlanningStageStatus()?.jobStatement);
  
  const [locationsValidated, setLocationsValidated] = useState(getPlanningStageStatus()?.isLocationValid || false);
  const [isLocationsUpdated, setIsLocationsUpdated] = useState(false);
  const [validationDetails, setValidationDetails] = useState(getPlanningValidationDetailsState());
  const [showZosmfAttributes, setShowZosmfAttributes] = useState(true);

  const zoweVersion = useAppSelector(selectZoweVersion);
  const [installationArgs, setInstArgs] = useState(useAppSelector(selectInstallationArgs));
  const [requiredSpace, setRequiredSpace] = useState(1300); //in megabytes

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
    const nextPosition = document.getElementById('container-box-id');
    nextPosition.scrollIntoView({behavior: 'smooth', block: 'start'});

    if(getPlanningStageStatus()?.isJobStatementValid) {
      setJobHeaderSaved(true);
      if(getPlanningStageStatus()?.isLocationValid) {
        setStep(2);
      } else {
        setStep(1);
      }
    }
    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, [])

  useEffect(() => {
    setPlanningState(getProgress('planningStatus'));
    // FIXME: Add a popup warning in case failed to get config files
    // FIXME: Save yaml and schema on disk to not to pull it each time?
    // REVIEW: Replace JobStatement text area with set of text fields?

    dispatch(setJobStatementVal(jobStatementValue));

    window.electron.ipcRenderer.getZoweVersion().then((res: IResponse) => dispatch(setZoweVersion(res.status ? res.details : '' )));

    window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
      if (res.status) {
        dispatch(setYaml(res.details.config));
        setLocalYaml(res.details.config);
        const schema = res.details.schema;
        // Leaving this as a comment because the note about setting $ref properly is still valid i think
        // FIXME: Link schema by $ref properly - https://jsonforms.io/docs/ref-resolving
        // schema.properties.zowe.properties.setup.properties.dataset.properties.parmlibMembers.properties.zis = serverSchema.$defs.datasetMember;
        // schema.properties.zowe.properties.setup.properties.certificate.properties.pkcs12.properties.directory = serverSchema.$defs.path;
        // schema.$id = serverSchema.$id;
        // if(schema.$defs?.networkSettings?.properties?.server?.properties?.listenAddresses?.items){
        //   delete schema.$defs?.networkSettings?.properties?.server?.properties?.listenAddresses?.items?.ref;
        //   schema.$defs.networkSettings.properties.server.properties.listenAddresses.items = serverSchema.$defs.ipv4
        // }
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
        dispatch(setYaml(EXAMPLE_YAML));
        setLocalYaml((EXAMPLE_YAML));
        dispatch(setSchema(YAML_SCHEMA));
        window.electron.ipcRenderer.setConfig(EXAMPLE_YAML).then((res: IResponse) => {
          // yaml response
        });
        window.electron.ipcRenderer.setSchema(YAML_SCHEMA).then((res: IResponse) => {
          // schema response
        });
      }
    })

  }, []); 

  useEffect(() => {
    setPlanningState(jobHeaderSaved && locationsValidated);
  }, [jobHeaderSaved, locationsValidated]);

  useEffect(() => {
    const nextPosition = document.getElementById(`position-${step}`);
    nextPosition.scrollIntoView({behavior: 'smooth'});
  }, [step]);

  const setPlanningState = (status: boolean): void => {
    dispatch(setNextStepEnabled(status));
    dispatch(setPlanningStatus(status));
  }

  const setLocValidations = (status: boolean): void => {
    setLocationsValidated(status);
    dispatch(setIsLocationValid(status));
  }

  const setEditorContentAndType = (content: any, type: string): void => {
    setEditorContent(content);
    setContentType(type);
  }

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
      setEditorContentAndType(jobStatementValidMsg, 'output');
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
        setEditorContentAndType(res.details, 'output');
        if (!res.status) { // Failure case
          dispatch(setJobStatementValidMsg(res.details));
          console.warn('Failed to verify job statement', res.details);
          // TODO: This more detailed reason, for why Job submission failed, may be large and should be opened in an Editor
          alertEmitter.emit('showAlert', 'Failed to verify job statement ' + res.details, 'error');
        } else { // Success JCL case
          dispatch(setJobStatementValid(true));
          alertEmitter.emit('hideAlert');
          if(locationsValidated) {
            setPlanningState(true);
            setStep(2);
          } else if (step < 1) {
            setStep(1);
          }
        }
        setJobHeaderSaved(res.status);
        dispatch(setLoading(false));
      })
      .catch((err: Error) => {
        setEditorContentAndType(err.message, 'output');
        console.warn(err);
        dispatch(setJobStatementValidMsg(err.message));
        dispatch(setJobStatementValid(false));
        alertEmitter.emit('showAlert', err.message, 'error');
        dispatch(setLoading(false));
      });    
  }

  const validateLocations = (e: any, click?: boolean) => {
   
    if(planningStatus && !isLocationsUpdated && !click) {
      setLocValidations(true);
      setPlanningState(true);
      setValidationDetails(locationValidationDetails);
      setPlanningValidationDetailsState(locationValidationDetails);
      setEditorContentAndType(jobStatementValidMsg, 'output');
      setStep(2);
      return;
    }

    e.preventDefault();
    setValidationDetails({...validationDetails, error: ''});
    setPlanningValidationDetailsState({...validationDetails, error: ''});
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
      setPlanningValidationDetailsState(details);
      dispatch(setLocationValidationDetails(details))
      dispatch(setLoading(false));
      if (!details.error) {
        alertEmitter.emit('hideAlert');
        setLocValidations(true);
        setPlanningState(true);
        setStep(2);
      } else {
        dispatch(setPlanningStatus(false));
        alertEmitter.emit('showAlert', details.error, 'error');
      }
    })
  }

  const onJobStatementChange = (newJobStatement: string) => {
    setIsJobStatementUpdated(true);
    setJobStatementValue(newJobStatement);
    setJobHeaderSaved(false);
    setJobStatementValidation(false);
    dispatch(setJobStatement(newJobStatement));
    dispatch(setJobStatementValid(false));
    setPlanningState(false);
    setStep(0);
  }

  const formChangeHandler = (key?: string, value?: any, installationArg?: string) => {
    setIsLocationsUpdated(true);
    setPlanningStatus(false);
    setLocationsValidated(false);
    dispatch(setPlanningStatus(false));
    dispatch(setNextStepEnabled(false));
    setStep(1);

    if (!key || !value) {
      return;
    }

    if(installationArg) {
      const newInstallationArgs = { ...installationArgs, [installationArg]: value };
      dispatch(setInstallationArgs(newInstallationArgs));
      setInstArgs(newInstallationArgs);
    }

    const updatedYaml: any = updateAndReturnYaml(key, value)

    dispatch(setYaml(updatedYaml));
    setLocalYaml(updatedYaml);
  }

  const updateAndReturnYaml = (key: string, value: string) => {
    const keys = key.split('.');
    const updatedYaml: any = { ...localYaml };

    let nestedObject = updatedYaml;

    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        nestedObject[k] = { ...(nestedObject[k] || {}) };
        nestedObject = nestedObject[k];
    }

    nestedObject[keys[keys.length - 1]] = value;
    return updatedYaml;
  }

  return (
    <div id="container-box-id">
    <React.Fragment><span id="position-0"></span>
    <ContainerCard title="Before you start" description="Prerequisites, requirements and roles needed to install.">
      <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} content={editorContent}/>
      <Box id="conatiner-box-id" sx={{height: step === 0 ? 'calc(100vh - 200px)' : 'auto'}}>
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
        ?
          <Box sx={{height: step === 1 ? 'calc(100vh - 272px)' : 'auto', p: '36px 0'}} >
          <Typography id="position-1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }} color="text.secondary">       
            {`Now let's define some properties like z/OS Unix locations, identifiers, and (optionally) z/OSMF details.`}
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
                  formChangeHandler("zowe.runtimeDirectory", e.target.value, "installationDir");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.runtimeDirectory', e.target.value).then((res: any) => {
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
                value={localYaml?.zowe?.workspaceDirectory || installationArgs.workspaceDir}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  formChangeHandler("zowe.workspaceDirectory", e.target.value, "workspaceDir");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.workspaceDirectory', e.target.value).then((res: any) => {
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
                  formChangeHandler("zowe.logDirectory", e.target.value, "logDir");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.logDirectory', e.target.value).then((res: any) => {
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
                  formChangeHandler("zowe.extensionDirectory", e.target.value, "extensionDir");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.extensionDirectory', e.target.value).then((res: any) => {
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
                  formChangeHandler("zowe.rbacProfileIdentifier", e.target.value, "rbacProfile" );
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.rbacProfileIdentifier', e.target.value).then((res: any) => {
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
                  formChangeHandler("zowe.job.name", e.target.value, "jobName");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.job.name', e.target.value).then((res: any) => {
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
                  formChangeHandler("zowe.job.prefix", e.target.value, "jobName");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.job.prefix', e.target.value).then((res: any) => {
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
                  formChangeHandler("zowe.cookieIdentifier", e.target.value, "cookieId");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('zowe.cookieIdentifier', e.target.value).then((res: any) => {
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
                label="Java Location"
                variant="standard"
                value={localYaml?.java?.home || installationArgs.javaHome}
                onChange={(e) => {
                  formChangeHandler("java.home", e.target.value, "javaHome");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('java.home', e.target.value).then((res: any) => {
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
                label="Node.js Location"
                variant="standard"
                value={localYaml?.node?.home || installationArgs.nodeHome}
                onChange={(e) => {
                  formChangeHandler("node.home", e.target.value, "nodeHome");
                  window.electron.ipcRenderer.setConfigByKeyAndValidate('node.home', e.target.value).then((res: any) => {
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
                      value={localYaml?.zOSMF?.host || installationArgs.zosmfHost}
                      onChange={(e) => {
                        formChangeHandler("zOSMF.host", e.target.value, "zosmfHost");
                        window.electron.ipcRenderer.setConfigByKeyAndValidate('zOSMF.host', e.target.value).then((res: any) => {
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
                        formChangeHandler("zOSMF.port", Number(e.target.value), "zosmfPort");
                        window.electron.ipcRenderer.setConfigByKeyAndValidate('zOSMF.port', Number(e.target.value)).then((res: any) => {
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
                        formChangeHandler("zOSMF.applId", e.target.value, "zosmfApplId");
                        window.electron.ipcRenderer.setConfigByKeyAndValidate('zOSMF.applId', e.target.value).then((res: any) => {
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
    </div>
  );
};

export default Planning;

