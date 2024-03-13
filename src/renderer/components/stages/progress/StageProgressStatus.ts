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
import { ProgressState } from "./progressSlice"; 
import { ActiveState } from './activeStepSlice'

export interface PlanningState {
  isJobStatementValid: boolean;
  isLocationValid: boolean;
}

export interface Job {
  jobStatement: string;
}

export interface InstallationType {
  installationType: string;
  licenseAgreement: boolean;
  userUploadedPaxPath: string;
  smpeDir: string;
  smpeDirValid: boolean;
}

const installationTypeStatus: InstallationType = {
  installationType: 'download',
  licenseAgreement: false,
  userUploadedPaxPath: '',
  smpeDir: '',
  smpeDirValid: false
} 

const progressStatus: ProgressState = {
  connectionStatus: false,
  planningStatus: false,
  installationTypeStatus: false,
  initializationStatus: false,
  datasetInstallationStatus: false,
  apfAuthStatus: false,
  securityStatus: false,
  certificateStatus: false,
  reviewStatus: false,
}

const activeStatus: ActiveState = {
  activeStepIndex: 0,
  isSubStep: false,
  activeSubStepIndex: 0,
};

const planningStageStatus: PlanningState = {
  isJobStatementValid: false,
  isLocationValid: false
}

const jobStatus: Job = {
  jobStatement: ''
}

let progressStateKey = 'stage_progress';
let activeStateKey = 'active_state';
let planningStateKey = 'planning_stage';
let jobKey = 'job';
let installationTypeKey = 'installation_type';

const setKeys = (id: string) => {
  progressStateKey = `${progressStateKey}_${id}`;
  activeStateKey = `${activeStateKey}_${id}`;
  planningStateKey = `${planningStateKey}_${id}`;
  jobKey = `${jobKey}_${id}`;
  installationTypeKey = `${installationTypeKey}_${id}`
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

  const jobState = localStorage.getItem(jobKey);
  if(!jobState) {
    const flattenedData = flatten(jobStatus);
    localStorage.setItem(jobKey, JSON.stringify(flattenedData));
  }

  const installationTypeState = localStorage.getItem(installationTypeKey);
  if(!installationTypeState) {
    const flattenedData = flatten(installationTypeStatus);
    localStorage.setItem(installationTypeKey, JSON.stringify(flattenedData));
  }
}

export const setInstallationTypeStatus = <K extends keyof InstallationType>(key: K, newValue: InstallationType[K]): void => {
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

export const setPlanningStageStatus = (key: keyof PlanningState, newValue: boolean): void => {
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

export const getIsJobStatementValid = (): boolean => {
  const planningStatus = localStorage.getItem(planningStateKey);
  if(planningStatus) {
    const flattenedData = JSON.parse(planningStatus);
    const unflattenPlanningStage = unflatten(flattenedData) as PlanningState;
    return unflattenPlanningStage.isJobStatementValid;
  } else {
    return planningStageStatus.isJobStatementValid;
  }
}

export const setJobState = (key: keyof Job, newValue: string): void => {
  jobStatus[key] = newValue;
  const flattenedData = flatten(jobStatus);
  localStorage.setItem(jobKey, JSON.stringify(flattenedData));
}

export const getJobState = (): Job => {
  const jobState = localStorage.getItem(jobKey);
  if(jobState) {
    const flattenedData = JSON.parse(jobState);
    return unflatten(flattenedData);
  } else {
    return jobStatus;
  }
}

export const setProgress = (key: keyof ProgressState, newValue: boolean): void => {
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
  activeStatus.date = date;

  if(!isSubStage) {
    activeStatus.activeSubStepIndex = 0;
  } else {
    activeStatus.activeSubStepIndex = subStageId;
  }
  
  const flattenedData = flatten(activeStatus);
  localStorage.setItem(activeStateKey, JSON.stringify(flattenedData));
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


