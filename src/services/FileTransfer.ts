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
import {connectFTPServer} from "./utils";
import {IIpcConnectionArgs} from "../types/interfaces";

const fs = require('fs');
const https = require('https');

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

  public async download_PAX(file: any, fullPath: string) {
    return new Promise(resolve => {
      const saveFile: NodeJS.WritableStream = fs.createWriteStream(fullPath);
      https.get(file, function (response: IncomingMessage) {
        response.pipe(saveFile);
        response.on('end', function () {
          resolve({status: true, details: ''}); 
        })
      })
    })
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
