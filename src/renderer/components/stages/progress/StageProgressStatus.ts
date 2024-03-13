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
import { ActiveStep } from './activeStepSlice'
import { stages } from '../../configuration-wizard/Wizard';

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

const activeState: ActiveStep = {
  activeStepIndex: 0,
  isSubStep: false,
  activeSubStepIndex: 0,
};

let progressStateKey = 'stage_progress';
let activeStateKey = 'active_state';

const setKeys = (id: string) => {
  progressStateKey = `stage_progress_${id}`;
  activeStateKey = `active_state_${id}`;
}

export const initializeProgress = (host: string, user: string) => {
  const id = `${host}_${user}`;
  setKeys(id);
  console.log('ABOUT TO USE KEY: ', progressStateKey);
  const progress = localStorage.getItem(progressStateKey);
  if(!progress) {
    const flattenedProgress = flatten(progressStatus);
    localStorage.setItem(progressStateKey, JSON.stringify(flattenedProgress));
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
  let flattenedProgress;
  const progress = localStorage.getItem(progressStateKey);
  if(progress) {
    flattenedProgress = progress ? JSON.parse(progress) : {};
    return unflatten(flattenedProgress);
  } else {
    return progressStatus;
  }
}

export const setActiveStage = (stageId: number, isSubStage: boolean, date: string, subStageId?: number): void => {
  activeState.activeStepIndex = stageId;
  activeState.isSubStep = isSubStage;
  activeState.date = date;

  if(!isSubStage) {
    activeState.activeSubStepIndex = 0;
  } else {
    activeState.activeSubStepIndex = subStageId;
  }
  
  const flattenedProgress = flatten(activeState);
  localStorage.setItem(activeStateKey, JSON.stringify(flattenedProgress));
}

export const getActiveStage = () : ActiveStep => {
  let flattenedStage;
  const activeStage = localStorage.getItem(activeStateKey);
  if(activeStage) {
    flattenedStage = activeStage ? JSON.parse(activeStage) : {};
    return unflatten(flattenedStage);
  } else {
    return activeState;
  }
}


