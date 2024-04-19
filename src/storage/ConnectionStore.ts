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
import { DEF_JOB_STATEMENT } from '../renderer/components/common/Utils';

const STORE_NAME = 'zen-connection-store';
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

export const STORE_DEFAULT = {
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
    "jobStatement": DEF_JOB_STATEMENT
  },
  "cli-details": {
    "profile": ""
  }
};

const store = new Store({cwd: 'zen-connection-store', schema: STORE_SCHEMA});
store.set({...STORE_DEFAULT, ...store.store});

export class ConnectionStore extends DefaultStore {

  protected static getStore(): Store {
    return new Store({cwd: STORE_NAME});
  }

  public static setAndValidate(key: string, value: any, schema?: any): boolean {
    return super.setAndValidate(key, value, schema || STORE_SCHEMA);
  }

  public static deleteAll(): void {
    this.getStore().store = STORE_DEFAULT;
  }

}