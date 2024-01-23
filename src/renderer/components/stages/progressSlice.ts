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

export interface progressState {
  planningStatus: boolean;
  initializationStatus: boolean;
  datasetInstallationStatus: boolean;
  apfAuthStatus: boolean;
  securityStatus: boolean;
  certificateStatus: boolean;
}

const initialState: progressState = {
  planningStatus: false,
  initializationStatus: false,
  datasetInstallationStatus: false,
  apfAuthStatus: false,
  securityStatus: false,
  certificateStatus: false
}

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setPlanningStatus: (state, action: PayloadAction<boolean>) => {
      state.planningStatus = action.payload;
    },
    setInitializationStatus: (state, action: PayloadAction<boolean>) => {
      if (
        state.datasetInstallationStatus &&
        state.apfAuthStatus &&
        state.securityStatus &&
        state.certificateStatus
      ) {
        state.initializationStatus = true;
      } else {
        state.initializationStatus = false;
      }
    },
    setDatasetInstallationStatus: (state, action: PayloadAction<boolean>) => {
      state.datasetInstallationStatus = action.payload;
    },
    setApfAuthStatus: (state, action: PayloadAction<boolean>) => {
      state.apfAuthStatus = action.payload;
    },
    setSecurityStatus: (state, action: PayloadAction<boolean>) => {
      state.securityStatus = action.payload;
    },
    setCertificateStatus: (state, action: PayloadAction<boolean>) => {
      state.certificateStatus = action.payload;
    },
  }
});

export const { setPlanningStatus, setInitializationStatus, setDatasetInstallationStatus, setApfAuthStatus, setSecurityStatus, setCertificateStatus } = progressSlice.actions;

export const selectPlanningStatus = (state: RootState) => state.progress.planningStatus;
export const selectInitializationStatus = (state: RootState) => state.progress.initializationStatus;
export const selectDatasetInstallationStatus= (state: RootState) => state.progress.datasetInstallationStatus;
export const selectApfAuthStatus = (state: RootState) => state.progress.apfAuthStatus;
export const selectSecurityStatus = (state: RootState) => state.progress.securityStatus;
export const selectCertificateStatus = (state: RootState) => state.progress.certificateStatus;

export default progressSlice.reducer;