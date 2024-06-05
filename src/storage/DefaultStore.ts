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

const STORE_NAME = 'zen-default-store';

// This default class is for other Stores to inherit (this is not a Store for "defaults")
export class DefaultStore {

  /* Note: All Stores that inherit DefaultStore must: 
  a) override this method with store name 
  b) use only this method to reference store object */
  protected static getStore(): Store {
    return new Store({cwd: STORE_NAME});
  }

  public static validateWithSchema(key: string, schemaKey: any): boolean {
    const keys = key.split('.');
    const schema = this.getStore().get(schemaKey) as any;
    if(schema && schema.properties){
      let schemaPart: any = schema?.properties || undefined;
      for (const key of keys) {
        if (schemaPart != undefined && !Object.prototype.hasOwnProperty.call(schemaPart, key)) {
            return false;
        }
        if(schemaPart[key].properties){
          schemaPart = schemaPart[key]?.properties || undefined;
        } else {
          return true;
        }
      }
      return true;
    }
    return true;
  }

  public static get(key: string): any {
    return this.getStore().get(key);
  }

  public static getAll(): any {
    return this.getStore().store;
  }

  public static set(key: string, value: any): boolean {
    try {
      if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
        console.warn(`Attempted to overwrite ${key} with undefined, function, or symbol`);
      } else {
        this.getStore().set(key, value);
      }
      return true;
    } catch (err) {
      console.warn(`Failed to add ${key} Error: `, err);
      return false;
    }
  }

  public static setAndValidate(key: string, value: any, schema: any): boolean {
    if (this.validateWithSchema(key, schema)) {
      return this.set(key, value);
    }
    console.warn(`Failed to validate against schema config.${key}`);
    return false;
  }

  public static delete(key: any): void {
    this.getStore().delete(key);
  }

  public static deleteAll(): void {
    this.getStore().clear();
  }
}