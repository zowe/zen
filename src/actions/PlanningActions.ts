/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { CheckENV } from "../services/CheckENV";
import { CheckJava } from "../services/CheckJava";
import { CheckNode } from "../services/CheckNode";
import { CheckSpace } from "../services/CheckSpace";
import { IIpcConnectionArgs, IResponse } from '../types/interfaces';
import { ConfigurationStore } from "../storage/ConfigurationStore";
import { parse } from 'yaml';
import * as https from 'https';
import { checkDirExists, makeDir } from '../services/utils'

export class PlanningActions {

  public static async getENV(connectionArgs: IIpcConnectionArgs): Promise<IResponse> {
    return await new CheckENV().run(connectionArgs);
  }

  public static async checkJava(connectionArgs: IIpcConnectionArgs, location: string): Promise<IResponse> {
    return await new CheckJava().run(connectionArgs, location);
  }

  public static async checkNode(connectionArgs: IIpcConnectionArgs, location: string): Promise<IResponse> {
    return await new CheckNode().run(connectionArgs, location);
  }

  public static async checkSpaceAndCreateDir(connectionArgs: IIpcConnectionArgs, location: string): Promise<IResponse> {
    await this.checkOrCreateDir(connectionArgs, location);
    return await new CheckSpace().run(connectionArgs, location);
  }

  public static async checkOrCreateDir(connectionArgs: IIpcConnectionArgs, location: string): Promise<IResponse> {
    const dirExists = await checkDirExists(connectionArgs, location);
    if (!dirExists) {
      const dirCreated = await makeDir(connectionArgs, location);
      if (!dirCreated) {
        return Promise.resolve({status: false, details: `Can't create dir ${location}`});
      } else {
        return Promise.resolve({status: true, details: `Directory successfully created at ${location}`});
      }
    } else {
      return Promise.resolve({status: true, details: `Directory already existed at ${location}`});
    }
  }
  
  public static getExampleZowe(): Promise<IResponse> {
    return new Promise((resolve, reject) => {
      https.get('https://raw.githubusercontent.com/zowe/zowe-install-packaging/v2.x/master/example-zowe.yaml', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = parse(data);
            ConfigurationStore.setConfig(parsedData);
            resolve({status: true, details: parsedData});
          } catch (error) {
            reject({status: false, details: {error}});
          }
        });
      }).on('error', (error) => {
        reject({status: false, details: {error}});
      });
    });
  }

  public static getZoweSchema(): Promise<IResponse> {
    return new Promise((resolve, reject) => {
      https.get('https://raw.githubusercontent.com/zowe/zowe-install-packaging/v2.x/master/schemas/zowe-yaml-schema.json', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            ConfigurationStore.setSchema(parsedData);
            resolve({status: true, details: parsedData});
          } catch (error) {
            reject({status: false, details: {error}});
          }
        });
      }).on('error', (error) => {
        reject({status: false, details: {error}});
      });
    });
  }

  public static async getConfig(): Promise<IResponse> {
    const details = ConfigurationStore.getAll();
    if (details.config && details.schema) {
      return {status: true, details};
    } else {
      return {status: false, details: ''};
    }
  }

  public static async getZoweVersion(): Promise<IResponse> {
    return new Promise<IResponse>((resolve, reject) => {
      https.get('https://raw.githubusercontent.com/zowe/zowe-install-packaging/v2.x/master/manifest.json.template', (res) => {
        let data = '';
  
        res.on('data', (chunk) => {
          data += chunk;
        });
  
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({ status: true, details: parsedData.version });
          } catch (error) {
            reject({ status: false, details: { error } });
          }
        });
  
      }).on('error', (error) => {
        reject({ status: false, details: { error } });
      });
    });
  }

public static async setConfigByKeyAndValidate(key: string, value: string | Array<string>): Promise<IResponse> {
    const status = ConfigurationStore.setConfigByKeyAndValidate(key, value);
    return {status, details: ''};
  }

}

