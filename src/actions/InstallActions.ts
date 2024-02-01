/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { IIpcConnectionArgs, IResponse } from '../types/interfaces';
import { FTPInstallation, CLIInstallation } from './InstallationHandler';

export class InstallActions {
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
        return new FTPInstallation();
      case 'cli':
        return new CLIInstallation();
      default:
        throw new Error('Invalid type');
    }
  }

  runInstallation (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: {installationDir: string, installationType: string, userUploadedPaxPath: string, smpeDir: string},
    version: string, zoweConfig: any): Promise<IResponse> {
    return this.installStrategy.runInstallation(connectionArgs, installationArgs, version, zoweConfig);
  }

  runInitSecurity(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string}, zoweConfig: any): Promise<IResponse> {
    return this.installStrategy.runInitSecurity(connectionArgs, installationArgs, zoweConfig);
  }

  runApfAuth(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string}, zoweConfig: any): Promise<IResponse> {
    return this.installStrategy.runApfAuth(connectionArgs, installationArgs, zoweConfig);
  }

}