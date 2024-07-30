/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { ProgressState, PlanningState, InstallationType, ActiveState, DatasetInstallationState, InitSubStepsState, CertInitSubStepsState, PlanningValidationDetails, SkipState, InstallationArgs, DownloadUnpaxState } from "../../../../types/stateInterfaces";

export const initProgressStatus: ProgressState = {
  connectionStatus: false,
  planningStatus: false,
  installationTypeStatus: false,
  downloadUnpaxStatus: false,
  initializationStatus: false,
  datasetInstallationStatus: false,
  networkingStatus: false,
  apfAuthStatus: false,
  securityStatus: false,
  stcsStatus: false,
  certificateStatus: false,
  vsamStatus: false,
  launchConfigStatus: false,
  reviewStatus: false,
}

export const initInstallationTypeStatus: InstallationType = {
  installationType: 'download',
  licenseAgreement: false,
  userUploadedPaxPath: '',
}

export const initDownloadUnpaxStatus: DownloadUnpaxState = {
  uploadYaml: false,
  download: false,
  upload: false,
  unpax: false,
  getExampleYaml: false,
  getSchemas: false,
}

export const initActiveStatus: ActiveState = {
  activeStepIndex: 0,
  isSubStep: false,
  activeSubStepIndex: 0,
}

export const initPlanningStageStatus: PlanningState = {
  jobStatement: '',
  isJobStatementValid: false,
  isLocationValid: false,
}

export const initDatasetInstallationStatus: DatasetInstallationState = {
  uploadYaml: false,
  install: false,
  initMVS: false
}

const initSubStepsDefault: InitSubStepsState = {
  writeYaml: false,
  uploadYaml: false,
  success: false,
};

export const initApfAuthStatus: InitSubStepsState = { ...initSubStepsDefault };

export const initSecurityInitStatus: InitSubStepsState = { ...initSubStepsDefault };

export const initStcsInitStatus: InitSubStepsState = { ...initSubStepsDefault };

export const initVsamInitStatus: InitSubStepsState = { ...initSubStepsDefault };

export const initCertificateInitStatus: CertInitSubStepsState = {
  writeYaml: false,
  uploadYaml: false,
  zweInitCertificate: false
}

export const initPlanningValidationDetailsStatus: PlanningValidationDetails = {
  javaVersion: '',
  nodeVersion: '',
  spaceAvailableMb: '',
  error: ''
}

export const initStepSkipStatus: SkipState = {
  downloadUnpax: false,
  datasetInstallation: false,
  networking: false,
  apfAuth: false,
  security: false,
  certificate: false,
  vsam: false,
  launchConfig: false
}

export const initInstallationArgsStatus: InstallationArgs = {
  installationDir: '',
    workspaceDir: '',
    logDir:'',
    extensionDir:'',
    installationType: 'download',
    userUploadedPaxPath: '',
    downloadDir: '',
    javaHome: '',
    nodeHome: '',
    setupConfig: {},
    jobName: 'ZWE1SV',
    jobPrefix: 'ZWE1',
    rbacProfile: '1',
    cookieId: '1',
    zosmfHost: '',
    zosmfPort: '443',
    zosmfApplId: 'IZUDFLT',
    dryRunMode:false
}
