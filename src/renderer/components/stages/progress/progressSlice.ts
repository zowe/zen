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
import { setProgress, getProgress } from './progressStore';

export interface progressState {
  connectionStatus: boolean;
  planningStatus: boolean;
  installationTypeStatus: boolean;
  initializationStatus: boolean;
  datasetInstallationStatus: boolean;
  apfAuthStatus: boolean;
  securityStatus: boolean;
  certificateStatus: boolean;
  reviewStatus: boolean;
}

const initialState: progressState = {
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


// TO do: Initialization when we add the logic to maintain the state of the stage.

// const initialState: progressState = {
//   connectionStatus: getProgress('connectionStatus'),
//   planningStatus: getProgress('planningStatus'),
//   installationTypeStatus: getProgress('installationTypeStatus'),
//   initializationStatus: getProgress('initializationStatus'),
//   datasetInstallationStatus: getProgress('datasetInstallationStatus'),
//   apfAuthStatus: getProgress('apfAuthStatus'),
//   securityStatus: getProgress('securityStatus'),
//   certificateStatus: getProgress('certificateStatus'),
//   reviewStatus: getProgress('reviewStatus')
// }

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.connectionStatus = action.payload;
      setProgress('connectionStatus', action.payload);
    },
    setPlanningStatus: (state, action: PayloadAction<boolean>) => {
      state.planningStatus = action.payload;
      setProgress('planningStatus', action.payload);
    },
    setInstallationTypeStatus: (state, action: PayloadAction<boolean>) => {
      state.installationTypeStatus = action.payload;
      setProgress('installationTypeStatus', action.payload);
    },
    setInitializationStatus: (state, action: PayloadAction<boolean>) => {
      if (
        state.datasetInstallationStatus &&
        state.apfAuthStatus &&
        state.securityStatus &&
        state.certificateStatus
      ) {
        state.initializationStatus = true;
        setProgress('initializationStatus', true);
      } else {
        state.initializationStatus = false;
        setProgress('initializationStatus', false);
      }
    },
    setDatasetInstallationStatus: (state, action: PayloadAction<boolean>) => {
      state.datasetInstallationStatus = action.payload;
      setProgress('datasetInstallationStatus', action.payload);
    },
    setApfAuthStatus: (state, action: PayloadAction<boolean>) => {
      state.apfAuthStatus = action.payload;
      setProgress('apfAuthStatus', action.payload);
    },
    setSecurityStatus: (state, action: PayloadAction<boolean>) => {
      state.securityStatus = action.payload;
      setProgress('securityStatus', action.payload);
    },
    setCertificateStatus: (state, action: PayloadAction<boolean>) => {
      state.certificateStatus = action.payload;
      setProgress('certificateStatus', action.payload);
    },
    setReviewStatus: (state, action: PayloadAction<boolean>) => {
      state.certificateStatus = action.payload;
      setProgress('reviewStatus', action.payload);
    },
  }
});

export const { setConnectionStatus, setPlanningStatus, setInstallationTypeStatus, setInitializationStatus, setDatasetInstallationStatus, setApfAuthStatus, setSecurityStatus, setCertificateStatus, setReviewStatus } = progressSlice.actions;

export const selectConnectionStatus = (state: RootState) => state.progress.connectionStatus;
export const selectPlanningStatus = (state: RootState) => state.progress.planningStatus;
export const selectInstallationTypeStatus = (state: RootState) => state.progress.installationTypeStatus;
export const selectInitializationStatus = (state: RootState) => state.progress.initializationStatus;
export const selectDatasetInstallationStatus= (state: RootState) => state.progress.datasetInstallationStatus;
export const selectApfAuthStatus = (state: RootState) => state.progress.apfAuthStatus;
export const selectSecurityStatus = (state: RootState) => state.progress.securityStatus;
export const selectCertificateStatus = (state: RootState) => state.progress.certificateStatus;
export const selectReviewStatus = (state: RootState) => state.progress.reviewStatus;

export default progressSlice.reducer;