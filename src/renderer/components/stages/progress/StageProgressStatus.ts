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

const setKeys = (id: string) => {
  progressStateKey = `${progressStateKey}_${id}`;
  activeStateKey = `${activeStateKey}_${id}`;
  planningStateKey = `${planningStateKey}_${id}`;
  jobKey = `${jobKey}_${id}`;
}

export const initializeProgress = (host: string, user: string) => {
  const id = `${host}_${user}`;
  setKeys(id);

  const progress = localStorage.getItem(progressStateKey);
  if(!progress) {
    const flattenedProgress = flatten(progressStatus);
    localStorage.setItem(progressStateKey, JSON.stringify(flattenedProgress));
  }

  const activeStage = localStorage.getItem(activeStateKey);
  if(!activeStage) {
    const flattenedActiveStage = flatten(activeStatus);
    localStorage.setItem(activeStateKey, JSON.stringify(flattenedActiveStage));
  }

  const planningState = localStorage.getItem(planningStateKey);
  if(!planningState) {
    const flattenedPlanningState = flatten(planningStageStatus);
    localStorage.setItem(planningStateKey, JSON.stringify(flattenedPlanningState));
  }

  const jobState = localStorage.getItem(jobKey);
  if(!jobState) {
    const flattenedJobState = flatten(jobStatus);
    localStorage.setItem(jobKey, JSON.stringify(flattenedJobState));
  }
}

export const setPlanningStageStatus = (key: keyof PlanningState, newValue: boolean): void => {
  planningStageStatus[key] = newValue;
  const flattenedPlanningState = flatten(planningStageStatus);
  localStorage.setItem(planningStateKey, JSON.stringify(flattenedPlanningState));
}

export const getPlanningStageStatus = (): any => {
  const planningStatus = localStorage.getItem(planningStateKey);
  if(planningStatus) {
    const flattenedPlanningState = JSON.parse(planningStatus);
    return unflatten(flattenedPlanningState)
  } else {
    return planningStageStatus;
  }
}

export const getIsJobStatementValid = (): boolean => {
  const planningStatus = localStorage.getItem(planningStateKey);
  if(planningStatus) {
    const flattenedPlanningState = JSON.parse(planningStatus);
    const unflattenPlanningStage = unflatten(flattenedPlanningState) as PlanningState;
    return unflattenPlanningStage.isJobStatementValid;
  } else {
    return planningStageStatus.isJobStatementValid;
  }
}

export const setJobState = (key: keyof Job, newValue: string): void => {
  jobStatus[key] = newValue;
  const flattenedJobState = flatten(jobStatus);
  localStorage.setItem(jobKey, JSON.stringify(flattenedJobState));
}

export const getJobState = (): any => {
  const jobState = localStorage.getItem(jobKey);
  if(jobState) {
    const flattenedJobState = JSON.parse(jobState);
    return unflatten(flattenedJobState);
  } else {
    return jobStatus;
  }
}

export const setProgress = (key: keyof ProgressState, newValue: boolean): void => {
  progressStatus[key] = newValue;
  const flattenedProgress = flatten(progressStatus);
  localStorage.setItem(progressStateKey, JSON.stringify(flattenedProgress));
}

export const getProgress = (key: keyof ProgressState): boolean => {
  const progress = localStorage.getItem(progressStateKey);
  if(progress) {
    const flattenedProgress = JSON.parse(progress);
    const unflattenedProgress = unflatten(flattenedProgress) as ProgressState;
    return unflattenedProgress[key];
  } else {
    return progressStatus[key];
  }
}

export const getCompleteProgress = () : ProgressState => {
  const progress = localStorage.getItem(progressStateKey);
  if(progress) {
    const flattenedProgress =  JSON.parse(progress);
    return unflatten(flattenedProgress);
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
  
  const flattenedProgress = flatten(activeStatus);
  localStorage.setItem(activeStateKey, JSON.stringify(flattenedProgress));
}

export const getActiveStage = () : ActiveState => {
  const activeStage = localStorage.getItem(activeStateKey);
  if(activeStage) {
    const flattenedStage = JSON.parse(activeStage);
    return unflatten(flattenedStage);
  } else {
    return activeStatus;
  }
}


