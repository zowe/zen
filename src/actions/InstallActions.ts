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
  mode: IIpcConnectionArgs["connectionType"];
  strategy: FTPInstallation | CLIInstallation;

  constructor() {
    this.mode = 'ftp'; // REVIEW: get from storage when picking strategy?
    this.strategy = this.getStartegy();
  }

  setMode(mode: IIpcConnectionArgs["connectionType"]) {
    this.mode = mode;
  }

  getStartegy(): FTPInstallation | CLIInstallation {
    switch (this.mode) {
      case 'ftp':
        return new FTPInstallation();
      case 'cli':
        return new CLIInstallation();
      default:
        throw new Error('Invalid type');
    }
  }

  runInitCertificates(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string, installationType: string}, zoweConfig: any){
      return this.strategy.initCertificates(connectionArgs, installationArgs, zoweConfig)
  }

  runInstallation (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: {installationDir: string, installationType: string, userUploadedPaxPath: string},
    version: string, zoweConfig: any, skipDownload: boolean): Promise<IResponse> {
    return this.strategy.runInstallation(connectionArgs, installationArgs, version, zoweConfig, skipDownload);
  }

  initSecurity(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string, installationType: string}, zoweConfig: object): Promise<IResponse> {
    return this.strategy.initSecurity(connectionArgs, installationArgs, zoweConfig);
  }

  initVsam(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string, installationType: string}, zoweConfig: object): Promise<IResponse> {
    return this.strategy.initVsam(connectionArgs, installationArgs, zoweConfig);
  }

  apfAuth(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string, installationType: string}, zoweConfig: object): Promise<IResponse> {
    return this.strategy.apfAuth(connectionArgs, installationArgs, zoweConfig);
  }

}