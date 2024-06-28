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
    installationArgs: InstallationArgs){
      return this.strategy.initCertificates(connectionArgs, installationArgs)
  }

  downloadUnpax(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs,
    version: string): Promise<IResponse> {
    return this.strategy.downloadUnpax(connectionArgs, installationArgs, version);
  }

  runInstallation (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: InstallationArgs): Promise<IResponse> {
    return this.strategy.runInstallation(connectionArgs, installationArgs);
  }

  runInitSecurity(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse> {
    return this.strategy.runInitSecurity(connectionArgs, installationArgs);
  }

  uploadLatestYaml(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse> {
    return this.strategy.uploadLatestYaml(connectionArgs, installationArgs);
  }

  smpeGetExampleYamlAndSchemas(connectionArgs: IIpcConnectionArgs, installArgs: InstallationArgs): Promise<IResponse> {
    return this.strategy.getExampleYamlAndSchemas(connectionArgs, installArgs);
  }

  initStcs(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse> {
    return this.strategy.initStcs(connectionArgs, installationArgs);
  }

  initVsam(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse> {
    return this.strategy.initVsam(connectionArgs, installationArgs);
  }

  runApfAuth(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse> {
    return this.strategy.runApfAuth(connectionArgs, installationArgs);
  }

}