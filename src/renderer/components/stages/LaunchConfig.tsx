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
import { Box, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml,setNextStepEnabled, setYaml } from '../configuration-wizard/wizardSlice';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import { createTheme } from '@mui/material/styles';
import { getStageDetails, getSubStageDetails } from "../../../services/StageDetails";
import { stages } from "../configuration-wizard/Wizard";
import { selectInitializationStatus, setInitializationStatus, setLaunchConfigStatus } from "./progress/progressSlice";
import { setActiveStep } from "./progress/activeStepSlice";
import { TYPE_YAML, TYPE_OUTPUT, FALLBACK_YAML, ajv, INIT_STAGE_LABEL, LAUNCH_CONFIG_STAGE_LABEL } from "../common/Utils";
import { IResponse } from "../../../types/interfaces";
import { getInstallationArguments, getProgress, isInitializationStageComplete, updateSubStepSkipStatus } from "./progress/StageProgressStatus";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { alertEmitter } from "../Header";

const LaunchConfig = () => {

  const [theme] = useState(createTheme());
  const [STAGE_ID] = useState(getStageDetails(INIT_STAGE_LABEL).id);
  const [SUB_STAGES] = useState(!!getStageDetails(INIT_STAGE_LABEL).subStages);
  const [SUB_STAGE_ID] = useState(SUB_STAGES ? getSubStageDetails(STAGE_ID, LAUNCH_CONFIG_STAGE_LABEL).id : 0);

  const dispatch = useAppDispatch();
//   const schema = useAppSelector(selectSchema);
  const schema = {
    "$schema": "https://json-schema.org/draft/2019-09/schema",
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
          "configmgr": {
            "type": "object",
            "description": "Controls how configmgr will be used by zwe",
            "required": ["validation"],
            "properties": {
              "validation": {
                "type": "string",
                "enum": ["STRICT", "COMPONENT-COMPAT"],
                "description": "States how configmgr will do validation: Will it quit on any error (STRICT) or quit on any error except the case of a component not having a schema file (COMPONENT-COMPAT)"
              }
            }
          },
          "launchScript": {
            "type": "object",
            "description": "Customize Zowe launch scripts (zwe commands) behavior.",
            "properties": {
              "logLevel": {
                "type": "string",
                "description": "Log level for Zowe launch scripts.",
                "enum": ["", "info", "debug", "trace"]
              },
              "onComponentConfigureFail": {
                "type": "string",
                "description": "Chooses how 'zwe start' behaves if a component configure script fails",
                "enum": ["warn", "exit"],
                "default": "warn"
              }
            }
          }
        }
      },
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
                "$ref": "/schemas/v2/server-common#zowePath",
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
                "$ref": "/schemas/v2/server-common#zowePath",
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
                "$ref": "/schemas/v2/server-common#zowePath",
                "description": "Path to the certificate private key stored in PEM format."
              },
              "certificate": {
                "$ref": "/schemas/v2/server-common#zowePath",
                "description": "Path to the certificate stored in PEM format."
              },
              "certificateAuthorities": {
                "description": "List of paths to the certificate authorities stored in PEM format.",
                "oneOf": [{
                    "$ref": "/schemas/v2/server-common#zowePath",
                    "description": "Paths to the certificate authorities stored in PEM format. You can separate multiple certificate authorities by comma."
                  },
                  {
                    "type": "array",
                    "description": "Path to the certificate authority stored in PEM format.",
                    "items": {
                      "$ref": "/schemas/v2/server-common#zowePath"
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
                  "$ref": "/schemas/v2/server-common#zoweIpv4"
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
  const [yaml, setLocalYaml] = useState(useAppSelector(selectYaml));
  const [setupSchema] = useState(schema.properties.zowe);
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe);
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [installationArgs, setInstArgs] = useState(getInstallationArguments());
  const [connectionArgs] = useState(useAppSelector(selectConnectionArgs));

  const [validate] = useState(() => ajv.getSchema("https://zowe.org/schemas/v2/server-base") || ajv.compile(schema));

  const [isInitializationSkipped] = useState(!useAppSelector(selectInitializationStatus));

  const [stateUpdated, setStateUpdated] = useState(false);
  const [stageStatus, setStageStatus] = useState(stages[STAGE_ID].subStages[SUB_STAGE_ID].isSkipped);
  const stageStatusRef = useRef(stageStatus);

  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);

  useEffect(() => {

    if(!yaml){
      window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
        if (res.status) {
          dispatch(setYaml(res.details));
          setLocalYaml(res.details);
        } else {
          dispatch(setYaml(FALLBACK_YAML));
          setLocalYaml(FALLBACK_YAML);
        }
      })
    }
    const nextPosition = document.getElementById('container-box-id');
    nextPosition.scrollIntoView({behavior: 'smooth'});

    dispatch(setNextStepEnabled(getProgress('launchConfigStatus')));
    dispatch(setInitializationStatus(isInitializationStageComplete()));

    setIsFormInit(true);

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
    setStateUpdated(!setStateUpdated);
    dispatch(setLaunchConfigStatus(status));
    dispatch(setNextStepEnabled(status));
    setStageSkipStatus(!status);
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };
  
  const handleFormChange = async (data: any, isYamlUpdated?: boolean) => {
    if(isFormInit){
      setLaunchConfigStatus(false)
    }
    let newData = isFormInit ? (Object.keys(setupYaml).length > 0 ? setupYaml : data.zowe) : (data.zowe ? data.zowe : data);
    setIsFormInit(false);

    if (newData.configmgr || newData.launchScript) {

      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setStageConfig(false, errPath+' '+errMsg, newData);
        } else {
          const newYaml = {...yaml, zowe: {...yaml.zowe, configmgr: newData.configmgr, launchScript: newData.launchScript}};
          await window.electron.ipcRenderer.setConfigByKeyAndValidate("zowe.configmgr", newData.configmgr);
          await window.electron.ipcRenderer.setConfigByKeyAndValidate("zowe.launchScript", newData.launchScript);
          dispatch(setYaml(newYaml));
          setStageConfig(true, '', newData);
        }
      }
    }
  };

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setSetupYaml(data);
  }

  const onSaveYaml = (e: any) => {
    e.preventDefault();
    updateProgress(false);
    dispatch(setLaunchConfigStatus(false));
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
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        {/* <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button> */}
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Configuration" description="Basic zowe.yaml configurations."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>}
        <Box sx={{ width: '60vw' }}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
          <Button id="reinstall-button" sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => onSaveYaml(e)}>{'Save YAML to z/OS'}</Button>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default LaunchConfig;