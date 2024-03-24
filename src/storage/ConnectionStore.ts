/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import Store from 'electron-store';
import { DefaultStore } from './DefaultStore';

const STORE_NAME = 'zen-connection-store';
const STORE: any = new Store({cwd: STORE_NAME});
const STORE_SCHEMA = {
  "connection-type": {
    "type": "string"
  },
  "zowe-cli-version": {
    "type": "string"
  },
  "ftp-details": {
    "description": "FTP connection details",
    "type": "object",
    "properties": {
      "host": {
        "type": "string"
      },
      "port": {
        "type": "string"
      },
      "user": {
        "type": "string"
      },
      "jobStatement": {
        "type": "string"
      },
      "secure": {
        "type": "boolean"
      },
      "secureOptions": {
        "type": "object",
        "properties": {
          "enableTrace": {
            "type": "boolean",
          },
          "rejectUnauthorized": {
            "type": "boolean"
          },
          "minVersion": {
            "type": "string"
          },
          "maxVersion": {
            "type": "string"
          }
        }
      }
    },
  },
  "cli-details": {
    "description": "Zowe CLI connection details",
    "type": "object",
    "properties": {
      "profile": {
        "type": "string"
      }
    }
  }
} as const;

const STORE_DEFAULT = {
  "connection-type": "ftp",
  "zowe-cli-version": "",
  "ftp-details": {
    "host": "",
    "port": "21",
    "user": "",
    "secure": false,
    "secureOptions": {
      "enableTrace": false,
      "rejectUnauthorized": true,
      "maxVersion": "TLSv1.3",
      "minVersion": "TLSv1.2"
    },    
    "jobStatement": `//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,
//         MSGLEVEL=(1,1),MSGCLASS=A`
  },
  "cli-details": {
    "profile": ""
  }
};

export class ConnectionStore extends DefaultStore {

  public static setAndValidate(key: string, value: any, schema?: any): boolean {
    return super.setAndValidate(key, value, schema || STORE_SCHEMA);
  }

  public static deleteAll(): void {
    STORE.store = STORE_DEFAULT;
  }

}

