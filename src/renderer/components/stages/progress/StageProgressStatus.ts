/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { flatten, unflatten } from 'flat';
import { ProgressState, PlanningState, InstallationType, ActiveState, DatasetInstallationState, InitSubStepsState, CertInitSubStepsState, PlanningValidationDetails} from '../../../../types/stateInterfaces';

const installationTypeStatus: InstallationType = {
  installationType: 'download',
  licenseAgreement: false,
  userUploadedPaxPath: '',
} 

const progressStatus: ProgressState = {
  connectionStatus: false,
  planningStatus: false,
  installationTypeStatus: false,
  initializationStatus: false,
  datasetInstallationStatus: false,
  networkingStatus: false,
  apfAuthStatus: false,
  securityStatus: false,
  certificateStatus: false,
  launchConfigStatus: false,
  reviewStatus: false,
}

const activeStatus: ActiveState = {
  activeStepIndex: 0,
  isSubStep: false,
  activeSubStepIndex: 0,
};

const planningStageStatus: PlanningState = {
  jobStatement: '',
  isJobStatementValid: false,
  isLocationValid: false,
}

const datasetInstallationStatus: DatasetInstallationState = {
  uploadYaml: false,
  download: false,
  upload: false,
  unpax: false,
  install: false,
  initMVS: false
}

const apfAuthStatus: InitSubStepsState = {
  writeYaml: false,
  uploadYaml: false,
  success: false
}

const securityInitStatus: InitSubStepsState = {
  writeYaml: false,
  uploadYaml: false,
  success: false
}

const certificateInitStatus: CertInitSubStepsState = {
  writeYaml: false,
  uploadYaml: false,
  zweInitCertificate: false
}

const planningValidationDetailsStatus: PlanningValidationDetails = {
  javaVersion: '',
  nodeVersion: '',
  spaceAvailableMb: '',
  error: ''
}

let progressStateKey = 'stage_progress';
let activeStateKey = 'active_state';
let planningStateKey = 'planning_stage';
let installationTypeKey = 'installation_type';
let datasetInstallationKey = 'dataset_installation';
let apfAuthKey = 'apf_auth';
let securityKey = 'security_init';
let certificateKey = 'certificate_init';
let planningValidationDetailsKey = `planning_validation_details`;
let prevInstallationKey = `prev_installation`;
let wizardStagesKey = `wizard_stages`;

const setKeys = (id: string) => {
  progressStateKey = `${progressStateKey}_${id}`;
  activeStateKey = `${activeStateKey}_${id}`;
  planningStateKey = `${planningStateKey}_${id}`;
  installationTypeKey = `${installationTypeKey}_${id}`;
  datasetInstallationKey = `${datasetInstallationKey}_${id}`;
  apfAuthKey = `${apfAuthKey}_${id}`;
  securityKey = `${securityKey}_${id}`;
  certificateKey = `${certificateKey}_${id}`;
  planningValidationDetailsKey = `${planningValidationDetailsKey}_${id}`;
  wizardStagesKey = `${wizardStagesKey}_${id}`;
}

export const initializeProgress = (host: string, user: string) => {
  const id = `${host}_${user}`;
  setKeys(id);

  const progress = localStorage.getItem(progressStateKey);
  if(!progress) {
    const flattenedData = flatten(progressStatus);
    localStorage.setItem(progressStateKey, JSON.stringify(flattenedData));
  }

  const activeStage = localStorage.getItem(activeStateKey);
  if(!activeStage) {
    const flattenedData = flatten(activeStatus);
    localStorage.setItem(activeStateKey, JSON.stringify(flattenedData));
  }

  const planningState = localStorage.getItem(planningStateKey);
  if(!planningState) {
    const flattenedData = flatten(planningStageStatus);
    localStorage.setItem(planningStateKey, JSON.stringify(flattenedData));
  }

  const installationTypeState = localStorage.getItem(installationTypeKey);
  if(!installationTypeState) {
    const flattenedData = flatten(installationTypeStatus);
    localStorage.setItem(installationTypeKey, JSON.stringify(flattenedData));
  }

  const datasetInstallationState = localStorage.getItem(datasetInstallationKey);
  if(!datasetInstallationState) {
    const flattenedData = flatten(datasetInstallationStatus);
    localStorage.setItem(datasetInstallationKey, JSON.stringify(flattenedData));
  }

  const apfAuthState = localStorage.getItem(apfAuthKey);
  if(!apfAuthState) {
    const flattenedData = flatten(apfAuthStatus);
    localStorage.setItem(apfAuthKey, JSON.stringify(flattenedData));
  }

  const securityInitState = localStorage.getItem(securityKey);
  if(!securityInitState) {
    const flattenedData = flatten(securityInitStatus);
    localStorage.setItem(securityKey, JSON.stringify(flattenedData));
  }

  const certificateInitState = localStorage.getItem(certificateKey);
  if(!certificateInitState) {
    const flattenedData = flatten(certificateInitStatus);
    localStorage.setItem(certificateKey, JSON.stringify(flattenedData));
  }

  const planningValidationDetailsState = localStorage.getItem(certificateKey);
  if(!planningValidationDetailsState) {
    const flattenedData = flatten(planningValidationDetailsStatus);
    localStorage.setItem(planningValidationDetailsKey, JSON.stringify(flattenedData));
  }

  // const wizardStages = localStorage.getItem(wizardStagesKey);
  // if(!wizardStages) {
  //   const flattenedData = flatten(wizardStages);
  //   localStorage.setItem(wizardStages, JSON.stringify(flattenedData));
  // }
}

