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

const store = new Store({cwd: 'zen-default-store'});

// Note: This class is for other Stores to inherit (this is not a Store for "defaults")
export class DefaultStore {

  public static validateWithSchema(key: string): boolean {
    const keys = key.split('.');
    const schema = store.get('schema') as any;
    let schemaPart: any = schema?.properties;
    for (const key of keys) {
        if (!Object.prototype.hasOwnProperty.call(schemaPart, key)) {
            return false;
        }
        schemaPart = schemaPart[key].properties;        
    }
    return true;
  }

  public static get(key: string): any {
    return store.get(key);
  }

  public static getAll(): any {
    return store.store;
  }

  public static set(key: string, value: any): boolean {
    try {
      store.set(key, value);
      return true;
    } catch (err) {
      console.warn(`failed to add ${key} error: `, err);
      return false;
    }
  }

  public static setAndValidate(key: string, value: any): boolean {
    if (this.validateWithSchema(key)) {
      return this.set(key, value);
    }
    console.warn(`failed validate against schema config.${key}`);
    return false;
  }

  public static delete(key: any): void {
    store.delete(key);
  }

  public static deleteAll(): void {
    store.clear();
  }
}
