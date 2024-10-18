/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState, useEffect, useRef } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, FormControlLabel, IconButton, SvgIcon, SvgIconProps, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, setNextStepEnabled, setYaml, selectSchema } from '../configuration-wizard/wizardSlice';
import ContainerCard from '../common/ContainerCard';
import EditorDialog from "../common/EditorDialog";
import { createTheme } from '@mui/material/styles';
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { stages } from "../configuration-wizard/Wizard";
import { selectInitializationStatus, setInitializationStatus, setNetworkingStatus } from "./progress/progressSlice";
import { setActiveStep } from "./progress/activeStepSlice";
import { TYPE_YAML, TYPE_JCL, TYPE_OUTPUT, ajv } from "../common/Utils";
import { IResponse } from "../../../types/interfaces";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { getInstallationArguments, getProgress, isInitializationStageComplete, updateSubStepSkipStatus } from "./progress/StageProgressStatus";
import { alertEmitter } from "../Header";
import JsonForm from '../common/JsonForms';

// TODO: Fix the schema usage, remove schema validation as useless
//        Add helper text describing ports usage, and important details
//        Hide components under collapsible customize panel
//        Validate that ports are unique between components

function AddIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
    </SvgIcon>
  );
}

function DeleteIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
    </SvgIcon>
  );
}