export const setPlanningValidationDetailsState = (planningValidationsDetails: PlanningValidationDetails): void => {
  Object.assign(planningValidationDetailsStatus, planningValidationsDetails);
  localStorage.setItem(planningValidationDetailsKey, JSON.stringify(planningValidationDetailsStatus));
}

export const getPlanningValidationDetailsState = (): PlanningValidationDetails => {
  const planningValidationDetailsState = localStorage.getItem(planningValidationDetailsKey);
  if(planningValidationDetailsState) {
    const flattenedData = JSON.parse(planningValidationDetailsState);
    return unflatten(flattenedData)
  } else {
    return planningValidationDetailsStatus;
  }
}

export const setApfAuthState = (apfAuthSteps: InitSubStepsState): void => {
  Object.assign(apfAuthStatus, apfAuthSteps);
  localStorage.setItem(apfAuthKey, JSON.stringify(apfAuthStatus));
}

export const getApfAuthState = (): InitSubStepsState => {
  const apfAuthState = localStorage.getItem(apfAuthKey);
  if(apfAuthState) {
    const flattenedData = JSON.parse(apfAuthState);
    return unflatten(flattenedData);
  } else {
    return apfAuthStatus;
  }
};

export const setSecurityInitState = (securityInitSteps: InitSubStepsState): void => {
  Object.assign(securityInitStatus, securityInitSteps);
  localStorage.setItem(securityKey, JSON.stringify(securityInitStatus));
}

export const getSecurityInitState = (): InitSubStepsState => {
  const securityInitState = localStorage.getItem(securityKey);
  if(securityInitState) {
    const flattenedData = JSON.parse(securityInitState);
    return unflatten(flattenedData)
  } else {
    return securityInitStatus;
  }
}

export const setCertificateInitState = (certificateInitSteps: CertInitSubStepsState): void => {
  Object.assign(certificateInitStatus, certificateInitSteps);
  localStorage.setItem(certificateKey, JSON.stringify(certificateInitStatus));
}

export const getCertificateInitState = (): CertInitSubStepsState => {
  const certificateInitState = localStorage.getItem(certificateKey);
  if(certificateInitState) {
    const flattenedData = JSON.parse(certificateInitState);
    return unflatten(flattenedData)
  } else {
    return certificateInitStatus;
  }
}

export const setDatasetInstallationState = (dsInstallSteps: DatasetInstallationState): void => {
  Object.assign(datasetInstallationStatus, dsInstallSteps);
  localStorage.setItem(datasetInstallationKey, JSON.stringify(datasetInstallationStatus));
}

export const getDatasetInstallationState = (): DatasetInstallationState => {
  const datasetInstallationState = localStorage.getItem(datasetInstallationKey);
  if(datasetInstallationState) {
    const flattenedData = JSON.parse(datasetInstallationState);
    return unflatten(flattenedData)
  } else {
    return datasetInstallationStatus;
  }
}

