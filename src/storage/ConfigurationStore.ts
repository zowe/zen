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

const store = new Store({cwd: 'zen-configuration-store'});

const schemaKey = 'schema'
const configKey = 'config'
const storeDefault = {config: {}, schema: {}};

export class ConfigurationStore extends DefaultStore {
  private static schema: any = {};
  private static config: any = {};

  public static setSchema(value: any): boolean {
    return this.set(schemaKey, value);
  }

  public static getSchema(): any {
    return this.get(schemaKey);
  }

  public static setConfig(value: any) {
    return this.set(configKey, value);
  }

  public static getConfig(): any {
    return this.get(configKey);
  }

  public static getConfigByKey(key: string): any {
    return this.get(`${configKey}.${key}`);
  }

  public static setConfigByKey(key: string, value: string | Array<string>): boolean {
    if (this.validateWithSchema(key)) {
      return this.set(`${configKey}.${key}`, value);
    }
    console.warn(`failed validate against schema ${configKey}.${key}`);
    return false;
  }

  public static deleteConfigByKey(key: any): void {
    this.delete(`${configKey}.${key}`);
  }

  public static deleteAll(): void {
    store.store = storeDefault;
  }
}
