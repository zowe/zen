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
import ContainerCard from '../common/ContainerCard';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Link, TextField, Typography } from "@mui/material";
import { setYaml, setNextStepEnabled, setLoading, selectYaml } from '../configuration-wizard/wizardSlice';
import { selectConnectionArgs, selectInitJobStatement, setJobStatementVal } from './connection/connectionSlice';
import { setPlanningStatus } from './progress/progressSlice';
import { setZoweVersion, setInstallationArgs, selectInstallationArgs } from './installation/installationSlice';
import { setJobStatementValid, setIsLocationValid, selectJobStatementValid } from "./PlanningSlice";
import { useAppDispatch, useAppSelector } from '../../hooks';
import { IResponse } from '../../../types/interfaces';
import { alertEmitter } from "../Header";
import { setActiveStep } from './progress/activeStepSlice'; // REVIEW: This part can be handled in wizardSlice, while connectionSlice/installationSlice/PlanningSlice could be unified in one storage entity
import { getStageDetails } from "../../../services/StageDetails";
import { getPlanningStageStatus, setPlanningValidationDetailsState, getPlanningValidationDetailsState, getInstallationTypeStatus } from "./progress/StageProgressStatus";
import { FALLBACK_YAML, isValidUSSPath } from "../common/Utils";

// TODO: Our current theoretical cap is 72 (possibly minus a couple for "\n", 70?) But we force more chars in InstallationHandler.tsx
// This is all I want to manually test for now. Future work can min/max this harder
const JCL_UNIX_SCRIPT_CHARS = 55;

// TODO: Planning stage has no schema validation. Current schema validation method relies on just existence of property (removed)

