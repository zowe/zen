/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState, useEffect, useRef, Fragment } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material';
import { ExpandMore, Add, DeleteForever} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, setNextStepEnabled, setYaml, selectSchema } from '../configuration-wizard/wizardSlice';
import ContainerCard from '../common/ContainerCard';
import EditorDialog from "../common/EditorDialog";
import { createTheme } from '@mui/material/styles';
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { stages } from "../configuration-wizard/Wizard";
import { setInitializationStatus, setNetworkingStatus } from "./progress/progressSlice";
import { setActiveStep } from "./progress/activeStepSlice";
import { TYPE_YAML, TYPE_OUTPUT } from "../common/Utils";
import { IResponse } from "../../../types/interfaces";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { getInstallationArguments, getProgress, isInitializationStageComplete, updateSubStepSkipStatus } from "./progress/StageProgressStatus";
import { alertEmitter } from "../Header";
import JsonForm from '../common/JsonForms';

// FIXME: Hardcoded altered network schema for render purpose as JsonForms can't work with complete schema syntax like ("attls": {"const": true, ...})
const networkSchema = {
  "type": "object",
  "additionalProperties": false,
  "description": "Optional, advanced network configuration parameters",
  "properties": {
    "server": {
      "type": "object",
      "description": "Optional, advanced network configuration parameters for Zowe servers",
      "properties": {
        "tls": {
          "type": "object",
          "additionalProperties": false,
          "required": ["maxTls", "minTls"],
          "properties": {
            "attls": {
              "description": "Enables AT-TLS for server operations. AT-TLS should only be enabled in a z/OS host environment. Servers will be switched into HTTP mode to accomodate z/OS the specific AT-TLS feature which wraps network calls in TLS.",
              "type": "boolean",
              "default": false
            },
            "maxTls": {
                "type": "string",
                "enum": [
                    "TLSv1.2",
                    "TLSv1.3"
                ],
                "default": "TLSv1.3",
                "description": "Maximum TLS version allowed for network connections if AT-TLS is not used"
            },
            "minTls": {
                "type": "string",
                "enum": [
                    "TLSv1.2",
                    "TLSv1.3"
                ],
                "default": "TLSv1.2",
                "description": "Minimum TLS version allowed for network connections if AT-TLS is not used, and less than or equal to network.maxTls."
            }            
          }
        }
      }
    },
    "client": {
      "type": "object",
      "additionalProperties": false,
      "description": "Optional, advanced network configuration parameters for Zowe servers when sending requests as clients.",
      "properties": {
        "tls": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "attls": {
              "description": "Enables AT-TLS for client operations. AT-TLS should only be enabled in a z/OS host environment. Servers will be switched into HTTP mode to accomodate z/OS the specific AT-TLS feature which wraps network calls in TLS.",
              "type": "boolean",
              "default": false
            }
          }
        }
      }
    }
  }
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
  // const validate = ajv.compile(schema); // REVIEW: Does not work with current schema. "reference "https://zowe.org/schemas/v2/server-base#zowePath" resolves to more than one schema"

  const [stageStatus, setStageStatus] = useState(stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped);
  const stageStatusRef = useRef(stageStatus);

  // const isInitializationSkipped = !useAppSelector(selectInitializationStatus); // Not used

  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);

  useEffect(() => {
    const nextPosition = document.getElementById('container-box-id');
    if(nextPosition) nextPosition.scrollIntoView({behavior: 'smooth'});
    if (yaml.zowe?.externalDomains?.length === 1 && yaml.zowe.externalDomains[0] === 'sample-domain.com') {
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

  const handleFormChange = async (data: any) => {
    window.electron.ipcRenderer.setConfig(data)
    dispatch(setYaml(data));
    dispatch(setNetworkingStatus(false));
  };

  const handleNetworkTLSChange = async (data: any, section: string) => {
    const newYaml = {...yaml, zowe: {...yaml.zowe, network: {...yaml.zowe.network, [section]: {...yaml.zowe.network[section], tls: data}}}};
    handleFormChange(newYaml);
  }

  const onSaveYaml = (e: any) => {
    e.preventDefault();
    updateProgress(false);

    // Check for duplicated ports in components
    const ports = Object.keys(yaml.components)
      .filter((c: any) => yaml.components[c].enabled && yaml.components[c].port)
      .map(c => Number(yaml.components[c].port));
    const duplicatedPorts = ports.filter((p, ind) => ports.indexOf(p) !== ind);
    if (duplicatedPorts.length) {
      alertEmitter.emit('showAlert', `Port ${duplicatedPorts[0]} is assigned to a multiple enabled components`, 'error');
      return;
    }

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
          if(data.zowe && data.zowe.network){
            newYaml = {...yaml, zowe: {...yaml.zowe, network: data.zowe.network}};
          }
          setStageConfig(true, '', newYaml);
        }}/>}
        <Box sx={{ width: '60vw' }} 
            //  onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details ?? yaml))} // REVIEW: Why?
        >
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <Typography variant="h6">External Domains</Typography>
          <Typography variant="caption" sx={{opacity: '0.8'}}>You can list your external domains on how you want to access Zowe.<br></br>
          This should be the domain list you would like to put into your web browser's address bar. </Typography>
          {Array.isArray(yaml.zowe?.externalDomains) && yaml.zowe.externalDomains.map((domain: string, index: number) => <Box key={`box-${index}`} sx={{display: "flex", flexDirection: "row", mt: '6px'}}>
            <TextField
              variant="standard"
              value={domain}
              onChange={async (e) => {
                const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: yaml.zowe.externalDomains.with(index, e.target.value)}};
                handleFormChange(newYaml);
              }}
            />
            <IconButton 
              sx={{ml: '16px'}}
              size='small' 
              onClick={() => {
                const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: [...yaml.zowe.externalDomains, ""]}};
                handleFormChange(newYaml);
            }}>
              <Add/>
            </IconButton>
            {yaml.zowe?.externalDomains.length > 1 && <IconButton 
              sx={{ml: '8px'}}
              size='small'
              onClick={() => {
                const domains = [...yaml.zowe.externalDomains.slice(0, index), ...yaml.zowe.externalDomains.slice(index + 1)];
                const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: domains}};
                handleFormChange(newYaml);
              }}>
              <DeleteForever/>
            </IconButton>}
          </Box>)}
          <br />
          <TextField
            label={"External Port"}
            variant="standard"
            type="number"
            sx={{mb: '24px'}}
            helperText={schema.properties.zowe.properties.externalPort.description}
            value={yaml.zowe.externalPort}
            onChange={async (e) => {
              const newYaml = {...yaml, zowe: {...yaml.zowe, externalPort: Number(e.target.value)}};
              handleFormChange(newYaml);
            }}
          />
          <Typography variant="caption" sx={{opacity: '0.8'}}>You can configure which port will be used by every component.<br></br> 
          Note that the gateway port should match the External Port in most cases. 
          In some use cases, like containerization, this port could be different.</Typography>
          <br></br>
          <Accordion>
            <AccordionSummary
              sx={{mt: '12px'}}
              expandIcon={<ExpandMore/>}
              aria-controls="components-content"
              id="components-header"
            >
              <Typography>Component ports configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {Object.keys(yaml.components).filter(component => Object.prototype.hasOwnProperty.call(yaml.components[component], "port")).map(component => {
                return <div key={`div-${component}`} style={{display: 'flex', alignItems: 'center'}}> 
                  <FormControlLabel
                    sx={{width: '200px'}}
                    label={component}
                    key={`toggle-${component}`}
                    control={<Checkbox checked={yaml.components[component].enabled} onChange={async () => {
                      const newYaml = {...yaml, components: {...yaml.components, [component]: {...yaml.components[component], enabled: !yaml.components[component].enabled}}};
                      handleFormChange(newYaml);
                    }}/>}
                  />
                  <TextField
                    error={!yaml.components[component].port || yaml.components[component].port > 65535}
                    variant="standard"
                    size="small"
                    required={yaml.components[component].enabled}
                    key={`port-input-${component}`}
                    value={yaml.components[component].port}
                    InputProps={{
                        style: {minWidth: '100px', width: '100px'}
                    }}
                    onChange={async (e) => {
                      if (!Number.isNaN(Number(e.target.value))) {
                        const newYaml = {...yaml, components: {...yaml.components, [component]: {...yaml.components[component], port: Number(e.target.value)}}};
                        handleFormChange(newYaml);
                      }
                    }}
                  />
                </div>
              })}
            </AccordionDetails>
          </Accordion>
          {(networkSchema && yaml.zowe?.network) ? 
            <Fragment>
              <Typography variant="h6" sx={{mt: '36px'}}>Server TLS configuration</Typography>
              <JsonForm schema={networkSchema.properties.server.properties.tls} onChange={(data: any) => handleNetworkTLSChange(data, 'server')} formData={yaml.zowe?.network.server.tls}/>
              <Typography variant="h6" sx={{mt: '36px'}}>Client TLS configuration</Typography>
              <JsonForm schema={networkSchema.properties.client.properties.tls} onChange={(data: any) => handleNetworkTLSChange(data, 'client')} formData={yaml.zowe?.network.client.tls}/>
            </Fragment> : null
          }
          <Button id="reinstall-button" sx={{boxShadow: 'none', mr: '12px', mt: '24px'}} type="submit" variant="text" onClick={e => onSaveYaml(e)}>{'Save YAML to z/OS'}</Button>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Networking;