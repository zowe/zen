/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useCallback, useEffect, useRef, useState} from "react";
import { Box, Button, FormControl, Typography, debounce } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { selectYaml, setYaml, selectSchema, setNextStepEnabled, setLoading, setSchema } from '../../configuration-wizard/wizardSlice';
import { selectInstallationArgs, selectZoweVersion, selectInstallationType } from './installationSlice';
import { selectConnectionArgs } from '../connection/connectionSlice';
import { setDatasetInstallationStatus, setInitializationStatus } from "../progress/progressSlice";
import { IResponse } from '../../../../types/interfaces';
import ProgressCard from '../../common/ProgressCard';
import ContainerCard from '../../common/ContainerCard';
import JsonForm from '../../common/JsonForms';
import EditorDialog from "../../common/EditorDialog";
import Ajv from "ajv";
import { alertEmitter } from "../../Header";
import { createTheme } from '@mui/material/styles';
import {stages} from "../../configuration-wizard/Wizard";
import { setActiveStep } from "../progress/activeStepSlice";
import { getStageDetails, getSubStageDetails } from "../../../../utils/StageDetails"; 
import { setProgress, getProgress, setDatasetInstallationState, getDatasetInstallationState, getInstallationTypeStatus } from "../progress/StageProgressStatus";
import { DatasetInstallationState } from "../../../../types/stateInterfaces";