const Planning = () => {

  const stageLabel = 'Planning';
  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;

  const dispatch = useAppDispatch();

  const connectionArgs = useAppSelector(selectConnectionArgs);
  const localYaml = useAppSelector(selectYaml);
  const [step, setStep] = useState(0);

  const installationArgs = useAppSelector(selectInstallationArgs);
  const jobStatementValue = useAppSelector(selectInitJobStatement);
  
  // REVIEW: Instead of original redux + electron-store we use here component state (useState) + localStorage (getPlanningStageStatus) + redux (PlanningSlice) just as an intermediate storage + electron-store in some cases.
  const [locationsValidated, setLocationsValidated] = useState(getPlanningStageStatus()?.isLocationValid);
  const [validationDetails, setValidationDetails] = useState(getPlanningValidationDetailsState());
  const jobHeaderSaved = useAppSelector(selectJobStatementValid);
  
  const [showZosmfAttributes, setShowZosmfAttributes] = useState(true);
  const requiredSpace = 1300; //in megabytes

  useEffect(() => {
    if (!installationArgs.dryRunMode) { // REVIEW: Does dry run even makes sense in this step? What do we want to get as a result?
      // FIXME: getZoweVersion should be moved to InstallTypeSelection, makes no sense here anymore
      window.electron.ipcRenderer.getZoweVersion().then((res: IResponse) => dispatch(setZoweVersion(res.status ? res.details : '' )));
      // REVIEW: Installation args are split into multiple storage locations, we can remove parts that are in yaml now and then it can be merged with connection data, to have single session/instance/instalaltion storage.  
      dispatch(setInstallationArgs({...installationArgs, installationType: getInstallationTypeStatus()?.installationType, userUploadedPaxPath: getInstallationTypeStatus()?.userUploadedPaxPath}));
      dispatch(setJobStatementValid(getPlanningStageStatus()?.isJobStatementValid));
      window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
        if (res.status) {
          let yaml = res.details;
          // Pre-fill z/OSMF host with the host name we are connected to
          if (!yaml?.zOSMF?.host || yaml?.zOSMF?.host === FALLBACK_YAML.zOSMF.host) {
            yaml = updateAndReturnYaml('zOSMF.host', connectionArgs.host, yaml);
            window.electron.ipcRenderer.setConfigByKeyNoValidate('zOSMF.host', connectionArgs.host);
          } 
          dispatch(setYaml(yaml));
        }
      })
    }
    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, []); 
  
  useEffect(() => {
    dispatch(setNextStepEnabled(jobHeaderSaved && locationsValidated));
    dispatch(setPlanningStatus(jobHeaderSaved && locationsValidated));
    !jobHeaderSaved ? setStep(0) : setStep(1);
  }, [jobHeaderSaved, locationsValidated]);

  useEffect(() => {
    const nextPosition = document.getElementById(`position-${step}`);
    nextPosition.scrollIntoView({behavior: 'smooth'});
  }, [step]);

  const setLocValidations = (status: boolean): void => {
    setLocationsValidated(status);        // This sets component state and uses it for rendering.
    dispatch(setIsLocationValid(status)); // This is an odd usage of redux. It sets variable to the redux state but never uses it, doesn't even have a selector, instead, it obscurely sets it to the localStorage via setPlanningStageStatus for persistence;
  }

  const setValDetails = (details: any): void => { // Created a similar function for duplicated setting
    setValidationDetails(details);
    setPlanningValidationDetailsState(details);
  }

  const getENVVars = () => {
    return window.electron.ipcRenderer.getENVVars(connectionArgs).then((res: IResponse) => {
      if (res.status) {
        try {
          let updatedYaml = {...localYaml};
          const lines = res.details.split('\n').map((l: string) => l.trim()).filter((l: string) => !l.includes("echo"));
          lines.map((line: string) => {
            if (line.includes('java') && !localYaml?.java?.home) { 
              updatedYaml = updateAndReturnYaml('java.home', line, updatedYaml);
              window.electron.ipcRenderer.setConfigByKeyNoValidate('java.home',line)
            }
            if (line.includes('node') && !localYaml?.node?.home) {
              updatedYaml = updateAndReturnYaml('node.home', line, updatedYaml);
              window.electron.ipcRenderer.setConfigByKeyNoValidate('node.home',line)
            }
          });
          dispatch(setYaml(updatedYaml));
        } catch (error) {
          return {status: false, details: error.message}
        }
      }
      return res;
    });
  }

  const saveJobHeader = (e: any) => {
    e.preventDefault();
    alertEmitter.emit('hideAlert');
    dispatch(setLoading(true));

    if (!installationArgs.dryRunMode) {
      window.electron.ipcRenderer.saveJobHeader(jobStatementValue)
      .then(() => getENVVars())
      .then((res: IResponse) => {
        dispatch(setJobStatementValid(res.status));
        if (!res.status) { // Failure case
          console.warn('Failed to verify job statement', res.details);
          // TODO: This more detailed reason, for why Job submission failed, may be large and should be opened in an Editor
          alertEmitter.emit('showAlert', 'Failed to verify job statement ' + res.details, 'error');
        }
      })
      .catch((err: Error) => {
        console.warn(err);
        dispatch(setJobStatementValid(false));
        alertEmitter.emit('showAlert', err.message, 'error');
      })
      .finally(() => {
        dispatch(setLoading(false));
      });    
    } else {
      dispatch(setJobStatementValid(true));
      dispatch(setLoading(false));
    }
  }
    
  const validateLocations = (e: any) => {
    // REVIEW: Four storages are used for these values, i've removed a pile of setters from here, but it still should be done better.
    // On every form change we run formChangeHandler and setYaml to store config in the redux (1) for the UI - ok
    // Also we set electron-storage (2) (window.electron.ipcRenderer.setConfigByKeyNoValidate) for persistence, which may be a bit heavy, persistence data can be saved after successful validation here in validateLocations. 
    // And as the same time here we have some metadata storage like setValDetails, which use the component state (3) setValidationDetails and the localStorage (4) setPlanningValidationDetailsState(details) 

    e.preventDefault();
    alertEmitter.emit('hideAlert');
    setLocValidations(false);
    setValDetails({...validationDetails, error: ''});

    if (!localYaml?.java?.home || !localYaml?.node?.home || !localYaml?.zowe?.runtimeDirectory) {
      console.warn('Please fill in all values');
      alertEmitter.emit('showAlert', 'Please fill in all values', 'error');
      return;
    }
    let invalidUSSPath = '';
    if (localYaml?.zowe?.logDirectory && !isValidUSSPath(localYaml.zowe.logDirectory)) {
      invalidUSSPath = localYaml.zowe.logDirectory + " is not a valid z/OS Unix path"
    }
    if (localYaml?.zowe?.extensionDirectory && !isValidUSSPath(localYaml.zowe.extensionDirectory)) {
      invalidUSSPath = localYaml.zowe.extensionDirectory + " is not a valid z/OS Unix path"
    }
    if (localYaml?.zowe?.workspaceDirectory && !isValidUSSPath(localYaml.zowe.workspaceDirectory)) {
      invalidUSSPath = localYaml.zowe.workspaceDirectory + " is not a valid z/OS Unix path"
    }
    if (localYaml?.zowe?.runtimeDirectory && !isValidUSSPath(localYaml.zowe.runtimeDirectory)) {
      invalidUSSPath = localYaml.zowe.runtimeDirectory + " is not a valid z/OS Unix path"
    }
    if (invalidUSSPath) {
      alertEmitter.emit('showAlert', invalidUSSPath, 'error');
      return;
    }

    dispatch(setLoading(true));

    // TODO: Possible feature for future: add to checkDir to see if existing Zowe install exists.
    // Then give the user ability to use existing zowe.yaml to auto-fill in fields from Wizard
    if (!installationArgs.dryRunMode) {

      Promise.all([
        window.electron.ipcRenderer.checkJava(connectionArgs, localYaml?.java?.home),
        window.electron.ipcRenderer.checkNode(connectionArgs, localYaml?.node?.home),
        window.electron.ipcRenderer.checkDirOrCreate(connectionArgs, localYaml?.zowe?.runtimeDirectory),
        window.electron.ipcRenderer.checkSpaceAndCreateDir(connectionArgs, localYaml?.zowe?.runtimeDirectory),
      ]).then((res: Array<IResponse>) => {
        const details = {javaVersion: '', nodeVersion: '', spaceAvailableMb: '', error: ''};
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
        if (res[2] && res[2].status == false) { // Checking run-time directory existence or creating it failed?
          details.error = details.error + res[2].details;
          console.warn(res[2].details);
        }
        // Do not check space because space on ZFS is dynamic. you can have more space than USS thinks. 
        // REVIEW: We still can check it and show notification but allow to continue with the installation. However the requirement is different for conv / SMPE / PSWI so this logic should be moved to the next step.
        try {
          const dfOut: string = res[3].details.split('\n').filter((i: string) => i.trim().startsWith(localYaml?.zowe?.runtimeDirectory.slice(0, 3)))[0];
          details.spaceAvailableMb = dfOut.match(/\d+\/\d+/g)[0].split('/')[0];
          if (parseInt(details.spaceAvailableMb, 10) < requiredSpace) { 
            alertEmitter.emit('showAlert', `Can't validate available space, please make sure you have enough free space in ${localYaml?.zowe?.runtimeDirectory}`, 'info');
            // details.error = details.error + `Not enough space, you need at least ${requiredSpace}MB; `;
          }
        } catch (error) {
          // details.error = details.error + `Can't check space available; `;
          alertEmitter.emit('showAlert', `Can't check space available: ${error}`, 'warning');
          console.warn(res[3].details);
        }
        setValDetails(details);
        dispatch(setLoading(false));
        if (!details.error) {
          setLocValidations(true);
          // FIXME: Back port values from localYaml to installationArgs, remove later together with dependencies in actions, use single source of data for each value.
          dispatch(setInstallationArgs({...installationArgs, installationDir: localYaml?.zowe?.runtimeDirectory, zosmfApplId: localYaml?.zOSMF?.applId, zosmfPort: localYaml?.zOSMF?.port, zosmfHost: localYaml?.zOSMF?.host,
            nodeHome: localYaml?.node?.home, javaHome: localYaml?.java?.home, extensionDir: localYaml?.zowe?.extensionDirectory, logDir: localYaml?.zowe?.logDirectory, workspaceDir: localYaml?.zowe?.workspaceDirectory 
          }));
        } else {
          alertEmitter.emit('showAlert', details.error, 'error');
        }
      })
    }
    else {
      setLocValidations(true);
      dispatch(setLoading(false));
    }
  }
        
  const onJobStatementChange = (newJobStatement: string) => {
    alertEmitter.emit('hideAlert');
    dispatch(setJobStatementValid(false));
    dispatch(setJobStatementVal(newJobStatement));
  }
        
  const formChangeHandler = (key?: string, value?: (string | number)) => {
    alertEmitter.emit('hideAlert');
    setLocValidations(false);
    setValDetails({...validationDetails, javaVersion: '', nodeVersion: '', spaceAvailableMb: ''});

    if (!key || !value) {
      return; // REVIEW: This just does not allow to remove the last symbol in the input field which is odd, UI should handle that with red frame around the input or something similar.
    }
    dispatch(setYaml(updateAndReturnYaml(key, value)));
  }

  const updateAndReturnYaml = (key: string, value: string | number, yaml?: any) => {
    // REVIEW: Works for single element, but if you want to update several values in one function then the new yaml will not be dispatched yet and so the next value will overwrite the previous one.
    // This either should be able to handle a set of values as input, or be able to work with modified yaml instead of localYaml. BTW so many names for yaml are confusing.
    const keys = key.split('.');
    let updatedYaml = !!yaml ? {...yaml} : { ...localYaml };

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
      <Box id="conatiner-box-id" sx={{height: step === 0 ? 'calc(100vh - 200px)' : 'auto'}}>
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
        {`Wizard will run installation (zwe install) and initialization (zwe init) commands on the mainframe by submitting jobs through the FTP connection. 
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
            onChange={(e) => onJobStatementChange(e.target.value)}
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
          <Typography id="position-1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }} color="text.secondary">       
            {`Now let's define some properties like z/OS Unix locations, identifiers, and (optionally) z/OSMF details.`}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '36px' }}>
          <div style={{ flex: 1 }}>
          <FormControl>
            { !!validationDetails.spaceAvailableMb && <div style={{marginLeft: '-40px'}} title={`Detected available space: ${validationDetails.spaceAvailableMb} MB`}>
              <CheckCircle sx={{ color: `${parseInt(validationDetails.spaceAvailableMb, 10) > requiredSpace ? 'green' : '#eab240'}`, fontSize: '1rem', margin: '0 12px' }} />
            </div> }
            <div>
              <TextField
                id="installation-input"
                required
                style={{marginLeft: 0}}
                label="Run-time Directory (or installation location)"
                variant="standard"
                value={localYaml?.zowe?.runtimeDirectory || ''}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  formChangeHandler("zowe.runtimeDirectory", e.target.value);
                  if(localYaml){
                    window.electron.ipcRenderer.setConfigByKeyNoValidate('zowe.runtimeDirectory', e.target.value).then((res: any) => {
                      // console.log('updated zowe.runtimeDirectory')
                    })
                  }
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
                value={localYaml?.zowe?.workspaceDirectory || FALLBACK_YAML.zowe.workspaceDirectory}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  formChangeHandler("zowe.workspaceDirectory", e.target.value);
                  if(localYaml){
                    window.electron.ipcRenderer.setConfigByKeyNoValidate('zowe.workspaceDirectory', e.target.value).then((res: any) => {
                      // console.log('updated zowe.workspaceDirectory')
                    })
                  }
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
                value={localYaml?.zowe?.logDirectory || FALLBACK_YAML.zowe.logDirectory}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  formChangeHandler("zowe.logDirectory", e.target.value);
                  if(localYaml){
                    window.electron.ipcRenderer.setConfigByKeyNoValidate('zowe.logDirectory', e.target.value).then((res: any) => {
                      // console.log('updated zowe.logDirectory')
                    })
                  }
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Read and writeable z/OS Unix location for Zowe's logs.</p>
            </div>
          </FormControl>
          </div>
          <div style={{ flex: 1 }}>
          <FormControl>
            <div>
              <TextField
                id="extension-input"
                required
                style={{marginLeft: 0}}
                label="Extensions Directory"
                variant="standard"
                value={localYaml?.zowe?.extensionDirectory || FALLBACK_YAML.zowe.extensionDirectory}
                inputProps={{ maxLength: JCL_UNIX_SCRIPT_CHARS }}
                onChange={(e) => {
                  formChangeHandler("zowe.extensionDirectory", e.target.value);
                  if(localYaml){
                    window.electron.ipcRenderer.setConfigByKeyNoValidate('zowe.extensionDirectory', e.target.value).then((res: any) => {
                      // console.log('updated zowe.extensionDirectory')
                    })
                  }
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Read and writeable z/OS Unix location to contain Zowe's extensions.</p>
            </div>
          </FormControl>
          <FormControl>
          { !!validationDetails.javaVersion && <div style={{marginLeft: '-40px'}} title={`Java version: ${validationDetails.javaVersion}`}>
              <CheckCircle sx={{ color: 'green', fontSize: '1rem', margin: '0 12px' }} />
            </div> }
            <div>
              <TextField
                id="java-home-input"
                required
                style={{marginLeft: 0}}
                label="Java Home Directory"
                variant="standard"
                value={localYaml?.java?.home || ''}
                onChange={(e) => {
                  formChangeHandler("java.home", e.target.value);
                  if(localYaml){
                    window.electron.ipcRenderer.setConfigByKeyNoValidate('java.home', e.target.value).then((res: any) => {
                      // console.log('updated zowe.java.home')
                    })
                  }
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>The z/OS Unix home directory for Java (JAVA_HOME).</p>
            </div>
          </FormControl>
          <FormControl>
            { !!validationDetails.nodeVersion && <div style={{marginLeft: '-40px'}} title={`Node version: ${validationDetails.nodeVersion}`}>
              <CheckCircle sx={{ color: 'green', fontSize: '1rem', margin: '0 12px' }} />
            </div> }
            <div>
              <TextField
                id="node-home-input"
                required
                style={{marginLeft: 0}}
                label="Node.js Home Directory"
                variant="standard"
                value={localYaml?.node?.home || ''}
                onChange={(e) => {
                  formChangeHandler("node.home", e.target.value);
                  if(localYaml){
                    window.electron.ipcRenderer.setConfigByKeyNoValidate('node.home', e.target.value).then((res: any) => {
                      // console.log('updated zowe.node.home')
                    })
                  }
                }}
              />
              <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>The z/OS Unix home directory for Node.js (NODE_HOME).</p>
            </div>
          </FormControl>
          </div>
          </div>
          <FormControlLabel
            control={
              <Checkbox // TODO: Add z/OSMF off support
                checked={true}
                disabled={true}
                title="Disabling the z/OSMF support is not implemented"
                onChange={(e) => {
                  // setShowZosmfAttributes(true);
                  // formChangeHandler();
                }}
              />
            }
            label="Set z/OSMF Attributes (Recommended)"
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
                      value={localYaml?.zOSMF?.host || FALLBACK_YAML.zOSMF.host}
                      onChange={(e) => {
                        formChangeHandler("zOSMF.host", e.target.value);
                        if(localYaml){
                          window.electron.ipcRenderer.setConfigByKeyNoValidate('zOSMF.host', e.target.value).then((res: any) => {
                            // console.log('updated zowe.zOSMF.host')
                          })
                        }
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
                      value={localYaml?.zOSMF?.port || FALLBACK_YAML.zOSMF.port}
                      onChange={(e) => {
                        formChangeHandler("zOSMF.port", Number(e.target.value));
                        if(localYaml){
                          window.electron.ipcRenderer.setConfigByKeyNoValidate('zOSMF.port', Number(e.target.value)).then((res: any) => {
                            // console.log('updated zowe.zOSMF.port')
                          })
                        }
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
                      value={localYaml?.zOSMF?.applId || FALLBACK_YAML.zOSMF.applId}
                      onChange={(e) => {
                        formChangeHandler("zOSMF.applId", e.target.value);
                        if(localYaml){
                          window.electron.ipcRenderer.setConfigByKeyNoValidate('zOSMF.applId', e.target.value).then((res: any) => {
                            // console.log('updated zowe.zOSMF.applId')
                          })
                        }
                      }}
                    />
                    <p style={{ marginTop: '5px', marginBottom: '0', fontSize: 'smaller', color: 'grey' }}>Application ID of your z/OSMF instance.</p>
                  </div>
                </FormControl>
              </div>
            </div>
          )}
          <FormControl sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Button sx={{boxShadow: 'none'}} type={step === 1 ? "submit" : "button"} variant="text" onClick={e => validateLocations(e)}>Validate locations</Button>
            {locationsValidated ? <CheckCircle sx={{ color: 'green', fontSize: '1rem' }} /> : validationDetails.error ? null: null}
          </FormControl>
        </Box>
        : <div/> }
      {/* TODO: Add a checklist of components / settings user want to use, filter further steps accordingly */}
    </ContainerCard>
    </React.Fragment>
    </div>
  );
};

export default Planning;