const Networking = () => {

  const theme = createTheme();

  const stageLabel = 'Initialization';
  const subStageLabel = 'Networking';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;
  const SUB_STAGE_ID = SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0;

  const dispatch = useAppDispatch();
  const yaml = useAppSelector(selectYaml);
  const schema = useAppSelector(selectSchema);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');

  const installationArgs = getInstallationArguments();
  const connectionArgs = useAppSelector(selectConnectionArgs);
  // const validate = ajv.getSchema("https://zowe.org/schemas/v2/server-base") || ajv.compile(customSchema); // REVIEW: What is returned by getSchema, do we need ajv? maybe only once on customSchema retrieving.
  const LOOP_LIMIT = 1024;

  // const [stateUpdated, setStateUpdated] = useState(false);
  const [stageStatus, setStageStatus] = useState(stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped);
  const stageStatusRef = useRef(stageStatus);

  // const isInitializationSkipped = !useAppSelector(selectInitializationStatus);

  useEffect(() => {
    stageStatusRef.current = stageStatus; // REVIEW: What it does?
  }, [stageStatus]);

  useEffect(() => {
    // const nextPosition = document.getElementById('container-box-id');
    // if(nextPosition) nextPosition.scrollIntoView({behavior: 'smooth'});
    if (yaml.zowe.externalDomains?.length === 1 && yaml.zowe.externalDomains[0] === 'sample-domain.com') {
      dispatch(setYaml({...yaml, zowe: {...yaml.zowe, externalDomains: [connectionArgs.host]}}));
    }
    dispatch(setNextStepEnabled(getProgress('networkingStatus')));
    dispatch(setInitializationStatus(isInitializationStageComplete()));

    return () => {
      updateSubStepSkipStatus(SUB_STAGE_ID, stageStatusRef.current);
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  const setStageSkipStatus = (status: boolean) => {
    stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = status;
    stages[STAGE_ID].isSkipped = !isInitializationStageComplete();
    setStageStatus(status);
  }

  const updateProgress = (status: boolean) => {
    // setStateUpdated(!setStateUpdated);
    dispatch(setNetworkingStatus(status));
    dispatch(setNextStepEnabled(status));
    setStageSkipStatus(!status);
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    dispatch(setYaml(data));
  }
  
  // const handleFormChange = async (data: any, isYamlUpdated?: boolean) => {
  //   if(validate) {
  //     validate(data);
  //     if(validate.errors) {
  //       const errPath = validate.errors[0].schemaPath;
  //       const errMsg = validate.errors[0].message;
  //       setStageConfig(false, errPath+' '+errMsg, data.zowe);

  //     }
  //   }
  //   let newYaml;
  //   if (data.zowe && data.zowe.externalDomains && data.zowe.externalPort) {
  //     newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: data.zowe.externalDomains, externalPort: data.zowe.externalPort}};
  //   }
  //   if(data.components){
  //     newYaml = {...newYaml, components: data.components};
  //   }
  //   window.electron.ipcRenderer.setConfig(newYaml)
  //   setStageConfig(true, '', newYaml);
  // };

  const onSaveYaml = (e: any) => {
    e.preventDefault();
    updateProgress(false);
    alertEmitter.emit('showAlert', 'Uploading yaml...', 'info');
    if(!installationArgs.dryRunMode){
      window.electron.ipcRenderer.uploadLatestYaml(connectionArgs, installationArgs).then((res: IResponse) => {
        if(res && res.status) {
          updateProgress(true);
          alertEmitter.emit('showAlert', res.details, 'success');
        } else {
          updateProgress(false);
          alertEmitter.emit('showAlert', res.details, 'error');
        }
        dispatch(setInitializationStatus(isInitializationStageComplete()));
      });
    }
    else{
      alertEmitter.emit('showAlert', 'Successfully uploaded yaml config');
      updateProgress(true);
      dispatch(setInitializationStatus(isInitializationStageComplete()));
    }
  }
  // console.log(JSON.stringify(schema));
  return (
    yaml && schema && <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button key="yaml" variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        {/* <Button key="jcl" variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button> */}
        <Button key="job" variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Networking" description="Zowe networking configurations."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={(data: any) => {
          let newYaml;
          if (data.zowe && data.zowe.externalDomains && data.zowe.externalPort) {
            newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: data.zowe.externalDomains, externalPort: data.zowe.externalPort}};
          }
          if(data.components){
            newYaml = {...newYaml, components: data.components};
          }
          setStageConfig(true, '', newYaml);
        }}/>}
        <Box sx={{ width: '60vw' }} 
            //  onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details ?? yaml))} // REVIEW: Why?
        >
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          {/* REVIEW: button as child of <p> */}
          <p key="external-domains" style={{fontSize: "20px"}}>
            External Domains 
            <IconButton 
              sx={{ml: '16px'}}
              size='small' 
              onClick={(e) => {
                let domains = [...yaml.zowe?.externalDomains || [], ""];
                const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: domains}};
                window.electron.ipcRenderer.setConfig(newYaml )
                dispatch(setYaml(newYaml));
                dispatch(setNetworkingStatus(false));
            }}>
              <AddIcon />
            </IconButton>
          </p>
          {yaml.zowe.externalDomains != undefined && yaml.zowe.externalDomains.map((domain: string, index: number) => <Box key={`box-${index}`} sx={{display: "flex", flexDirection: "row"}}><TextField
            variant="standard"
            value={domain}
            onChange={async (e) => {
              let domains = [...yaml.zowe?.externalDomains];
              domains[index] = e.target.value;
              const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: domains}};
              // console.log(domains);
              window.electron.ipcRenderer.setConfig(newYaml )
              dispatch(setYaml(newYaml));
              dispatch(setNetworkingStatus(false));
            }}
          />
          {yaml.zowe?.externalDomains.length > 1 && <IconButton 
            sx={{ml: '16px'}}
            size='small'
            onClick={(e) => {
              let domains = [...yaml.zowe?.externalDomains];
              domains.splice(index, 1);
              const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: domains}};
              window.electron.ipcRenderer.setConfig(newYaml )
              dispatch(setYaml(newYaml))
              dispatch(setNetworkingStatus(false));
            }}>
            <DeleteIcon/>
          </IconButton>}
          </Box>)}
          <br />
          <TextField
            label={"External Port"}
            variant="standard"
            type="number"
            helperText={schema.properties.zowe.properties.externalPort.description}
            value={yaml.zowe.externalPort}
            onChange={async (e) => {
              const newYaml = {...yaml, zowe: {...yaml.zowe, externalPort: Number(e.target.value)}};
              window.electron.ipcRenderer.setConfig(newYaml)
              dispatch(setYaml(newYaml));
              // // props.setYaml(newYaml);
              // await window.electron.ipcRenderer.setConfigByKeyAndValidate(`${keys[i]}.${toMatch[k]}.${matchedProps[l]}`, Number(e.target.value))
              // // dispatch(setYaml(newYaml));
            }}
          />
          <Accordion sx={{mt: '24px'}}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="components-content"
              id="components-header"
            >
              <Typography>Components</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {Object.keys(yaml.components).filter(component => yaml.components[component].hasOwnProperty('port')).map(component => { // yaml.components[component].hasOwnProperty('enabled') && 
                return <div key={`div-${component}`} style={{display: 'flex', alignItems: 'center'}}> 
                  <FormControlLabel
                    sx={{width: '200px'}}
                    label={component}
                    key={`toggle-${component}`}
                    control={<Checkbox checked={yaml.components[component].enabled} onChange={async (e) => {
                      const newYaml = {...yaml, components: {...yaml.components, [component]: {...yaml.components[component], enabled: !yaml.components[component].enabled}}};
                      console.log(JSON.stringify(newYaml))
                      await window.electron.ipcRenderer.setConfigByKeyAndValidate(`components.${component}.enabled`, !yaml.components[component].enabled);
                      dispatch(setYaml(newYaml));
                      dispatch(setNetworkingStatus(false));
                    }}/>}
                  />
                  <TextField
                    // label="Port"
                    // error={!yaml.components[component].port || yaml.components[component].port > 65535}
                    variant="standard"
                    size="small"
                    required={yaml.components[component].enabled}
                    type="number"
                    key={`port-input-${component}`}
                    value={yaml.components[component].port}
                    InputProps={{
                        style: {minWidth: '100px', width: '100px'}
                    }}
                    onChange={async (e) => {
                      if (!Number.isNaN(Number(e.target.value))) { // REVIEW: Use schema for validation
                        const newYaml = {...yaml, components: {...yaml.components, [component]: {...yaml.components[component], port: Number(e.target.value)}}};
                        await window.electron.ipcRenderer.setConfigByKeyAndValidate(`components.${component}.port`, Number(e.target.value))
                        dispatch(setYaml(newYaml));
                        dispatch(setNetworkingStatus(false));
                      }
                    }}
                  />
                </div>
              })}
            </AccordionDetails>
          </Accordion>
          <JsonForm schema={schema.properties.zowe.properties.network} onChange={(wut: any) => {console.log(wut)}} formData={yaml.zowe.network}/>
          <Button id="reinstall-button" sx={{boxShadow: 'none', mr: '12px', mt: '24px'}} type="submit" variant="text" onClick={e => onSaveYaml(e)}>{'Save YAML to z/OS'}</Button>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Networking;