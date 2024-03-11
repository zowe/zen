/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

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



