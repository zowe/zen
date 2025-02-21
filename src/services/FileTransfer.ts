/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import {IncomingMessage} from "http";
import {connectFTPServer} from "./ServiceUtils";
import {IIpcConnectionArgs, IResponse} from "../types/interfaces";

import * as fs from 'fs';
import * as https from 'https';

export enum DataType {
  ASCII = 'ascii',
  BINARY = 'binary'
}

export class FileTransfer {

  public async download(config: IIpcConnectionArgs, file: any, data: DataType = DataType.ASCII) {
    const connection = await connectFTPServer(config);
    const downFile = await connection.getDataset(file, data);
    connection.close();
    return downFile.toString();
  }

  public async downloadPax(file: any, fullPath: string): Promise<IResponse> {
  return new Promise((resolve, reject) => {
    const saveFile: NodeJS.WritableStream = fs.createWriteStream(fullPath);
    let currentUrl = file;
    const makeRequest = () => {
      https.get(currentUrl, (response: IncomingMessage) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            currentUrl = redirectUrl;
            makeRequest();
          } else {
            reject(new Error("Redirect URL is missing in the Location header"));
          }
        } else if (response.statusCode === 200) {
          response.pipe(saveFile);
          response.on('end', function () {
            resolve({ status: true, details: '' });
          });
        } else {
          reject(new Error(`Failed with status code: ${response.statusCode}`));
        }
      }).on('error', (err) => {
        reject(err);
      });
    };
    makeRequest();
  });
}


  public async upload(config: IIpcConnectionArgs, file: string, fullPath: string, data: DataType = DataType.ASCII) {
    let result;
    const connection = await connectFTPServer(config);
    if (data === DataType.ASCII) {
      result = await connection.uploadDataset(file, fullPath, data)
    } else {
      const input = fs.readFileSync(file);
      result = await connection.uploadDataset(input, fullPath, data)
    }
    connection.close()
    return {status: true, details: ''} // REVIEW: undefined
  }

}
