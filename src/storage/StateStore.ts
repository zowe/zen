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
  "jobStatementValidation": { "type": "boolean" },
  // "locationValidation": { "type": "boolean" },
  // "installationType": { "type": "string" },
  // "installationLocation": { "type": "string" },
  // "installation": { "type": "string" }
}

const storeDefault = {
  "jobStatementValidation": false,
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

const getKey = (host: string, username: string) => `${host}_${username}`;

const store = new Store({cwd: 'zen-state-store'});
store.set({...storeDefault, ...store.store});

export class StateStore {

  public static get(host: string, username: string): any {
    const key = getKey(host, username);
    return store.get(key);
  }
  
  public static getAll(): any {
    return store.store;
  }
  
  public static set(host: string, username: string, value: any): boolean {
    const key = getKey(host, username);
    if (validateWithSchema(key)) {
      store.set(key, value);
      return true;
    }
    return false;
  }
  
  public static delete(host: string, username: string): void {
    const key = getKey(host, username);
    store.delete(key);
  }
  
  public static deleteAll(): void {
    store.store = {};
  }
}