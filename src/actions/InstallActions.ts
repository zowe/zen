/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { InstallationArgs } from '../types/stateInterfaces';
import { IIpcConnectionArgs, IResponse } from '../types/interfaces';
import { FTPInstallation, CLIInstallation } from './InstallationHandler';

export class InstallActions {
  mode: IIpcConnectionArgs["connectionType"];
  strategy: FTPInstallation | CLIInstallation;

  constructor() {
    this.mode = 'ftp'; // REVIEW: get from storage when picking strategy?
    this.strategy = this.getStrategy();
  }

  setMode(mode: IIpcConnectionArgs["connectionType"]) {
    this.mode = mode;
  }

  getStrategy(): FTPInstallation | CLIInstallation {
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
    installationArgs: InstallationArgs, zoweConfig: any){
      return this.strategy.initCertificates(connectionArgs, installationArgs, zoweConfig)
  }

  downloadUnpax(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs,
    version: string, zoweConfig: any): Promise<IResponse> {
    return this.strategy.downloadUnpax(connectionArgs, installationArgs, version, zoweConfig);
  }

  runInstallation (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: InstallationArgs,
    version: string, zoweConfig: any ): Promise<IResponse> {
    return this.strategy.runInstallation(connectionArgs, installationArgs, version, zoweConfig);
  }

  runInitSecurity(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs, zoweConfig: object): Promise<IResponse> {
    return this.strategy.runInitSecurity(connectionArgs, installationArgs, zoweConfig);
  }

  initVsam(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs, zoweConfig: object): Promise<IResponse> {
    return this.strategy.initVsam(connectionArgs, installationArgs, zoweConfig);
  }

  runApfAuth(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs, zoweConfig: object): Promise<IResponse> {
    return this.strategy.runApfAuth(connectionArgs, installationArgs, zoweConfig);
  }

}