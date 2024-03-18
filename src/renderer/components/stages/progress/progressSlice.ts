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
import { setProgress, getProgress } from './StageProgressStatus';
import { ProgressState } from '../../../../types/stateInterfaces';

const initialState: ProgressState = {
  connectionStatus: getProgress('connectionStatus') || false,
  planningStatus: getProgress('planningStatus') || false,
  installationTypeStatus: getProgress('installationTypeStatus') || false,
  initializationStatus: getProgress('initializationStatus') || false,
  datasetInstallationStatus: getProgress('datasetInstallationStatus') || false,
  networkingStatus: getProgress('networkingStatus') || false,
  apfAuthStatus: getProgress('apfAuthStatus') || false,
  securityStatus: getProgress('securityStatus') || false,
  certificateStatus: getProgress('certificateStatus') || false,
  launchConfigStatus: getProgress('launchConfigStatus') || false,
  reviewStatus: getProgress('reviewStatus') || false
}

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.connectionStatus = action.payload;
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
      console.log("--SET DATASETINSTALLATION STATUS progress slice: ", action.payload);
      state.datasetInstallationStatus = action.payload;
      setProgress('datasetInstallationStatus', action.payload);
    },
    setNetworkingStatus: (state, action: PayloadAction<boolean>) => {
      state.networkingStatus = action.payload;
      setProgress('networkingStatus', action.payload);
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
    setLaunchConfigStatus: (state, action: PayloadAction<boolean>) => {
      state.launchConfigStatus = action.payload;
      setProgress('launchConfigStatus', action.payload);
    },
    setReviewStatus: (state, action: PayloadAction<boolean>) => {
      state.reviewStatus = action.payload;
      setProgress('reviewStatus', action.payload);
    },
  }
});

export const { setConnectionStatus, setPlanningStatus, setInstallationTypeStatus, setInitializationStatus, setDatasetInstallationStatus, setNetworkingStatus, setApfAuthStatus, setSecurityStatus, setCertificateStatus, setLaunchConfigStatus ,setReviewStatus } = progressSlice.actions;

export const selectConnectionStatus = (state: RootState) => state.progress.connectionStatus;
export const selectPlanningStatus = (state: RootState) => state.progress.planningStatus;
export const selectInstallationTypeStatus = (state: RootState) => state.progress.installationTypeStatus;
export const selectInitializationStatus = (state: RootState) => state.progress.initializationStatus;
export const selectDatasetInstallationStatus= (state: RootState) => state.progress.datasetInstallationStatus;
export const selectNetworkingStatus= (state: RootState) => state.progress.networkingStatus;
export const selectApfAuthStatus = (state: RootState) => state.progress.apfAuthStatus;
export const selectSecurityStatus = (state: RootState) => state.progress.securityStatus;
export const selectCertificateStatus = (state: RootState) => state.progress.certificateStatus;
export const selectLaunchConfigStatus = (state: RootState) => state.progress.launchConfigStatus;
export const selectReviewStatus = (state: RootState) => state.progress.reviewStatus;

export default progressSlice.reducer;