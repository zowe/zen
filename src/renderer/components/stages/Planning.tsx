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
import { Checkbox, FormControlLabel } from "@mui/material";
import { setYaml, setNextStepEnabled, setLoading, selectYaml } from '../configuration-wizard/wizardSlice';
import { selectConnectionArgs, selectInitJobStatement, setJobStatementVal } from './connection/connectionSlice'; // looks like job statement does not belong to the connection store, or it is, it used for running commands on mf
import { setPlanningStatus } from './progress/progressSlice';
import { setInstallationArgs, selectInstallationArgs } from './installation/installationSlice'; // locations go there
import { setJobStatementValid, setIsLocationValid } from "./PlanningSlice"; // and here, locations and job statement, checks should go th the progress store
import { useAppDispatch, useAppSelector } from '../../hooks';
import { IResponse } from '../../../types/interfaces';
import { alertEmitter } from "../Header";
import { setActiveStep } from './progress/activeStepSlice'; // This part can be handled in wizardSlice
import { getStageDetails } from "../../../services/StageDetails";
import { getProgress, getPlanningStageStatus, setPlanningValidationDetailsState, getPlanningValidationDetailsState, getInstallationTypeStatus } from "./progress/StageProgressStatus"; // localStorage
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

  // REVIEW: Instead of redux + electron-store we use here state + local storage + ?
  const [jobHeaderSaved, setJobHeaderSaved] = useState(getPlanningStageStatus()?.isJobStatementValid);
  const jobStatementValue = useAppSelector(selectInitJobStatement);

  const [locationsValidated, setLocationsValidated] = useState(getPlanningStageStatus()?.isLocationValid);
  const [validationDetails, setValidationDetails] = useState(getPlanningValidationDetailsState());
  
  const [showZosmfAttributes, setShowZosmfAttributes] = useState(true);

  const installationArgs = useAppSelector(selectInstallationArgs);
  const requiredSpace = 1300; //in megabytes

  useEffect(() => {
    // const nextPosition = document.getElementById('container-box-id');   // REVIEW: Can't recall why we have this
    // nextPosition.scrollIntoView({behavior: 'smooth', block: 'start'});
    // setPlanningState(getProgress('planningStatus'));
    // FIXME: Add a popup warning in case failed to get config files
    // FIXME: Save yaml and schema on disk to not to pull it each time?
    // REVIEW: Replace JobStatement text area with set of text fields?

    if (jobHeaderSaved) {
      locationsValidated ? setStep(2) : setStep(1);
    }

    // dispatch(setJobStatementVal(jobStatementValue)); // REVIEW: Storage duplication

    if (!installationArgs.dryRunMode) { // REVIEW: Does dry run even makes sense in this step? What do we want to get as a result? If it is a dry run mode we do nothing? 
      window.electron.ipcRenderer.getConfigByKey("installationArgs").then((res: IResponse) => {
        if (res != undefined) {
          dispatch(setInstallationArgs(res));
        }
      })

      window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
        if (res.status) {
          dispatch(setYaml(res.details));
          dispatch(setInstallationArgs({...installationArgs, installationType: getInstallationTypeStatus()?.installationType, userUploadedPaxPath: getInstallationTypeStatus()?.userUploadedPaxPath}));
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
  }, [jobHeaderSaved, locationsValidated]);

  useEffect(() => {
    const nextPosition = document.getElementById(`position-${step}`);
    nextPosition.scrollIntoView({behavior: 'smooth'});
  }, [step]);

  const setLocValidations = (status: boolean): void => {
    setLocationsValidated(status); // REVIEW: Storage duplication
    dispatch(setIsLocationValid(status));
  }

  const getENVVars = () => {
    return window.electron.ipcRenderer.getENVVars(connectionArgs).then((res: IResponse) => {
      if (res.status) {
        try {
          const lines = res.details.split('\n').map((l: string) => l.trim()).filter((l: string) => !l.includes("echo"));
          lines.map((line: string) => {
            if (line.includes('node') && !localYaml?.node?.home) dispatch(setYaml(updateAndReturnYaml('node.home', line)));
            if (line.includes('java') && !localYaml?.java?.home) dispatch(setYaml(updateAndReturnYaml('java.home', line)));
          });
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
      window.electron.ipcRenderer.saveJobHeader(jobStatementValue)  // Saves to the connection store, ok
      .then(() => getENVVars())
      .then((res: IResponse) => {
        if (!res.status) { // Failure case
          dispatch(setJobStatementValid(false));
          console.warn('Failed to verify job statement', res.details);
          // TODO: This more detailed reason, for why Job submission failed, may be large and should be opened in an Editor
          // dispatch(setJobStatementValidMsg(res.details)); 
          alertEmitter.emit('showAlert', 'Failed to verify job statement ' + res.details, 'error');
        } else { // Success JCL case
          dispatch(setJobStatementValid(true));
          if(locationsValidated) {
            // setPlanningState(true);
            setStep(2);
          } else if (step < 1) {
            setStep(1);
          }
        }
        setJobHeaderSaved(res.status);
        dispatch(setLoading(false));
      })
      .catch((err: Error) => {
        console.warn(err);
        dispatch(setJobStatementValid(false));
        alertEmitter.emit('showAlert', err.message, 'error');
        dispatch(setLoading(false));
      });    
    } else {
      if (locationsValidated) {
        // setPlanningState(true);
        setStep(2);
      } else if (step < 1) {
        setStep(1);
      }
      setJobHeaderSaved(true);
      dispatch(setJobStatementValid(true));
      dispatch(setLoading(false));
    }
  }
    
  const validateLocations = (e: any) => {
    e.preventDefault();
    alertEmitter.emit('hideAlert');
    // setPlanningState(false);
    setLocValidations(false);
    setValidationDetails({...validationDetails, error: ''});

    if (!localYaml?.java?.home || !localYaml?.node?.home || !localYaml?.zowe?.runtimeDirectory) {
      console.warn('Please fill in all values');
      alertEmitter.emit('showAlert', 'Please fill in all values', 'error');
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
      ]).then((res: Array<IResponse>) => {
      const details = {javaVersion: '', nodeVersion: '', spaceAvailableMb: '', error: ''};

      if (localYaml?.zowe?.logDirectory && !isValidUSSPath(localYaml.zowe.logDirectory)) {
        details.error = localYaml.zowe.logDirectory + " is not a valid z/OS Unix path"
      }
      if (localYaml?.zowe?.extensionDirectory && !isValidUSSPath(localYaml.zowe.extensionDirectory)) {
        details.error = localYaml.zowe.extensionDirectory + " is not a valid z/OS Unix path"
      }
      if (localYaml?.zowe?.workspaceDirectory && !isValidUSSPath(localYaml.zowe.workspaceDirectory)) {
        details.error = localYaml.zowe.logDirectory + " is not a valid z/OS Unix path"
      }
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
      //Do not check space because space on ZFS is dynamic. you can have more space than USS thinks. // REVIEW: Still can check and show notification instead of error
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
      setValidationDetails(details); // REVIEW: Three times?
      setPlanningValidationDetailsState(details);
      // dispatch(setLocationValidationDetails(details)); 
      dispatch(setLoading(false));
      if (!details.error) {
        setLocValidations(true);
        setStep(2);
      } else {
        dispatch(setLoading(false));
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
    setJobHeaderSaved(false);
    dispatch(setJobStatementVal(newJobStatement));
    // setJobStatementValidation(false);
    dispatch(setJobStatementValid(false));
    // setPlanningState(false);
    setStep(0);
  }
        
  const formChangeHandler = (key?: string, value?: (string | number), installationArg?: string) => {
    setLocationsValidated(false);
    // setIsLocationsUpdated(true);
    // setPlanningStatus(false);  // There even a typo in function name because it is a duplicate,  setPlanningStatus should be dispatched, while setPlanningState is a local function
    // dispatch(setPlanningStatus(false));
    // dispatch(setNextStepEnabled(false)); // This is controlled by setPlanningState together with setPlanningStatus and it is duplicated by separate fuction probably because three lines above we have a typo
                                         // So all of this should be controlled by setPlanningState, but it is controlled by two validations itself
    setStep(1);

    if (!key || !value) {
      return;
    }

    // REVIEW should not be handled anymore, just use vars from yaml
    // if(installationArg) {
    //   const newInstallationArgs = { ...installationArgs, [installationArg]: value };
    //   dispatch(setInstallationArgs(newInstallationArgs));
    //   window.electron.ipcRenderer.setConfigByKeyNoValidate("installationArgs", newInstallationArgs);
    // }

    const updatedYaml: any = updateAndReturnYaml(key, value)

    dispatch(setYaml(updatedYaml));
  }

  const updateAndReturnYaml = (key: string, value: string | number) => {
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
            onChange={(e) => {dispatch(setJobStatementVal(e.target.value)); onJobStatementChange(e.target.value)}}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '32px' }}>
          <div style={{ flex: 1 }}>
          <FormControl>
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
                onChange={(e) => {
                  setShowZosmfAttributes(true);
                  formChangeHandler();
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

