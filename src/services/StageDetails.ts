/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { getStageSkipStatus, getSubStageSkipStatus } from '../renderer/components/stages/progress/StageProgressStatus';
import { stages } from '../renderer/components/configuration-wizard/Wizard';

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

export const initStageSkipStatus = (): void => {
  const skipStatus = getStageSkipStatus();

  const stageSkipStatus = [
    skipStatus.planning,
    skipStatus.installationType,
    skipStatus.unpax,
    skipStatus.initialization,
    skipStatus.reviewInstallation
  ];

  let iterator = 0;
  stages.map(stage => {
    if(stage.id !== 0) {
      stage.isSkipped = stageSkipStatus[iterator];
    }
    iterator++;
  })
}

export const initSubStageSkipStatus = (): void => {
  const skipStatus = getSubStageSkipStatus();

  const subStageSkipStatus = [
    skipStatus.datasetInstallation,
    skipStatus.networking,
    skipStatus.apfAuth,
    skipStatus.security,
    skipStatus.certificate,
    skipStatus.launchConfig
  ];

  let iterator = 0;
  stages.map(stage => {
    if(stage.subStages) {
      stage.subStages.map(subStage => {
        subStage.isSkipped = subStageSkipStatus[iterator];
        iterator++;
      })
    }
  })
}



