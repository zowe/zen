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
import { Box, Button, Checkbox, FormControlLabel } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";
import { createTheme } from '@mui/material/styles';
import { JsonForms } from "@jsonforms/react";
import { materialCells, materialRenderers } from "@jsonforms/material-renderers";

function PatternPropertiesForm(props: any){
  const [formState, setFormState] = useState(props.yaml);
  const [elements, setElements] = useState([]);
  const [uiSchema, setUiSChema] = useState({});
  
  useEffect(() => {
    const keys = Object.keys(props.schema.properties);


    //note on this nested for loop: it will only run on keys that have "patternProperties" as a child so it shouldnt be expensive
    let newElements = [];
    let yamlCopy = props.yaml;
    for (let i = 0; i < keys.length; i++) {
      if (props.schema.properties[keys[i]].patternProperties != undefined) {
        const patterns = Object.keys(props.schema.properties[keys[i]].patternProperties);
        for(let j = 0; j <  patterns.length; j++){
          const pattern = new RegExp(patterns[j]);
          const yamlValue = props.yaml[keys[i]];
          if(yamlValue){
            const toMatch = Object.keys(yamlValue);
            for(let k = 0; k < toMatch.length; k++){
              if(pattern.test(toMatch[k])){
                console.log('matched pattern ' + pattern + ' to ' + toMatch[k] + ' for key' + keys[i]);
                const matchedProps = Object.keys(yamlValue[toMatch[k]]);
                // console.log('matchedProps:', matchedProps);
                for(let l = 0; l < matchedProps.length; l++){
                  switch (typeof yamlValue[toMatch[k]][matchedProps[l]]){
                    case 'boolean':
                      console.log('boolean adding');
                      newElements.push(      <FormControlLabel
                        label={matchedProps[l]}
                        control={<Checkbox checked={yamlValue[toMatch[k]][matchedProps[l]]} />}
                      />)
                      break;
                    default:
                      break;
                  }
                  // console.log(`#/properties/${keys[i]}/patternProperties/${patterns[j]}/properties/${matchedProps[l]}`);
                  // groupedControls.push({
                  //   "type": "Control",
                  //   "scope": `#/properties/${keys[i]}/patternProperties/${patterns[j]}/properties/${matchedProps[l]}`
                  // })
                }
              }
            }
          }
        }
      }
    }
    setElements(newElements);
  }, [])

  return <>
    {elements}
  </>
}

const Networking = () => {

  const theme = createTheme();

  const dispatch = useAppDispatch();
//   const schema = useAppSelector(selectSchema);
  const schema = {
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
                "description": "Whether to enable or disable this component",
              },
              "debug": {
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
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const setupSchema:any = schema ?? {};
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');

//   const section = 'setup';

  const TYPE_YAML = "yaml";
  const TYPE_JCL = "jcl";
  const TYPE_OUTPUT = "output";

  const ajv = new Ajv();
  ajv.addKeyword("$anchor");
  let validate: any;

  if(schema) {
    validate = ajv.compile(schema);
  }

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    setIsFormInit(true);
    if(yaml.zowe){
      let yamlCopy = {...yaml.zowe}
      delete yamlCopy.setup;
      delete yamlCopy.rbacProfileIdentifier;
      delete yamlCopy.cookieIdentifier;
      delete yamlCopy.job;
      delete yamlCopy.certificate;
      delete yamlCopy.sysMessages;
      delete yamlCopy.verifyCertificates;
      delete yamlCopy.useConfigmgr;
      delete yamlCopy.runtimeDirectory;
      delete yamlCopy.logDirectory;
      delete yamlCopy.extensionDirectory;
      delete yamlCopy.workspaceDirectory;
      setLYaml({...yaml, zowe: yamlCopy});
    }
  }, []);

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };
  
  const handleFormChange = (data: any, isYamlUpdated?: boolean) => {
    let newData = isFormInit ? (Object.keys(yaml).length > 0 ? yaml: data) : (data ? data : yaml);
    setIsFormInit(false);

    if (data.externalDomains || data.externalPort || data.configmgr || data.launchScript) {
      newData = isYamlUpdated ? data.zowe : newData;

      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setStageConfig(false, errPath+' '+errMsg, newData);
        } else {
          // setTopLevelYamlConfig('zowe.externalDomains', data.externalDomains);
          // setTopLevelYamlConfig('zowe.externalPort', data.externalPort);
          // setTopLevelYamlConfig('zowe.configmgr', data.configmgr);
          // setTopLevelYamlConfig('zowe.launchScript', data.launchScript);
          // setConfiguration(section, newData, true);
          setStageConfig(true, '', newData);
        }
      }
    }
  };

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    // setSetupYaml(data);
  } 

  return (
    yaml && schema && <div>
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>Preview Job</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>Submit Job</Button>
      </Box>
      <ContainerCard title="Networking" description="Zowe networking configurations."> 
        <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>
        <Box sx={{ width: '60vw' }}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={schema} onChange={handleFormChange} formData={yaml}/>
          <PatternPropertiesForm schema={schema} yaml={yaml} />
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Networking;