/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

export interface ProgressState {
  connectionStatus: boolean;
  planningStatus: boolean;
  installationTypeStatus: boolean;
  downloadUnpaxStatus: boolean;
  initializationStatus: boolean;
  datasetInstallationStatus: boolean;
  networkingStatus: boolean;
  apfAuthStatus: boolean;
  securityStatus: boolean;
  stcsStatus: boolean;
  certificateStatus: boolean;
  vsamStatus: boolean;
  launchConfigStatus: boolean;
  reviewStatus: boolean;
}

export interface PlanningState {
  jobStatement: string;
  isJobStatementValid: boolean;
  isLocationValid: boolean;
}

export interface InstallationType {
  installationType: string;
  licenseAgreement: boolean;
  userUploadedPaxPath: string;
}

export interface DownloadUnpaxState {
  uploadYaml: boolean;
  download: boolean,
  upload: boolean,
  unpax: boolean,
  getExampleYaml: boolean,
  getSchemas: boolean
}

export interface ActiveState {
  activeStepIndex: number,
  isSubStep: boolean,
  activeSubStepIndex: number,
  lastActiveDate?: string,
  host?: string,
  user?: string
}

export interface DatasetInstallationState {
  uploadYaml: boolean,
  install: boolean,
  initMVS: boolean
}

export interface InitSubStepsState {
  writeYaml: boolean,
  uploadYaml: boolean,
  success: boolean
}

export interface CertInitSubStepsState {
  writeYaml: boolean,
  uploadYaml: boolean,
  zweInitCertificate: boolean
}

export interface PlanningValidationDetails {
  javaVersion: string,
  nodeVersion: string,
  spaceAvailableMb: string,
  error: string
}

export interface stepSkipState {
  planning: boolean,
  installationType: boolean,
  unpax: boolean,
  initialization: boolean,
  reviewInstallation: boolean
}

export interface subStepState {
  datasetInstallation: boolean,
  networking: boolean,
  apfAuth: boolean,
  security: boolean,
  stcs: boolean,
  certificate: boolean,
  vsam: boolean,
  launchConfig: boolean
}

export interface InstallationArgs {
  installationDir: string;
  workspaceDir: string;
  logDir: string,
  extensionDir: string,
  installationType?: string;
  downloadDir: string;
  userUploadedPaxPath?: string;
  javaHome: string;
  nodeHome: string;
  setupConfig: any;
  jobName: string;
  jobPrefix: string;
  rbacProfile: string;
  cookieId: string;
  zosmfHost: string,
  zosmfPort: string,
  zosmfApplId: string,
  dryRunMode: boolean,
}






