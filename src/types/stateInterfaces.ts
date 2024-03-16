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
    initializationStatus: boolean;
    datasetInstallationStatus: boolean;
    apfAuthStatus: boolean;
    securityStatus: boolean;
    certificateStatus: boolean;
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
  smpeDir: string;
  smpeDirValid: boolean;
  }

  export interface ActiveState {
    activeStepIndex: number,
    isSubStep: boolean,
    activeSubStepIndex: number,
    date?: string
  }