const Installation = () => {

  const stageLabel = 'Initialization';
  const subStageLabel = 'Installation';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;
  const SUB_STAGE_ID = SUB_STAGES ? getSubStageDetails(STAGE_ID, subStageLabel).id : 0;

  const theme = createTheme();

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const stageId = 3;
  const subStageId = 0;
  const dispatch = useAppDispatch();
  // this schema will be used in the case where the user, for some reason, clicks "skip installation" without downloading or uploading a Zowe pax
  // Maybe we shouldnt allow the user to skip the installation stage??
  const [FALLBACK_SCHEMA] = useState({
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "$id": "https://zowe.org/schemas/v2/server-base",
    "title": "Zowe configuration file",
    "description": "Configuration file for Zowe (zowe.org) version 2.",
    "type": "object",
    "additionalProperties": true,
    "properties": {
      "zowe": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "setup": {
            "type": "object",
            "additionalProperties": false,
            "description": "Zowe setup configurations used by \"zwe install\" and \"zwe init\" commands.",
            "properties": {
              "dataset": {
                "type": "object",
                "additionalProperties": false,
                "description": "MVS data set related configurations",
                "properties": {
                  "prefix": {
                    "type": "string",
                    "description": "Where Zowe MVS data sets will be installed"
                  },
                  "proclib": {
                    "type": "string",
                    "description": "PROCLIB where Zowe STCs will be copied over"
                  },
                  "parmlib": {
                    "type": "string",
                    "description": "Zowe PARMLIB"
                  },
                  "parmlibMembers": {
                    "type": "object",
                    "additionalProperties": false,
                    "description": "Holds Zowe PARMLIB members for plugins",
                    "properties": {
                      "zis": {
                        "description": "PARMLIB member used by ZIS",
                        "type": "string",
                        "pattern": "^([A-Z$#@]){1}([A-Z0-9$#@]){0,7}$",
                        "minLength": 1,
                        "maxLength": 8
                      }
                    }
                  },
                  "jcllib": {
                    "type": "string",
                    "description": "JCL library where Zowe will store temporary JCLs during initialization"
                  },
                  "loadlib": {
                    "type": "string",
                    "description": "States the dataset where Zowe executable utilities are located",
                    "default": "<hlq>.SZWELOAD"
                  },
                  "authLoadlib": {
                    "type": "string",
                    "description": "The dataset that contains any Zowe core code that needs to run APF-authorized, such as ZIS",
                    "default": "<hlq>.SZWEAUTH"
                  },
                  "authPluginLib": {
                    "type": "string",
                    "description": "APF authorized LOADLIB for Zowe ZIS Plugins"
                  }
                }
              },
              "zis": {
                "type": "object",
                "additionalProperties": false,
                "description": "ZIS related configurations. This setup is optional.",
                "properties": {
                  "parmlib": {
                    "type": "object",
                    "additionalProperties": false,
                    "description": "ZIS related PARMLIB configurations. This setup is optional.",
                    "properties": {
                      "keys": {
                        "type": "object",
                        "additionalProperties": true,
                        "description": "Used to specify special ZIS key types with key-value pairs",
                        "examples": [
                          "key.sample.1: list",
                          "key.sample.2: list"
                        ]
                      }
                    }
                  }
                }
              },
              "security": {
                "type": "object",
                "additionalProperties": false,
                "description": "Security related configurations. This setup is optional.",
                "properties": {
                  "product": {
                    "type": "string",
                    "description": "Security product name. Can be RACF, ACF2 or TSS",
                    "enum": ["RACF", "ACF2", "TSS"],
                    "default": "RACF"
                  },
                  "groups": {
                    "type": "object",
                    "additionalProperties": false,
                    "description": "security group name",
                    "properties": {
                      "admin": {
                        "type": "string",
                        "description": "Zowe admin user group",
                        "default": "ZWEADMIN"
                      },
                      "stc": {
                        "type": "string",
                        "description": "Zowe STC group",
                        "default": "ZWEADMIN"
                      },
                      "sysProg": {
                        "type": "string",
                        "description": "Zowe SysProg group",
                        "default": "ZWEADMIN"
                      }
                    }
                  },
                  "users": {
                    "type": "object",
                    "additionalProperties": false,
                    "description": "security user name",
                    "properties": {
                      "zowe": {
                        "type": "string",
                        "description": "Zowe runtime user name of main service",
                        "default": "ZWESVUSR"
                      },
                      "zis": {
                        "type": "string",
                        "description": "Zowe runtime user name of ZIS",
                        "default": "ZWESIUSR"
                      }
                    }
                  },
                  "stcs": {
                    "type": "object",
                    "additionalProperties": false,
                    "description": "STC names",
                    "properties": {
                      "zowe": {
                        "type": "string",
                        "description": "STC name of main service",
                        "default": "ZWESLSTC"
                      },
                      "zis": {
                        "type": "string",
                        "description": "STC name of ZIS",
                        "default": "ZWESISTC"
                      },
                      "aux": {
                        "type": "string",
                        "description": "STC name of Auxiliary Service",
                        "default": "ZWESASTC"
                      }
                    }
                  }
                }
              },
              "certificate": {
                "type": "object",
                "additionalProperties": false,
                "if": {
                  "properties": {
                    "type": {
                      "const": "PKCS12"
                    }
                  }
                },
                "then": {
                  "required": ["pkcs12"]
                },
                "else": {
                  "required": ["keyring"]
                },
                "description": "Certificate related configurations",
                "properties": {
                  "type": {
                    "type": "string",
                    "description": "Type of certificate storage method.",
                    "enum": ["PKCS12", "JCEKS", "JCECCAKS", "JCERACFKS", "JCECCARACFKS", "JCEHYBRIDRACFKS"],
                    "default": "PKCS12"
                  },
                  "pkcs12": {
                    "type": "object",
                    "additionalProperties": false,
                    "description": "PKCS#12 keystore settings",
                    "properties": {
                      "directory": {
                        "description": "Keystore directory",
                        "type": "string",
                        "pattern": "^([^\\0]){1,1024}$",
                        "minLength": 1,
                        "maxLength": 1024
                      },
                      "name": {
                        "type": "string",
                        "description": "Certificate alias name. Note: please use all lower cases as alias.",
                        "default": "localhost"
                      },
                      "password": {
                        "type": "string",
                        "description": "Keystore password",
                        "default": "password"
                      },
                      "caAlias": {
                        "type": "string",
                        "description": "Alias name of self-signed certificate authority. Note: please use all lower cases as alias.",
                        "default": "local_ca"
                      },
                      "caPassword": {
                        "type": "string",
                        "description": "Password of keystore stored self-signed certificate authority.",
                        "default": "local_ca_password"
                      },
                      "lock": {
                        "type": "boolean",
                        "description": "Whether to restrict the permissions of the keystore after creation"
                      },
                      "import": {
                        "type": "object",
                        "additionalProperties": false,
                        "description": "Configure this section if you want to import certificate from another PKCS#12 keystore.",
                        "properties": {
                          "keystore": {
                            "type": "string",
                            "description": "Existing PKCS#12 keystore which holds the certificate issued by external CA."
                          },
                          "password": {
                            "type": "string",
                            "description": "Password of the above keystore"
                          },
                          "alias": {
                            "type": "string",
                            "description": "Certificate alias will be imported. Note: please use all lower cases as alias."
                          }
                        }
                      }
                    }
                  },
                  "keyring": {
                    "type": "object",
                    "additionalProperties": false,
                    "description": "Configure this section if you are using z/OS keyring",
                    "properties": {
                      "owner": {
                        "type": "string",
                        "description": "keyring owner. If this is empty, Zowe will use the user ID defined as zowe.setup.security.users.zowe."
                      },
                      "name": {
                        "type": "string",
                        "description": "keyring name"
                      },
                      "label": {
                        "type": "string",
                        "description": "Label of Zowe certificate.",
                        "default": "localhost"
                      },
                      "caLabel": {
                        "type": "string",
                        "description": "label of Zowe CA certificate.",
                        "default": "localca"
                      },
                      "connect": {
                        "type": "object",
                        "additionalProperties": false,
                        "description": "Configure this section if you want to connect existing certificate in keyring to Zowe.",
                        "properties": {
                          "user": {
                            "type": "string",
                            "description": "Current owner of the existing certificate, can be SITE or an user ID."
                          },
                          "label": {
                            "type": "string",
                            "description": "Label of the existing certificate will be connected to Zowe keyring."
                          }
                        }
                      },
                      "import": {
                        "type": "object",
                        "additionalProperties": false,
                        "description": "Configure this section if you want to import existing certificate stored in data set to Zowe.",
                        "properties": {
                          "dsName": {
                            "type": "string",
                            "description": "Name of the data set holds the certificate issued by other CA. This data set should be in PKCS12 format and contain private key."
                          },
                          "password": {
                            "type": "string",
                            "description": "Password for the PKCS12 data set."
                          }
                        }
                      },
                      "zOSMF": {
                        "type": "object",
                        "additionalProperties": false,
                        "description": "Configure this section if you want to trust z/OSMF certificate authority in Zowe keyring.",
                        "properties": {
                          "ca": {
                            "type": "string",
                            "description": "z/OSMF certificate authority alias"
                          },
                          "user": {
                            "type": "string",
                            "description": "z/OSMF user. Zowe initialization utility can detect alias of z/OSMF CA for RACF security system. The automated detection requires this z/OSMF user as input."
                          }
                        }
                      }
                    }
                  },
                  "dname": {
                    "type": "object",
                    "additionalProperties": false,
                    "description": "Certificate distinguish name",
                    "properties": {
                      "caCommonName": {
                        "type": "string",
                        "description": "Common name of certificate authority generated by Zowe."
                      },
                      "commonName": {
                        "type": "string",
                        "description": "Common name of certificate generated by Zowe."
                      },
                      "orgUnit": {
                        "type": "string",
                        "description": "Organization unit of certificate generated by Zowe."
                      },
                      "org": {
                        "type": "string",
                        "description": "Organization of certificate generated by Zowe."
                      },
                      "locality": {
                        "type": "string",
                        "description": "Locality of certificate generated by Zowe. This is usually the city name."
                      },
                      "state": {
                        "type": "string",
                        "description": "State of certificate generated by Zowe. You can also put province name here."
                      },
                      "country": {
                        "type": "string",
                        "description": "2 letters country code of certificate generated by Zowe."
                      }
                    }
                  },
                  "validity": {
                    "type": "integer",
                    "description": "Validity days for Zowe generated certificates",
                    "default": 3650
                  },
                  "san": {
                    "type": "array",
                    "description": "Domain names and IPs should be added into certificate SAN. If this field is not defined, `zwe init` command will use `zowe.externalDomains`.",
                    "items": {
                      "type": "string"
                    }
                  },
                  "importCertificateAuthorities": {
                    "type": "array",
                    "description": "PEM format certificate authorities will also be imported and trusted. If you have other certificate authorities want to be trusted in Zowe keyring, list the certificate labels here. **NOTE**, due to the limitation of RACDCERT command, this field should contain maximum 2 entries.",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "vsam": {
                "type": "object",
                "additionalProperties": false,
                "description": "VSAM configurations if you are using VSAM as Caching Service storage",
                "properties": {
                  "mode": {
                    "type": "string",
                    "description": "VSAM data set with Record-Level-Sharing enabled or not",
                    "enum": ["NONRLS", "RLS"],
                    "default": "NONRLS"
                  },
                  "volume": {
                    "type": "string",
                    "description": "Volume name if you are using VSAM in NONRLS mode"
                  },
                  "storageClass": {
                    "type": "string",
                    "description": "Storage class name if you are using VSAM in RLS mode"
                  }
                }
              }
            }
          },
          "runtimeDirectory": {
            "$ref": "#/$defs/zowePath",
            "description": "Path to where you installed Zowe."
          },
          "logDirectory": {
            "$ref": "#/$defs/zowePath",
            "description": "Path to where you want to store Zowe log files."
          },
          "workspaceDirectory": {
            "$ref": "#/$defs/zowePath",
            "description": "Path to where you want to store Zowe workspace files. Zowe workspace are used by Zowe component runtime to store temporary files."
          },
          "extensionDirectory": {
            "$ref": "#/$defs/zowePath",
            "description": "Path to where you want to store Zowe extensions. \"zwe components install\" will install new extensions into this directory."
          },
          "job": {
            "type": "object",
            "additionalProperties": false,
            "description": "Customize your Zowe z/OS JES job.",
            "properties": {
              "name": {
                "type": "string",
                "description": "Job name of Zowe primary ZWESLSTC started task."
              },
              "prefix": {
                "type": "string",
                "description": "A short prefix to customize address spaces created by Zowe job."
              }
            }
          },
          "network": {
            "$ref": "#/$defs/networkSettings"
          },
          "extensionRegistry": {
            "type": "object",
            "description": "Defines optional configuration for downloading extensions from an online or offline registry",
            "required": ["defaultHandler", "handlers"],
            "properties": {
              "defaultHandler": {
                "type": "string",
                "description": "The name of a handler specified in the handlers section. Will be used as the default for 'zwe components' commands"
              },
              "handlers": {
                "type": "object",
                "patternProperties": {
                  "^.*$": {
                    "$ref": "#/$defs/registryHandler"
                  }
                }
              }
            }
          },
          "launcher": {
            "type": "object",
            "description": "Set default behaviors of how the Zowe launcher will handle components",
            "additionalProperties": false,
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
              },
              "unsafeDisableZosVersionCheck": {
                "type": "boolean",
                "description": "Used to allow Zowe to warn, instead of error, when running on a version of z/OS that this version of Zowe hasn't been verified as working with",
                "default": false
              }
            }
          },
          "rbacProfileIdentifier": {
            "type": "string",
            "description": "An ID used for determining resource names used in RBAC authorization checks"
          },
          "cookieIdentifier": {
            "type": "string",
            "description": "An ID that can be used by servers that distinguish their cookies from unrelated Zowe installs"
          },
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
            "$ref": "#/$defs/port",
            "description": "Port number of how you access Zowe APIML Gateway from your local computer."
          },
          "environments": {
            "type": "object",
            "description": "Global environment variables can be applied to all Zowe high availability instances."
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
          },
          "certificate": {
            "$ref": "#/$defs/certificate",
            "description": "Zowe certificate setup."
          },
          "verifyCertificates": {
            "type": "string",
            "description": "Customize how Zowe should validate certificates used by components or other services.",
            "enum": ["STRICT", "NONSTRICT", "DISABLED"]
          },
          "sysMessages": {
            "type": "array",
            "description": "List of Zowe message portions when matched will be additionally logged into the system's log (such as syslog on z/OS). Note: Some messages extremely early in the Zowe lifecycle may not be added to the system's log",
            "uniqueItems": true,
            "items": {
              "type": "string"
            }
          },
          "useConfigmgr": {
            "type": "boolean",
            "default": false,
            "description": "Determines whether or not to use the features of configmgr such as multi-config, parmlib config, config templates, and schema validation. This effects the zwe command."
          },
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
          }
        }
      },
      "java": {
        "type": "object",
        "properties": {
          "home": {
            "$ref": "#/$defs/zowePath",
            "description": "Path to Java home directory."
          }
        }
      },
      "node": {
        "type": "object",
        "properties": {
          "home": {
            "$ref": "#/$defs/zowePath",
            "description": "Path to node.js home directory."
          }
        }
      },
      "zOSMF": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "host": {
            "type": "string",
            "description": "Host or domain name of your z/OSMF instance."
          },
          "port": {
            "$ref": "#/$defs/port",
            "description": "Port number of your z/OSMF instance."
          },
          "scheme": {
            "$ref" : "#/$defs/scheme",
            "description": "Scheme used to connect to z/OSMF instance. Optional for outbout AT-TLS, defaults to https"
          },
          "applId": {
            "type": "string",
            "description": "Appl ID of your z/OSMF instance."
          }
        }
      },
      "components": {
        "type": "object",
        "patternProperties": {
          "^.*$": {
            "$ref": "#/$defs/component"
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
                "$ref": "#/$defs/zowePath",
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
                "$ref": "#/$defs/zowePath",
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
                "$ref": "#/$defs/zowePath",
                "description": "Path to the certificate private key stored in PEM format."
              },
              "certificate": {
                "$ref": "#/$defs/zowePath",
                "description": "Path to the certificate stored in PEM format."
              },
              "certificateAuthorities": {
                "description": "List of paths to the certificate authorities stored in PEM format.",
                "oneOf": [{
                    "$ref": "#/$defs/zowePath",
                    "description": "Paths to the certificate authorities stored in PEM format. You can separate multiple certificate authorities by comma."
                  },
                  {
                    "type": "array",
                    "description": "Path to the certificate authority stored in PEM format.",
                    "items": {
                      "$ref": "#/$defs/zowePath"
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
            "additionalProperties": true,
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
            "$ref": "#/$defs/zowePath",
            "description": "Unix file path to the configmgr-compatible JS file which implements the handler API"
          }
        }
      },
      "zowePath": {
        "$anchor": "zowePath",
        "type": "string",
        "pattern": "^([^\\0]){1,1024}$",
        "minLength": 1,
        "maxLength": 1024
      },
    }
  })
  const [FALLBACK_YAML] = useState({
    "node": {
      "home": ""
    }, 
    "java": {
      "home": ""
    }, 
    "zOSMF": {
      "host": "dvipa.my-company.com", 
      "port": 443, 
      "applId": "IZUDFLT"
    }, 
    "zowe": {
      "rbacProfileIdentifier": "1", 
      "logDirectory": "/global/zowe/logs", 
      "job": {
        "prefix": "ZWE1", 
        "name": "ZWE1SV"
      }, 
      "sysMessages": [
        "ZWEL0021I", 
        "ZWEL0018I", 
        "ZWEL0006I", 
        "ZWES1601I", 
        "ZWEL0008I", 
        "ZWEL0022I", 
        "ZWEL0001I", 
        "ZWEL0002I", 
        "ZWEAM000I", 
        "ZWED0031I", 
        "ZWES1013I"
      ], 
      "launchScript": {
        "logLevel": "info", 
        "onComponentConfigureFail": "warn"
      }, 
      "extensionDirectory": "/global/zowe/extensions", 
      "certificate": {
        "keystore": {
          "alias": "localhost", 
          "password": "password", 
          "type": "PKCS12", 
          "file": "/global/zowe/keystore/localhost/localhost.keystore.p12"
        }, 
        "pem": {
          "key": "/global/zowe/keystore/localhost/localhost.key", 
          "certificate": "/global/zowe/keystore/localhost/localhost.cer", 
          "certificateAuthorities": "/global/zowe/keystore/local_ca/local_ca.cer"
        }, 
        "truststore": {
          "password": "password", 
          "type": "PKCS12", 
          "file": "/global/zowe/keystore/localhost/localhost.truststore.p12"
        }
      }, 
      "cookieIdentifier": "1", 
      "verifyCertificates": "STRICT", 
      "setup": {
        "dataset": {
          "authLoadlib": "IBMUSER.ZWEV2.SZWEAUTH", 
          "proclib": "USER.PROCLIB", 
          "authPluginLib": "IBMUSER.ZWEV2.CUST.ZWESAPL", 
          "prefix": "IBMUSER.ZWEV2", 
          "parmlib": "IBMUSER.ZWEV2.CUST.PARMLIB", 
          "loadlib": "IBMUSER.ZWEV2.SZWELOAD", 
          "parmlibMembers": {
            "zis": "ZWESIP00"
          }, 
          "jcllib": "IBMUSER.ZWEV2.CUST.JCLLIB"
        }, 
        "certificate": {
          "type": "PKCS12", 
          "pkcs12": {
            "directory": "/var/zowe/keystore"
          }
        }, 
        "vsam": {
          "volume": "", 
          "mode": "NONRLS", 
          "storageClass": ""
        }
      }, 
      "externalDomains": [
        "sample-domain.com"
      ], 
      "externalPort": 7554, 
      "configmgr": {
        "validation": "COMPONENT-COMPAT"
      }, 
      "workspaceDirectory": "/global/zowe/workspace", 
      "runtimeDirectory": "", 
      "useConfigmgr": true
    }, 
    "components": {
      "metrics-service": {
        "debug": false, 
        "enabled": false, 
        "port": 7551
      }, 
      "zss": {
        "tls": true, 
        "enabled": true, 
        "crossMemoryServerName": "ZWESIS_STD", 
        "port": 7557, 
        "agent": {
          "jwt": {
            "fallback": true
          }
        }
      }, 
      "explorer-uss": {
        "enabled": true
      }, 
      "jobs-api": {
        "debug": false, 
        "enabled": false, 
        "port": 7558
      }, 
      "files-api": {
        "debug": false, 
        "enabled": false, 
        "port": 7559
      }, 
      "explorer-mvs": {
        "enabled": true
      }, 
      "cloud-gateway": {
        "debug": false, 
        "enabled": false, 
        "port": 7563
      }, 
      "explorer-jes": {
        "enabled": true
      }, 
      "api-catalog": {
        "debug": false, 
        "enabled": true, 
        "port": 7552
      }, 
      "gateway": {
        "debug": false, 
        "enabled": true, 
        "port": 7554, 
        "apiml": {
          "security": {
            "x509": {
              "enabled": false
            }, 
            "auth": {
              "zosmf": {
                "jwtAutoconfiguration": "auto", 
                "serviceId": "zosmf"
              }, 
              "provider": "zosmf"
            }, 
            "authorization": {
              "endpoint": {
                "enabled": false
              }, 
              "provider": ""
            }
          }
        }, 
        "server": {
          "internal": {
            "ssl": {
              "enabled": false
            }, 
            "enabled": false, 
            "port": 7550
          }
        }
      }, 
      "app-server": {
        "debug": false, 
        "enabled": true, 
        "port": 7556
      }, 
      "caching-service": {
        "debug": false, 
        "enabled": true, 
        "storage": {
          "evictionStrategy": "reject", 
          "size": 10000, 
          "infinispan": {
            "jgroups": {
              "port": 7600
            }
          }, 
          "mode": "VSAM", 
          "vsam": {
            "name": ""
          }
        }, 
        "port": 7555
      }, 
      "discovery": {
        "debug": false, 
        "enabled": true, 
        "port": 7553
      }
    }
  })
  const reduxSchema = useAppSelector(selectSchema);
  const [schema] = useState(typeof reduxSchema === "object" && Object.keys(reduxSchema).length > 0 ? reduxSchema : FALLBACK_SCHEMA);
  const [yaml, setLYaml] = useState(useAppSelector(selectYaml));
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [setupSchema, setSetupSchema] = useState(schema?.properties?.zowe?.properties?.setup?.properties?.dataset || FALLBACK_SCHEMA.properties?.zowe?.properties?.setup?.properties?.dataset);
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe?.setup?.dataset || FALLBACK_YAML?.zowe?.setup?.dataset);
  const [showProgress, setShowProgress] = useState(getProgress('datasetInstallationStatus'));
  const [isFormInit, setIsFormInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');
  const [contentType, setContentType] = useState('');
  const [mvsDatasetInitProgress, setMvsDatasetInitProgress] = useState(getDatasetInstallationState());
  const [stateUpdated, setStateUpdated] = useState(false);
  const [initClicked, setInitClicked] = useState(false);

  const [installationArgs, setInstArgs] = useState(useAppSelector(selectInstallationArgs));
  const version = useAppSelector(selectZoweVersion);
  let timer: any;
  const installationType = getInstallationTypeStatus().installationType;

  const section = 'dataset';
  // const initConfig = getConfiguration(section);

  const TYPE_YAML = "yaml";
  const TYPE_JCL = "jcl";
  const TYPE_OUTPUT = "output";

  const ajv = new Ajv();
  ajv.addKeyword("$anchor");
  let datasetSchema;
  let validate: any;
  if(schema) {
    datasetSchema = schema?.properties?.zowe?.properties?.setup?.properties?.dataset;
  }

  if(datasetSchema) {
    validate = ajv.compile(datasetSchema);
  }
  
  useEffect(() => {

    if(getProgress("datasetInstallationStatus")) {
      if(installationType !== 'smpe') {
        const nextPosition = document.getElementById('start-installation-progress');
        nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const nextPosition = document.getElementById('save-installation-progress');
        nextPosition.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
      }
    } else {
      const nextPosition = document.getElementById('container-box-id');
      nextPosition.scrollIntoView({behavior: 'smooth'});
    }

    window.electron.ipcRenderer.getConfigByKey("installationArgs").then((res: IResponse) => {
      if(res != undefined){
        // console.log("got installation args:", JSON.stringify(res));
        setInstArgs((res as any));
      }
    })

    setIsFormInit(true);

    window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
      function mergeInstallationArgsAndYaml(yaml: any){
        let yamlObj = JSON.parse(JSON.stringify(yaml));
        console.log('merging yaml obj:', JSON.stringify(yamlObj));
        delete yamlObj.installationArgs;
        if (installationArgs.installationDir) {
          yamlObj.zowe.runtimeDirectory = installationArgs.installationDir;
        }
        if (installationArgs.workspaceDir) {
          yamlObj.zowe.workspaceDirectory = installationArgs.workspaceDir;
        }
        if (installationArgs.logDir) {
          yamlObj.zowe.logDirectory = installationArgs.logDir;
        }
        if (installationArgs.extensionDir) {
          yamlObj.zowe.extensionDirectory = installationArgs.extensionDir;
        }
        if (installationArgs.rbacProfile) {
          yamlObj.zowe.rbacProfileIdentifier = installationArgs.rbacProfile;
        }
        if (installationArgs.jobName) {
          yamlObj.zowe.job.name = installationArgs.jobName;
        }
        if (installationArgs.jobPrefix) {
          yamlObj.zowe.job.prefix = installationArgs.jobPrefix;
        }
        if (installationArgs.cookieId) {
          yamlObj.zowe.cookieIdentifier = installationArgs.cookieId;
        }
        if (installationArgs.javaHome) {
          yamlObj.java.home = installationArgs.javaHome;
        }
        if (installationArgs.nodeHome) {
          yamlObj.node.home = installationArgs.nodeHome;
        }
        if (installationArgs.zosmfHost) {
          yamlObj.zOSMF.host = installationArgs.zosmfHost;
        }
        if (installationArgs.zosmfPort) {
          yamlObj.zOSMF.port = Number(installationArgs.zosmfPort);
        }
        if (installationArgs.zosmfApplId) {
          yamlObj.zOSMF.applId = installationArgs.zosmfApplId;
        }
        return yamlObj;
      }
      if(res.details.zowe === undefined){
        //for fallback scenario where user does NOT download or upload a pax and clicks "skip" on the installation stage. sets in redux but not on disk
        let yamlObj = mergeInstallationArgsAndYaml(FALLBACK_YAML);
        // console.log('setting yaml:', yamlObj);
        setLYaml(yamlObj)
        dispatch(setYaml(yamlObj))
      } else {
        // console.log('got config:', JSON.stringify(res.details));
        let yamlObj = mergeInstallationArgsAndYaml(res.details);
        if(res.details.zowe?.setup?.dataset === undefined){
          // console.log('setting yaml:',{...yamlObj, zowe: {...yamlObj.zowe, setup: {...yamlObj.zowe.setup, dataset: FALLBACK_YAML.zowe.setup.dataset}} });
          dispatch(setYaml({...yamlObj, zowe: {...yamlObj.zowe, setup: {...yamlObj.zowe.setup, dataset: FALLBACK_YAML.zowe.setup.dataset}} }));
        } else {
          dispatch(setYaml(yamlObj));
        }
      }
    })

    window.electron.ipcRenderer.getSchema().then((res: IResponse) => {
      if(res.details === undefined){
        //for fallback scenario where user does NOT download or upload a pax and clicks "skip" on the installation stage. sets in redux
        dispatch(setSchema(FALLBACK_SCHEMA));
      }
    })
    
    if(installationType === 'smpe') {
      const status = getProgress('datasetInstallationStatus');
      setStageSkipStatus(!status);
      setDsInstallStageStatus(status);
    } else {
      updateProgress(getProgress('datasetInstallationStatus'));
    }

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: SUB_STAGE_ID }));
    }
  }, []);

  useEffect(() => {
    setShowProgress(installationType!=='smpe' && (initClicked || getProgress('datasetInstallationStatus')));

    if(initClicked) {
      const nextPosition = document.getElementById('installation-progress');
      nextPosition.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setStateUpdated(!stateUpdated);
      dispatch(setDatasetInstallationStatus(false));
    }
  }, [initClicked]);

  useEffect(() => {
    const allAttributesTrue = Object.values(mvsDatasetInitProgress).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setNextStepEnabled(true));
      dispatch(setDatasetInstallationStatus(true));
      setShowProgress(installationType!=='smpe' && (initClicked || getProgress('datasetInstallationStatus')));
    }
  }, [mvsDatasetInitProgress]);

  useEffect(() => {
    if(!getProgress('datasetInstallationStatus') && initClicked) {
      timer = setInterval(() => {
        window.electron.ipcRenderer.getInstallationProgress().then((res: any) => {
          setMvsDatasetInitializationProgress(res);
        })
      }, 3000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [showProgress, stateUpdated]);

  const setMvsDatasetInitializationProgress = (datasetInitState: DatasetInstallationState) => {
    setMvsDatasetInitProgress(datasetInitState);
    setDatasetInstallationState(datasetInitState);
    const allAttributesTrue = Object.values(datasetInitState).every(value => value === true);
    if(allAttributesTrue) {
      dispatch(setNextStepEnabled(true));
      dispatch(setDatasetInstallationStatus(true));
    }
  }

  const setStageSkipStatus = (status: boolean) => {
    stages[stageId].subStages[subStageId].isSkipped = status;
    stages[stageId].isSkipped = status;
  }

  const setDsInstallStageStatus = (status: boolean) => {
    dispatch(setNextStepEnabled(status));
    dispatch(setInitializationStatus(status));
    dispatch(setDatasetInstallationStatus(status));
  }

  const updateProgress = (status: boolean) => {
    setStateUpdated(!stateUpdated);
    setStageSkipStatus(!status);
    if(!status) {
      for (let key in mvsDatasetInitProgress) {
        mvsDatasetInitProgress[key as keyof(DatasetInstallationState)] = false;
        setDatasetInstallationState(mvsDatasetInitProgress);
      }
    }
    const allAttributesTrue = Object.values(mvsDatasetInitProgress).every(value => value === true);
    status = allAttributesTrue ? true : false;
    setDsInstallStageStatus(status);
    setMvsDatasetInitializationProgress(getDatasetInstallationState());
  }

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const process = (event: any, skipDownload?: boolean) => {

    if(!(installationType === 'smpe')) {
      setInitClicked(true);
      updateProgress(false);
    }
    event.preventDefault();
    dispatch(setLoading(true));
    // FIXME: runtime dir is hardcoded, fix there and in InstallActions.ts - Unpax and Install functions

    if(installationType === 'smpe'){
      setStageSkipStatus(false);
      setDsInstallStageStatus(true);
      dispatch(setLoading(false));
      setShowProgress(false);
    } else {
      setYaml(window.electron.ipcRenderer.getConfig());
      setShowProgress(true);
      dispatch(setLoading(false));
      window.electron.ipcRenderer.installButtonOnClick(connectionArgs, installationArgs, version, setupYaml, skipDownload ?? false).then((res: IResponse) => {
        if(!res.status){ //errors during runInstallation()
          alertEmitter.emit('showAlert', res.details, 'error');
        }
        if(res.details?.mergedYaml != undefined){
          dispatch(setYaml(res.details.mergedYaml));
        }
        updateProgress(true);
        clearInterval(timer);
      }).catch(() => {
        clearInterval(timer);
        updateProgress(false);
      });
    }
  }

  const debouncedChange = useCallback(
    debounce((state: any)=>{handleFormChange(state)}, 1000),
    []
  )

  const handleFormChange = async (data: any, isYamlUpdated?: boolean) => {
    let updatedData = isFormInit ? (Object.keys(setupYaml).length > 0 ? setupYaml : data.zowe.setup.dataset) : (data.zowe?.setup?.dataset ? data.zowe.setup.dataset : data);
    
    setIsFormInit(false);

    if(validate) {
      validate(updatedData);
      if(validate.errors) {
        const errPath = validate.errors[0].schemaPath;
        const errMsg = validate.errors[0].message;
        setStageConfig(false, errPath+' '+errMsg, updatedData);
      } else {
        const newYaml = {...yaml, zowe: {...yaml.zowe, setup: {...yaml.zowe.setup, dataset: updatedData}}};
        window.electron.ipcRenderer.setConfig(newYaml)
        setStageConfig(true, '', updatedData);
      }
    }
  }

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setSetupYaml(data);
  }

  return (
    <div id="container-box-id">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View/Edit Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
      <ContainerCard title="Installation" description="Provide installation details."> 
        {editorVisible && <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>}
        <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap', marginBottom: '50px', color: 'text.secondary', fontSize: '13px' }}>
          {installationType === 'smpe' ? `Please input the corresponding values used during the SMPE installation process.` : `Ready to download Zowe ${version} and deploy it to the ${installationArgs.installationDir}\nThen we will install MVS data sets, please provide HLQ below\n`}
        </Typography>

        <Box sx={{ width: '60vw' }} onBlur={async () => dispatch(setYaml((await window.electron.ipcRenderer.getConfig()).details.config ?? yaml))}>
          {!isFormValid && formError && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
        </Box>
        {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>{installationType === 'smpe' ? 'Save' : 'Install MVS datasets'}</Button>
          {/* <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e, true)}>{installationType === 'smpe' ? 'Save' : 'SKIP DOWNLOAD and Install MVS datasets'}</Button> */}
        </FormControl> : null}
        <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : '0'}} id="start-installation-progress">
        {!showProgress ? null :
          <React.Fragment>
            <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={mvsDatasetInitProgress.uploadYaml}/>
            <ProgressCard label="Download convenience build pax locally" id="download-progress-card" status={mvsDatasetInitProgress.download}/>
            <ProgressCard label={`Upload pax file to ${installationArgs.installationDir}`} id="upload-progress-card" status={mvsDatasetInitProgress.upload}/>
            <ProgressCard label="Unpax installation files" id="unpax-progress-card" status={mvsDatasetInitProgress.unpax}/>
            <ProgressCard label="Run installation script (zwe install)" id="install-progress-card" status={mvsDatasetInitProgress.install}/>
            <ProgressCard label="Run MVS dataset initialization script (zwe init mvs)" id="install-progress-card" status={mvsDatasetInitProgress.initMVS}/>
            <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => process(e)}>{installationType === 'smpe' ? 'Save' : 'Reinstall MVS datasets'}</Button>
          </React.Fragment>
        }
        </Box>
        <Box sx={{ height: '0', minHeight: '0' }} id="save-installation-progress"></Box>
        <Box sx={{ height: showProgress ? '55vh' : 'auto', minHeight: '55vh' }} id="installation-progress"></Box>
      </ContainerCard>
    </div>
  );
};

export default Installation;