export const setInstallationTypeStatus = <K extends keyof InstallationType>(key: K, newValue: InstallationType[K]): void => {
  const installationData = localStorage.getItem(installationTypeKey);
  if (installationData) {
    const flattenedData = JSON.parse(installationData);
    const unFlattenedData = unflatten(flattenedData) as InstallationType;
    Object.assign(installationTypeStatus, unFlattenedData);
  }
  installationTypeStatus[key] = newValue;
  const flattenedData = flatten(installationTypeStatus);
  localStorage.setItem(installationTypeKey, JSON.stringify(flattenedData));
}

export const getInstallationTypeStatus = (): InstallationType => {
  const installationTypeState = localStorage.getItem(installationTypeKey);
  if(installationTypeStatus) {
    const flattenedData = JSON.parse(installationTypeState);
    return unflatten(flattenedData)
  } else {
    return installationTypeStatus;
  }
}

export const setPlanningStageStatus = <K extends keyof PlanningState>(key: K, newValue: PlanningState[K]): void => {
  const planningData = localStorage.getItem(planningStateKey);
  if (planningData) {
    const flattenedData = JSON.parse(planningData);
    const unFlattenedData = unflatten(flattenedData) as PlanningState;
    Object.assign(planningStageStatus, unFlattenedData);
  }
  planningStageStatus[key] = newValue;
  const flattenedData = flatten(planningStageStatus);
  localStorage.setItem(planningStateKey, JSON.stringify(flattenedData));
}

export const getPlanningStageStatus = (): PlanningState => {
  const planningStatus = localStorage.getItem(planningStateKey);
  if(planningStatus) {
    const flattenedData = JSON.parse(planningStatus);
    return unflatten(flattenedData);
  } else {
    return planningStageStatus;
  }
}

export const setProgress = (key: keyof ProgressState, newValue: boolean): void => {
  const progress = localStorage.getItem(progressStateKey);
  if (progress) {
    const flattenedData = JSON.parse(progress);
    const unFlattenedData = unflatten(flattenedData) as ProgressState;
    Object.assign(progressStatus, unFlattenedData);
  }
  progressStatus[key] = newValue;
  const flattenedData = flatten(progressStatus);
  localStorage.setItem(progressStateKey, JSON.stringify(flattenedData));
}

export const getProgress = (key: keyof ProgressState): boolean => {
  const progress = localStorage.getItem(progressStateKey);
  if(progress) {
    const flattenedData = JSON.parse(progress);
    const unFlattenedData = unflatten(flattenedData) as ProgressState;
    return unFlattenedData[key];
  } else {
    return progressStatus[key];
  }
}

export const getCompleteProgress = () : ProgressState => {
  const progress = localStorage.getItem(progressStateKey);
  if(progress) {
    const flattenedData =  JSON.parse(progress);
    return unflatten(flattenedData);
  } else {
    return progressStatus;
  }
}

export const setActiveStage = (stageId: number, isSubStage: boolean, date: string, subStageId?: number): void => {
  activeStatus.activeStepIndex = stageId;
  activeStatus.isSubStep = isSubStage;
  activeStatus.lastActiveDate = date;

  if(!isSubStage) {
    activeStatus.activeSubStepIndex = 0;
  } else {
    activeStatus.activeSubStepIndex = subStageId;
  }
  
  const flattenedData = flatten(activeStatus);
  localStorage.setItem(activeStateKey, JSON.stringify(flattenedData));
  localStorage.setItem(prevInstallationKey, JSON.stringify(flattenedData));
}

export const getActiveStage = () : ActiveState => {
  const activeStage = localStorage.getItem(activeStateKey);
  if(activeStage) {
    const flattenedData = JSON.parse(activeStage);
    return unflatten(flattenedData);
  } else {
    return activeStatus;
  }
}

export const getPreviousInstallation = () : ActiveState => {
  const activeStage = localStorage.getItem(prevInstallationKey);
  if(activeStage) {
    const flattenedData = JSON.parse(activeStage);
    return unflatten(flattenedData);
  } else {
    return activeStatus;
  }
}

export const setWizardStages = (stages: any[]): void => {
  localStorage.setItem(wizardStagesKey, JSON.stringify(flatten(stages)));
}

export const getWizardStages = (): any => {
  const wizardStages = localStorage.getItem(wizardStagesKey);
  if(wizardStages) {
    const flattenedData = JSON.parse(wizardStages);
    return unflatten(flattenedData);
  } else {
    return null;
  }
}


