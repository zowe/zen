/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { FTPConnection, CLIConnection } from './ConnectionHandler'
import { IIpcConnectionArgs } from '../types/interfaces';

export class ConnectionActions {
  mode: IIpcConnectionArgs["connectionType"];
  strategy: FTPConnection | CLIConnection;

  constructor() {
    this.mode = 'ftp'; // REVIEW: get from storage when picking strategy?
    this.strategy = this.getStartegy();
  }

  setMode(mode: IIpcConnectionArgs["connectionType"]) {
    this.mode = mode;
  }

  getStartegy(): FTPConnection | CLIConnection {
    switch (this.mode) {
      case 'ftp':
        return new FTPConnection();
      case 'cli':
        return new CLIConnection();
      default:
        throw new Error('Invalid connection type');
    }
  }

  checkConnectionData(config: IIpcConnectionArgs) {
    return this.strategy.checkConnectionData(config);
  }

  saveConnectionData(config: IIpcConnectionArgs) {
    return this.strategy.saveConnectionData(config);
  }

  saveJobStatement(jobStatement: string) {
    return this.strategy.saveJobStatement(jobStatement);
  }

  getJobStatement(){
    return this.strategy.getJobStatement();
  }
}
