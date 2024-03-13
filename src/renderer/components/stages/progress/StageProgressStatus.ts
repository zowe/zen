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

export const getStageDetails = (stageLabel: string) => {
  const stage = stages.find(stage => stage.label === stageLabel);
  return stage;
}

export const getSubStageDetails = (stageId: number, subStageLabel: string) => {
 const stage = stages[stageId];
 if (stage && stage.subStages) {
  return stage.subStages.find(subStage => subStage.label === subStageLabel);
 }
 return null;
}

export const initializeProgress = () => {
  const progress = localStorage.getItem('stage-progress');
  if(!progress) {
    const flattenedProgress = flatten(progressStatus);
    localStorage.setItem('stage-progress', JSON.stringify(flattenedProgress));
  } 
}

export const setProgress = (key: keyof ProgressState, newValue: boolean): void => {
  progressStatus[key] = newValue;
  const flattenedProgress = flatten(progressStatus);
  localStorage.setItem('stage-progress', JSON.stringify(flattenedProgress));
}

export const getProgress = (key: keyof ProgressState): boolean => {
  const progress = localStorage.getItem('stage-progress');
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
  const progress = localStorage.getItem('stage-progress');
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
  localStorage.setItem('active-stage', JSON.stringify(flattenedProgress));
}

export const getActiveStage = () : ActiveStep => {
  let flattenedStage;
  const activeStage = localStorage.getItem('active-stage');
  if(activeStage) {
    flattenedStage = activeStage ? JSON.parse(activeStage) : {};
    return unflatten(flattenedStage);
  } else {
    return activeState;
  }
}


