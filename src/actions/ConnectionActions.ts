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

export class ConnectionActions {
  mode: any;
  installStrategy: any;

  constructor() {
    this.mode = 'ftp'; // REVIEW: get from storage when picking installStrategy?
    this.installStrategy = this.getInstallStrategy();
  }

  setMode(mode: string) {
    this.mode = mode;
  }

  getInstallStrategy(): any {
    switch (this.mode) {
      case 'ftp':
        return new FTPConnection();
      case 'cli':
        return new CLIConnection();
      default:
        throw new Error('Invalid connection type');
    }
  }

  checkConnectionData(config: any) {
    return this.installStrategy.checkConnectionData(config);
  }

  saveConnectionData(config: any) {
    return this.installStrategy.saveConnectionData(config);
  }

  saveJobStatement(jobStatement: any) {
    return this.installStrategy.saveJobStatement(jobStatement);
  }
}
