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

const store = new Store({cwd: 'zen-configuration-store'});

export class ConfigurationStore {
  static schema: any = {};

  private static validateWithSchema(key: string): boolean {
    const keys = key.split('.');
    const schema = store.get('schema') as any;
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

  public static setSchema(schema: any) {
    store.set('schema', schema);
  }

  public static getSchema(): any {
    return store.get('schema');
  }

  public static setConfig(value: any) {
    store.set('config', value);
  }

  public static getConfig() {
    return store.get(`config`);
  }

  public static getConfigByKey(key: string): any {
    return store.get(`config.${key}`);
  }

  public static getAll(): any {
    return store.store;
  }

  public static setConfigByKey(key: string, value: string | Array<string>): boolean {
    if (this.validateWithSchema(key)) {
      store.set(`config.${key}`, value);
      return true;
    }
    console.warn(`failed validate against schema config.${key}`);
    return false;
  }

  public static setConfigByKeyNoValidate(key: string, value: string | Array<string>): boolean {
    store.set(`config.${key}`, value);
    return true;
  }

  public static deleteConfigByKey(key: any): void {
    store.delete(`config.${key}`);
  }

  public static deleteAll(): void {
    store.store = {config: {}, schema: {}};
  }
}
