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

// Note: This default class is for other Stores to inherit (this is not a Store for "defaults")
export class DefaultStore {

  // This method is intended to be overridden by subclasses
  protected static getStore(): Store {
    return new Store({cwd: STORE_NAME});
  }

  public static validateWithSchema(key: string, schema: any): boolean {
    const keys = key.split('.');
    let schemaPart = schema;
    for (const key of keys) {
        if (!Object.prototype.hasOwnProperty.call(schemaPart, key)) {
            return false;
        }
        schemaPart = schemaPart[key].properties;        
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
      this.getStore().set(key, value);
      return true;
    } catch (err) {
      console.warn(`failed to add ${key} error: `, err);
      return false;
    }
  }

  public static setAndValidate(key: string, value: any, schema: any): boolean {
    if (this.validateWithSchema(key, schema)) {
      return this.set(key, value);
    }
    console.warn(`failed validate against schema config.${key}`);
    return false;
  }

  public static delete(key: any): void {
    this.getStore().delete(key);
  }

  public static deleteAll(): void {
    this.getStore().clear();
  }
}