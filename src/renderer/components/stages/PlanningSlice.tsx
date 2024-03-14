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
import { RootState } from '../../store';
import { setPlanningStageStatus, getPlanningStageStatus } from './progress/StageProgressStatus';

export interface jobValidation {
  jobStatement: string;
  isJobStatementValid: boolean;
  jobStatementValidMsg: string;
}

export interface locationValidation {
  isLocationValid: boolean;
  locValidationDetails: any;
}

const initialState: jobValidation = {
  jobStatement: '',
  isJobStatementValid: false,
  jobStatementValidMsg: ''
}

const locValidationInitialState: locationValidation = {
  isLocationValid: false,
  locValidationDetails: {}
}

export const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    setJobStatement: (state, action: PayloadAction<string>) => {
      state.jobStatement = action.payload;
      setPlanningStageStatus('jobStatement', action.payload);
    },
    setJobStatementValid: (state, action: PayloadAction<boolean>) => {
      state.isJobStatementValid = action.payload;
      setPlanningStageStatus('isJobStatementValid', action.payload);
    },
    setJobStatementValidMsg: (state, action: PayloadAction<string>) => {
      state.jobStatementValidMsg = action.payload;
    },
  }
})

export const locationValidationSlice = createSlice({
  name: 'locationValidation',
  initialState: locValidationInitialState,
  reducers: {
    setIsLocationValid: (state, action: PayloadAction<boolean>) => {
      state.isLocationValid = action.payload;
      setPlanningStageStatus('isLocationValid', action.payload);
    },
    setLocationValidationDetails: (state, action: PayloadAction<any>) => {
      state.locValidationDetails = action.payload;
    }
  }
})

export const { setJobStatementValid, setJobStatementValidMsg, setJobStatement } = planningSlice.actions;
export const { setLocationValidationDetails } = locationValidationSlice.actions

export const selectJobStatement = (state: RootState) => state.planning.jobStatement;
export const selectJobStatementValid = (state: RootState) => state.planning.isJobStatementValid;
export const selectJobStatementValidMsg = (state: RootState) => state.planning.jobStatementValidMsg;
export const selectLocValidationDetails = (state: RootState) => state.locationValidation.locValidationDetails;


export const planningReducer = planningSlice.reducer;
export const locationValidationReducer = locationValidationSlice.reducer;

