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

export interface jobValidation {
  jobStatement: string;
  jobStatementValid: boolean;
  jobStatementValidMsg: string;
}

export interface locationValidation {
  locValidationDetails: any;
}

const initialState: jobValidation = {
  jobStatement: '',
  jobStatementValid: false,
  jobStatementValidMsg: ''
}

const locValidationInitialState: locationValidation = {
  locValidationDetails: {}
}

export const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    setJobStatement: (state, action: PayloadAction<string>) => {
        state.jobStatement = action.payload;
    },
    setJobStatementValid: (state, action: PayloadAction<boolean>) => {
        state.jobStatementValid = action.payload;
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
      setLocationValidationDetails: (state, action: PayloadAction<any>) => {
          state.locValidationDetails = action.payload;
      }
    }
  })

export const { setJobStatementValid, setJobStatementValidMsg, setJobStatement } = planningSlice.actions;
export const { setLocationValidationDetails } = locationValidationSlice.actions

export const selectJobStatement = (state: RootState) => state.planning.jobStatement;
export const selectJobStatementValid = (state: RootState) => state.planning.jobStatementValid;
export const selectJobStatementValidMsg = (state: RootState) => state.planning.jobStatementValidMsg;
export const selectLocValidationDetails = (state: RootState) => state.locationValidation.locValidationDetails;


export const planningReducer = planningSlice.reducer;
export const locationValidationReducer = locationValidationSlice.reducer;

