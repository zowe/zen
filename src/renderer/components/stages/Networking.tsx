/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState, useEffect } from "react";
import { Box, Button, Checkbox, FormControlLabel, IconButton, SvgIcon, SvgIconProps, TextField } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, setNextStepEnabled, setSchema, setYaml } from '../configuration-wizard/wizardSlice';
import ContainerCard from '../common/ContainerCard';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";
import { createTheme } from '@mui/material/styles';
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { stages } from "../configuration-wizard/Wizard";
import { selectInitializationStatus, setNetworkingStatus } from "./progress/progressSlice";
import { setActiveStep } from "./progress/activeStepSlice";
import { TYPE_YAML, TYPE_JCL, TYPE_OUTPUT, FALLBACK_SCHEMA, FALLBACK_YAML, ajv } from "../common/Constants";
import { IResponse } from "../../../types/interfaces";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { getInstallationArguments, getProgress } from "./progress/StageProgressStatus";
import { alertEmitter } from "../Header";

//   const schema = useAppSelector(selectSchema);
const schema: any = {
  "$id": "https://zowe.org/schemas/v2/server-base",
  "title": "Zowe configuration file",
  "description": "Configuration file for Zowe (zowe.org) version 2.",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "zowe": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "externalDomains": {
          "type": "array",
          "description": "List of domain names of how you access Zowe from your local computer.",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "type": ["string"]
          }
        },
        "externalPort": {
          "type": "integer",
          "minimum": 0,
          "maximum": 65535,
          "description": "Port number of how you access Zowe APIML Gateway from your local computer."
        }
      }
    },
    "components": {
      "type": "object",
      "patternProperties": {
        "^.*$": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "description": "Whether to enable or disable this component",
              "default": false
            },
            "port": {
              "type": "integer",
              "description": "Optional, port number for component if applicable.",
            },
            "debug": {
              "type": "boolean",
              "description": "Whether to enable or disable debug tracing for this component",
              "default": false
            },
            "certificate": {
              "$ref": "#/$defs/certificate",
              "description": "Certificate for current component."
            },
            "launcher": {
              "type": "object",
              "description": "Set behavior of how the Zowe launcher will handle this particular component",
              "additionalProperties": true,
              "properties": {
                "restartIntervals": {
                  "type": "array",
                  "description": "Intervals of seconds to wait before restarting a component if it fails before the minUptime value.",
                  "items": {
                    "type": "integer"  
                  }
                },
                "minUptime": {
                  "type": "integer",
                  "default": 90,
                  "description": "The minimum amount of seconds before a component is considered running and the restart counter is reset."
                },
                "shareAs": {
                  "type": "string",
                  "description": "Determines which SHAREAS mode should be used when starting a component",
                  "enum": ["no", "yes", "must", ""],
                  "default": "yes"
                }
              }
            },
            "zowe": {
              "type": "object",
              "description": "Component level overrides for top level Zowe network configuration.",
              "additionalProperties": false,
              "properties": {
                "network": {
                  "$ref": "#/$defs/networkSettings"
                },
                "job": {
                  "$ref": "#/$defs/componentJobSettings"
                }
              }
            }
          }
        }
      }
    },
    "haInstances": {
      "type": "object",
      "patternProperties": {
        "^.*$": {
          "type": "object",
          "description": "Configuration of Zowe high availability instance.",
          "required": ["hostname", "sysname"],
          "properties": {
            "hostname": {
              "type": "string",
              "description": "Host name of the Zowe high availability instance. This is hostname for internal communications."
            },
            "sysname": {
              "type": "string",
              "description": "z/OS system name of the Zowe high availability instance. Some JES command will be routed to this system name."
            },
            "components": {
              "type": "object",
              "patternProperties": {
                "^.*$": {
                  "$ref": "#/$defs/component"
                }
              }
            }
          }
        }
      }
    }
  },
  "$defs": {
    "port": {
      "type": "integer",
      "minimum": 0,
      "maximum": 65535
    },
    "scheme": {
      "type": "string",
      "enum": [
        "http",
        "https"
      ],
      "default": "https"
    },
    "certificate": {
      "oneOf": [
        { "$ref": "#/$defs/pkcs12-certificate" }, 
        { "$ref": "#/$defs/keyring-certificate" }
      ]
    },
    "pkcs12-certificate": { 
      "type": "object",
      "additionalProperties": false,
      "required": ["keystore", "truststore", "pem"],
      "properties": {
        "keystore": {
          "type": "object",
          "additionalProperties": false,
          "description": "Certificate keystore.",
          "required": ["type", "file", "alias"],
          "properties": {
            "type": {
              "type": "string",
              "description": "Keystore type.",
              "const": "PKCS12"
            },
            "file": {
              "type": "string",
              "pattern": "^([^\\0]){1,1024}$",
              "minLength": 1,
              "maxLength": 1024,
              "description": "Path to your PKCS#12 keystore."
            },
            "password": {
              "type": "string",
              "description": "Password of your PKCS#12 keystore."
            },
            "alias": {
              "type": "string",
              "description": "Certificate alias name of defined in your PKCS#12 keystore"
            }
          }
        },
        "truststore": {
          "type": "object",
          "additionalProperties": false,
          "description": "Certificate truststore.",
          "required": ["type", "file"],
          "properties": {
            "type": {
              "type": "string",
              "description": "Truststore type.",
              "const": "PKCS12"
            },
            "file": {
              "type": "string",
              "pattern": "^([^\\0]){1,1024}$",
              "minLength": 1,
              "maxLength": 1024,
              "description": "Path to your PKCS#12 keystore."
            },
            "password": {
              "type": "string",
              "description": "Password of your PKCS#12 keystore."
            }
          }
        },
        "pem": {
          "type": "object",
          "additionalProperties": false,
          "description": "Certificate in PEM format.",
          "required": ["key", "certificate"],
          "properties": {
            "key": {
              "type": "string",
              "pattern": "^([^\\0]){1,1024}$",
              "minLength": 1,
              "maxLength": 1024,
              "description": "Path to the certificate private key stored in PEM format."
            },
            "certificate": {
              "type": "string",
              "pattern": "^([^\\0]){1,1024}$",
              "minLength": 1,
              "maxLength": 1024,
              "description": "Path to the certificate stored in PEM format."
            },
            "certificateAuthorities": {
              "description": "List of paths to the certificate authorities stored in PEM format.",
              "oneOf": [{
                  "type": "string",
                  "pattern": "^([^\\0]){1,1024}$",
                  "minLength": 1,
                  "maxLength": 1024,
                  "description": "Paths to the certificate authorities stored in PEM format. You can separate multiple certificate authorities by comma."
                },
                {
                  "type": "array",
                  "description": "Path to the certificate authority stored in PEM format.",
                  "items": {
                    "type": "string",
                    "pattern": "^([^\\0]){1,1024}$",
                    "minLength": 1,
                    "maxLength": 1024,
                  }
                }
              ]
            }
          }
        }
      }
    },
    "keyring-certificate": { 
      "type": "object",
      "additionalProperties": false,
      "required": ["keystore", "truststore"],
      "properties": {
        "keystore": {
          "type": "object",
          "additionalProperties": false,
          "description": "Certificate keystore.",
          "required": ["type", "file", "alias"],
          "properties": {
            "type": {
              "type": "string",
              "description": "Keystore type.",
              "enum": ["JCEKS", "JCECCAKS", "JCERACFKS", "JCECCARACFKS", "JCEHYBRIDRACFKS"]
            },
            "file": {
              "type": "string",
              "description": "Path of your z/OS keyring, including ring owner and ring name. Case sensitivity and spaces matter.",
              "pattern": "^safkeyring:\/\/.*"
            },
            "password": {
              "type": "string",
              "description": "Literally 'password' may be needed when using keyrings for compatibility with java servers.",
              "enum": ["", "password"]
            },
            "alias": {
              "type": "string",
              "description": "Certificate label of z/OS keyring. Case sensitivity and spaces matter."
            }
          }
        },
        "truststore": {
          "type": "object",
          "additionalProperties": false,
          "description": "Certificate truststore.",
          "required": ["type", "file"],
          "properties": {
            "type": {
              "type": "string",
              "description": "Truststore type.",
              "enum": ["JCEKS", "JCECCAKS", "JCERACFKS", "JCECCARACFKS", "JCEHYBRIDRACFKS"]
            },
            "file": {
              "type": "string",
              "description": "Path of your z/OS keyring, including ring owner and ring name. Case sensitivity and spaces matter.",
              "pattern": "^safkeyring:\/\/.*"
            },
            "password": {
              "type": "string",
              "description": "Literally 'password' may be needed when using keyrings for compatibility with java servers.",
              "enum": ["", "password"]
            }
          }
        },
        "pem": {
          "type": "object",
          "additionalProperties": false,
          "description": "Certificate in PEM format.",
          "properties": {
            "key": {
              "type": "string",
              "description": "Path to the certificate private key stored in PEM format."
            },
            "certificate": {
              "type": "string",
              "description": "Path to the certificate stored in PEM format."
            },
            "certificateAuthorities": {
              "description": "List of paths to the certificate authorities stored in PEM format.",
              "oneOf": [{
                  "type": "string",
                  "description": "Paths to the certificate authorities stored in PEM format. You can separate multiple certificate authorities by comma."
                },
                {
                  "type": "array",
                  "description": "Path to the certificate authority stored in PEM format.",
                  "items": {
                    "type": "string"
                  }
                }
              ]
            }
          }
        }
      }
    },
    "component": {
      "$anchor": "zoweComponent",
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "description": "Whether to enable or disable this component",
          "default": false
        },
        "certificate": {
          "$ref": "#/$defs/certificate",
          "description": "Certificate for current component."
        },
        "launcher": {
          "type": "object",
          "description": "Set behavior of how the Zowe launcher will handle this particular component",
          "additionalProperties": true,
          "properties": {
            "restartIntervals": {
              "type": "array",
              "description": "Intervals of seconds to wait before restarting a component if it fails before the minUptime value.",
              "items": {
                "type": "integer"  
              }
            },
            "minUptime": {
              "type": "integer",
              "default": 90,
              "description": "The minimum amount of seconds before a component is considered running and the restart counter is reset."
            },
            "shareAs": {
              "type": "string",
              "description": "Determines which SHAREAS mode should be used when starting a component",
              "enum": ["no", "yes", "must", ""],
              "default": "yes"
            }
          }
        },
        "zowe": {
          "type": "object",
          "description": "Component level overrides for top level Zowe network configuration.",
          "additionalProperties": false,
          "properties": {
            "network": {
              "$ref": "#/$defs/networkSettings"
            },
            "job": {
              "$ref": "#/$defs/componentJobSettings"
            }
          }
        }
      }
    },
    "componentJobSettings": {
      "$anchor": "componentJobSettings",
      "type": "object",
      "description": "Component level overrides for job execution behavior",
      "properties": {
        "suffix": {
          "type": "string",
          "description": "Can be used by components to declare a jobname suffix to append to their job. This is not currently used by Zowe itself, it is up to components to use this value if desired. Zowe may use this value in the future."
        }
      }
    },
    "tlsSettings": {
     "$anchor": "tlsSettings",
      "type": "object",
      "properties": {
        "ciphers": {
          "type": "array",
          "description": "Acceptable TLS cipher suites for network connections, in IANA format.",
          "items": {
            "type": "string"
          }
        },
        "curves": {
          "type": "array",
          "description": "Acceptable key exchange elliptic curves for network connections.",
          "items": {
            "type": "string"
          }
        },
        "maxTls": {
          "type": "string",
          "enum": ["TLSv1.2", "TLSv1.3"],
          "default": "TLSv1.3",
          "description": "Maximum TLS version allowed for network connections."
        },
        "minTls": {
          "type": "string",
          "enum": ["TLSv1.2", "TLSv1.3"],
          "default": "TLSv1.2",
          "description": "Minimum TLS version allowed for network connections, and less than or equal to network.maxTls."
        }
      }
    },
    "networkSettings": {
      "type": "object",
      "$anchor": "networkSettings",
      "additionalProperties": false,
      "description": "Optional, advanced network configuration parameters",
      "properties": {
        "server": {
          "type": "object",
          "additionalProperties": false,
          "description": "Optional, advanced network configuration parameters for Zowe servers",
          "properties": {
            "tls": {
              "$ref": "#/$defs/tlsSettings"      
            },
            "listenAddresses": {
              "type": "array",
              "description": "The IP addresses which all of the Zowe servers will be binding on and listening to. Some servers may only support listening on the first element.",
              "items": {
                "type": "string",
                "pattern": "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
              }
            },
            "vipaIp": {
              "type": "string",
              "description": "The IP address which all of the Zowe servers will be binding to. If you are using multiple DIPVA addresses, do not use this option."
            },
            "validatePortFree": {
              "type": "boolean",
              "default": true,
              "description": "Whether or not to ensure that the port a server is about to use is available. Usually, servers will know this when they attempt to bind to a port, so this option allows you to disable the additional verification step."
            }
          }
        },
        "client": {
          "type": "object",
          "additionalProperties": false,
          "description": "Optional, advanced network configuration parameters for Zowe servers when sending requests as clients.",
          "properties": {
            "tls": {
                "$ref": "#/$defs/tlsSettings"    
            }
          }
        }
      }
    },
    "registryHandler": {
      "$anchor": "registryHandler",
      "type": "object",
      "required": ["registry", "path"],
      "properties": {
        "registry": {
          "type": "string",
          "description": "The location of the default registry for this handler. It could be a URL, path, dataset, whatever this handler supports"
        },
        "path": {
          "$ref": "/schemas/v2/server-common#zowePath",
          "description": "Unix file path to the configmgr-compatible JS file which implements the handler API"
        }
      }
    }
  }
}

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
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [installationArgs, setInstArgs] = useState(getInstallationArguments());
  const [elements, setElements] = useState([]);
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [validate] = useState(() => ajv.compile(schema));


  // useEffect(() => {
  //   // dispatch(setYaml(yaml));
  //   setModdedYaml(createModdedYaml(yaml));
  // }, [yaml]); 

  const isInitializationSkipped = !useAppSelector(selectInitializationStatus);

  useEffect(() => {
    const nextPosition = document.getElementById('container-box-id');
    if(nextPosition) nextPosition.scrollIntoView({behavior: 'smooth'});

    dispatch(setNextStepEnabled(getProgress('networkingStatus')));
    stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped = false;
    stages[STAGE_ID].isSkipped = isInitializationSkipped;
    setIsFormInit(true);

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };
  
  const handleFormChange = async (data: any, isYamlUpdated?: boolean) => {
    if(validate) {
      validate(data);
      if(validate.errors) {
        const errPath = validate.errors[0].schemaPath;
        const errMsg = validate.errors[0].message;
        setStageConfig(false, errPath+' '+errMsg, data.zowe);

      }
    }
    let newYaml;
    if (data.zowe && data.zowe.externalDomains && data.zowe.externalPort) {
      newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: data.zowe.externalDomains, externalPort: data.zowe.externalPort}};
    }
    if(data.components){
      newYaml = {...newYaml, components: data.components};
    }
    window.electron.ipcRenderer.setConfig(newYaml)
    setStageConfig(true, '', newYaml);
  };

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setLYaml(data);
  }

  useEffect(() => {
    if(yaml){
      const keys = Object.keys(schema.properties);

      //note on this nested for loop: it will only run on keys that have "patternProperties" as a child so it shouldnt be expensive
      let newElements = [];
      const LOOP_LIMIT = 1024;
      for (let i = 0; i < keys.length && i < LOOP_LIMIT; i++) { //i = go through each property of the yaml
        if (schema.properties[keys[i]].patternProperties != undefined) { //only for rendering patternProperties
          if(typeof yaml[keys[i]] === "object" && Object.keys(yaml[keys[i]]).length > 0) {
            newElements.push(<p key={`title-p-` + keys[i]} style={{fontSize: "24px"}}>{keys[i]}</p>);
            const patterns = Object.keys(schema.properties[keys[i]].patternProperties); //get all user defined regex patterns
            for(let j = 0; j <  patterns.length && j < LOOP_LIMIT; j++){ //j = go through each pattern
              const pattern = new RegExp(patterns[j]);
              const yamlValue = yaml[keys[i]];
              if(yamlValue){
                const toMatch = Object.keys(yamlValue);
                for(let k = 0; k < toMatch.length && k < LOOP_LIMIT; k++){
                  if(pattern.test(toMatch[k])){
                    // console.log('matched pattern ' + pattern + ' to ' + toMatch[k] + ' for key' + keys[i]);
                    const matchedProps = Object.keys(yamlValue[toMatch[k]]);
                    if(matchedProps.length > 0) {
                      newElements.push(<span key={`span-${k}`}><strong>{toMatch[k]}</strong></span>)
                      newElements.push(<br key={`br-${k}`} />);
                      // console.log('matchedProps:', matchedProps);
                      for(let l = 0; l < matchedProps.length && l < LOOP_LIMIT; l++){
                        // pattern = patterns[j] = current regex pattern from patternProperties
                        // keys[i] = parent object that contains pattern properties (likely components or haInstances)
                        // toMatch[k] = regex matched child of keys[i], likely a component name such as app-server, gateway, etc
                        // matchedProps[l] = properties of toMatch[k]
                        switch (typeof yamlValue[toMatch[k]][matchedProps[l]]){
                          case 'boolean':
                            newElements.push(<FormControlLabel
                              label={matchedProps[l]}
                              key={`toggle-` + keys[i] + '.' + toMatch[k] + '.' + matchedProps[l] + '-' + (i+k+l)}
                              control={<Checkbox checked={yaml[keys[i]][toMatch[k]][matchedProps[l]]} onChange={async (e) => {
                                // console.log('new yaml:', JSON.stringify({...yaml, [keys[i]]: {...yaml[keys[i]], [toMatch[k]]: {...yaml[keys[i]][toMatch[k]], [matchedProps[l]]: !yaml[keys[i]][toMatch[k]][matchedProps[l]]}}}));
                                const newYaml = {...yaml, [keys[i]]: {...yaml[keys[i]], [toMatch[k]]: {...yaml[keys[i]][toMatch[k]], [matchedProps[l]]: !yaml[keys[i]][toMatch[k]][matchedProps[l]]}}};
                                setLYaml(newYaml);
                                await window.electron.ipcRenderer.setConfigByKeyAndValidate(`${keys[i]}.${toMatch[k]}.${matchedProps[l]}`, !yaml[keys[i]][toMatch[k]][matchedProps[l]])
                                dispatch(setYaml(newYaml));
                              }}/>}
                            />)
                            newElements.push(<br key={`br2-${k}${l}`} />);
                            break;
                          case 'number':
                              newElements.push(<TextField
                                label={matchedProps[l]}
                                variant="standard"
                                type="text" inputMode="numeric"
                                key={keys[i] + '.' + toMatch[k] + '.' + l}
                                value={yaml[keys[i]][toMatch[k]][matchedProps[l]]}
                                onChange={async (e) => {
                                  if(!Number.isNaN(Number(e.target.value))){
                                    const newYaml = {...yaml, [keys[i]]: {...yaml[keys[i]], [toMatch[k]]: {...yaml[keys[i]][toMatch[k]], [matchedProps[l]]: Number(e.target.value)}}};
                                    setLYaml(newYaml);
                                    await window.electron.ipcRenderer.setConfigByKeyAndValidate(`${keys[i]}.${toMatch[k]}.${matchedProps[l]}`, Number(e.target.value))
                                    dispatch(setYaml(newYaml));
                                  }
                                }}
                              />)
                          default:
                            break;
                        }
                      }
                      newElements.push(<br key={`br3-${k}`} />);
                    }
                  }
                }
              }
            }
          }
        }
      }
      setElements(newElements);
    }
  }, [yaml])

  const onSaveYaml = (e: any) => {
    e.preventDefault();
    alertEmitter.emit('showAlert', 'Uploading yaml...', 'info');
    window.electron.ipcRenderer.uploadLatestYaml(connectionArgs, installationArgs).then((res: IResponse) => {
      if(res && res.status) {
        dispatch(setNextStepEnabled(true));
        dispatch(setNetworkingStatus(true));
        alertEmitter.emit('showAlert', res.details, 'success');
      } else {
        dispatch(setNetworkingStatus(false));
        alertEmitter.emit('showAlert', res.details, 'error');
      }
    });
  }

  return (
    yaml && schema && <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button key="yaml" variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        {/* <Button key="jcl" variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button> */}
        <Button key="job" variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Networking" description="Zowe networking configurations."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>}
        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details ?? yaml))}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <p key="external-domains" style={{fontSize: "24px"}}>External Domains <IconButton onClick={(e) => {
            let domains = [...yaml.zowe?.externalDomains, ""];
            const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: domains}};
            window.electron.ipcRenderer.setConfig(newYaml )
            dispatch(setYaml(newYaml))
            setLYaml(newYaml);
          }}><AddIcon /></IconButton></p>
          {yaml.zowe.externalDomains != undefined && yaml.zowe.externalDomains.map((domain: string, index: number) => <Box key={`box-${index}`} sx={{display: "flex", flexDirection: "row"}}><TextField
            variant="standard"
            value={domain}
            onChange={async (e) => {
              let domains = [...yaml.zowe?.externalDomains];
              domains[index] = e.target.value;
              const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: domains}};
              // console.log(domains);
              window.electron.ipcRenderer.setConfig(newYaml )
              dispatch(setYaml(newYaml))
              setLYaml(newYaml);
            }}
          /><IconButton onClick={(e) => {
            let domains = [...yaml.zowe?.externalDomains];
            domains.splice(index, 1);
            const newYaml = {...yaml, zowe: {...yaml.zowe, externalDomains: domains}};
            window.electron.ipcRenderer.setConfig(newYaml )
            dispatch(setYaml(newYaml))
            setLYaml(newYaml);
          }}><DeleteIcon /></IconButton></Box>)}
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
              dispatch(setYaml(newYaml))
              setLYaml(newYaml);
              // // props.setYaml(newYaml);
              // await window.electron.ipcRenderer.setConfigByKeyAndValidate(`${keys[i]}.${toMatch[k]}.${matchedProps[l]}`, Number(e.target.value))
              // // dispatch(setYaml(newYaml));
            }}
          />
          <div>
            {elements}
          </div>
          <Button id="reinstall-button" sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => onSaveYaml(e)}>{'Save YAML to z/OS'}</Button>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Networking;