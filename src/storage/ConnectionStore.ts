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

const storeSchema = {
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

const storeDefault = {
  "connection-type": "ftp",
  "zowe-cli-version": "",
  "ftp-details": {
    "host": "",
    "port": "21",
    "user": "",
    "jobStatement": `//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,
//         MSGLEVEL=(1,1),MSGCLASS=A`
  },
  "cli-details": {
    "profile": ""
  }
};

const validateWithSchema = (key: string): boolean => {
  const keys = key.split('.');
  let schemaPart: any = storeSchema;
  for (const key of keys) {
      if (!schemaPart.hasOwnProperty(key)) {
          return false;
      }
      schemaPart = schemaPart[key].properties;
  }
  return true;
}

const store = new Store({cwd: 'zen-connection-store', schema: storeSchema});
store.set({...storeDefault, ...store.store});

export class ConnectionStore {

  public static get(key: string): any {
    return store.get(key);
  }

  public static getAll(): any {
    return store.store;
  }

  public static set(key: string, value: string): boolean {
    if (validateWithSchema(key)) {
      store.set(key, value);
      return true;
    }
    return false;
  }

  public static delete(key: any): void {
    store.delete(key);
  }

  public static deleteAll(): void {
    store.store = storeDefault;
  }
}
