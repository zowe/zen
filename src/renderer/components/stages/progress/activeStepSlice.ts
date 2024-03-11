/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../store';
import { setActiveStage } from './progressStatus';

export interface activeStep {
  activeStepIndex: number,
  isSubStep: boolean,
  activeSubStepIndex: number,
  date?: string
}

const initialState: activeStep = {
  activeStepIndex: 0,
  isSubStep: false,
  activeSubStepIndex: 0
}

const getCurrentDate = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return formattedDate;
}  

export const activeStepSlice = createSlice({
  name: 'activeStage',
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<activeStep>) => {
      state.activeStepIndex = action.payload.activeStepIndex;
      state.isSubStep = action.payload.isSubStep;
      state.activeSubStepIndex = action.payload.activeSubStepIndex;
      state.date = getCurrentDate();
      setActiveStage(action.payload.activeStepIndex, action.payload.isSubStep, state.date, action.payload.activeSubStepIndex);
    },
  }
});

export const { setActiveStep } = activeStepSlice.actions;

export const selectActiveStepIndex = (state: RootState) => state.activeStep.activeStepIndex;
export const selectIsSubstep = (state: RootState) => state.activeStep.isSubStep;
export const selectActiveSubStepIndex = (state: RootState) => state.activeStep.activeSubStepIndex;
export const selectActiveStepDate = (state: RootState) => state.activeStep.date;


export default activeStepSlice.reducer;
