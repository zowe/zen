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

const storeSchema2 = {
  "patternProperties": {
    "^([^_]+_[^_]+)$": { // Regular expression to match keys with host and username separated by underscore
      "description": "Zowe Instance",
      "type": "object",
      "properties": {
        "jobStatementValidation": { "type": "boolean" },
        "locationValidation": { "type": "boolean" },
        "installationType": { "type": "string" },
        "installationLocation": { "type": "string" },
        "installation": { "type": "string" }
      }
    }
  }
}

const storeSchema3 = {
  "patternProperties": {
    "^([^_]+_[^_]+)$": { // Regular expression to match keys with host and username separated by underscore
      "description": "Zowe Instance",
      "type": "object",
      "properties": {
        "jobStatementValidation": { "type": "boolean" },
      }
    }
  }
}

const storeSchema = {
    "instance": { // Regular expression to match keys with host and username separated by underscore
      "description": "Zowe Instance",
      "type": "object",
      "properties": {
        "jobStatementValidation": { "type": "boolean" },
      }
    }
}

const validateWithSchema = (key: string): boolean => {
  const keys = key.split('.');
  let schemaPart: any = storeSchema;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(schemaPart, key)) {
      return false;
    }
    schemaPart = schemaPart[key].properties;
  }
  return true;
}

const store = new Store({cwd: 'zen-state-store'});
store.set({...store.store});

export class StateStore {

  public static get(key: string): any {
    return store.get(key);
  }
  
  public static getAll(): any {
    return store.store;
  }
  
  public static set(key: string, value: any): boolean {
  // if (validateWithSchema(key)) {
    store.set(key, value);
    return true;
  // }
  return false;
  }
  
  public static delete(key: any): void {
    store.delete(key);
  }
  
  public static deleteAll(): void {
    store.store = {};
  }
}