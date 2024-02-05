import { flatten, unflatten } from 'flat';
import { progressState } from "./progressSlice"; 

const progressStatus: progressState = {
  connectionStatus: false,
  planningStatus: false,
  installationTypeStatus: false,
  initializationStatus: false,
  datasetInstallationStatus: false,
  apfAuthStatus: false,
  securityStatus: false,
  certificateStatus: false,
}

export const initProgress = () => {
  const progress = localStorage.getItem('stage-progress');
  if(!progress) {
    const flattenedProgress = flatten(progressStatus);
    localStorage.setItem('stage-progress', JSON.stringify(flattenedProgress));
  } 
}

export const setProgress = (key: keyof progressState, newValue: boolean): void => {
  progressStatus[key] = newValue;
  const flattenedProgress = flatten(progressStatus);
  localStorage.setItem('stage-progress', JSON.stringify(flattenedProgress));
}

export const getProgress = (key: keyof progressState): boolean => {
  const progress = localStorage.getItem('stage-progress');
  if(progress) {
    const flattenedProgress = JSON.parse(progress);
    const unflattenedProgress = unflatten(flattenedProgress) as progressState;
    return unflattenedProgress[key];
  } else {
    return progressStatus[key];
  }
}

export const getCompleteProgress = () : progressState => {
  let flattenedProgress;
  const progress = localStorage.getItem('stage-progress');
  if(progress) {
    flattenedProgress = progress ? JSON.parse(progress) : {};
    return unflatten(flattenedProgress);
  } else {
    return progressStatus;
  }
}



