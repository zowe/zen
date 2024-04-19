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

const STORE_NAME = 'zen-configuration-store';
const KEY_SCHEMA = 'schema'
const KEY_CONFIG = 'config'
const STORE_DEFAULT = {config: {}, schema: {}};

export class ConfigurationStore extends DefaultStore {

  protected static getStore(): Store {
    return new Store({cwd: STORE_NAME});
  }

  public static setSchema(value: any): boolean {
    return this.set(KEY_SCHEMA, value);
  }

  public static getSchema(): any {
    return this.get(KEY_SCHEMA);
  }

  public static setConfig(value: any) {
    return this.set(KEY_CONFIG, value);
  }

  public static getConfig(): any {
    return this.get(KEY_CONFIG);
  }

  public static getConfigByKey(key: string): any {
    return this.get(`${KEY_CONFIG}.${key}`);
  }

  public static setConfigByKeyAndValidate(key: string, value: string | Array<string>, schema?: any): boolean {
    if (!schema) {
      schema = this.getSchema();
    }
    let schemaPart: any = schema?.properties;
    return this.setAndValidate(key, value, schemaPart);
  }

  public static deleteConfigByKey(key: any): void {
    this.delete(`${KEY_CONFIG}.${key}`);
  }

  public static deleteAll(): void {
    this.getStore().store = STORE_DEFAULT;
  }
}