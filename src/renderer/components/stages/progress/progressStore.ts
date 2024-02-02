const STAGES = 5;
const SUBSTAGES = 4;
let stageStatus: number[] = [];
let subStageStatus: number[] = [];

const saveStageStatusToLocalStorage = (key: string, value: number[]) => {
  localStorage.setItem(key, JSON.stringify(value));
}

export const initStageStatus = () => {
  const status = localStorage.getItem('stage-status');
  if (!status) {
    for (let i = 0; i < STAGES; i++) {
      stageStatus[i] = 0;
    }
    saveStageStatusToLocalStorage('stage-status', stageStatus);
  } else {
    stageStatus = JSON.parse(status);
  }
}

export const initSubStageStatus = () => {
  const status = localStorage.getItem('sub-stage-status');
  if (!status) {
    for (let i = 0; i < SUBSTAGES; i++) {
      subStageStatus[i] = 0;
    }
    saveStageStatusToLocalStorage('sub-stage-status', subStageStatus);
  } else {
    subStageStatus = JSON.parse(status);
  }
}

export const setStageStatus = (stageId: number, status: number) => {
  stageStatus[stageId] = status;
  saveStageStatusToLocalStorage('stage-status', stageStatus);
}

export const setSubStageStatus = (subStageId: number, status: number) => {
  subStageStatus[subStageId] = status;
  saveStageStatusToLocalStorage('sub-stage-status', subStageStatus);
}

export const getStageStatus = (stageId: number) => {
  const status = localStorage.getItem('stage-status');
  if (status) {
    stageStatus = JSON.parse(status);
  }
  return stageStatus[stageId];
}

export const getSubStageStatus = (subStageId: number) => {
  const status = localStorage.getItem('sub-stage-status');
  if (status) {
    subStageStatus = JSON.parse(status);
  }
  return subStageStatus[subStageId];
}