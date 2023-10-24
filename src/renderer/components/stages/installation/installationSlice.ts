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

interface InstallationState {
  installationStatus: boolean;
  installationArgs: {
    installationDir: string;
    workspaceDir: string;
    logDir: string,
    extentionDir: string,
    installationType?: string;
    downloadDir: string;
    userUploadedPaxPath?: string;
    smpeDir?: string;
    javaHome: string;
    nodeHome: string;
    setupConfig: any;
    jobName: string;
    jobPrefix: string;
    rbacProfile: string;
    cookieId: string;
    zosmfHost: string,
    zosmfPort: string,
    zosmfApplId: string
  };
  zoweVersion: string;
}

const initialState: InstallationState = {
  installationStatus: false,
  installationArgs: {
    installationDir: '',
    workspaceDir: '',
    logDir:'',
    extentionDir:'',
    installationType: 'download',
    userUploadedPaxPath: '',
    smpeDir: '',
    downloadDir: '',
    javaHome: '',
    nodeHome: '',
    setupConfig: {},
    jobName: '',
    jobPrefix: '',
    rbacProfile: '',
    cookieId: '',
    zosmfHost: '',
    zosmfPort: '',
    zosmfApplId: ''
  },
  zoweVersion: '',
};

export const installationSlice = createSlice({
  name: 'installation',
  initialState,
  reducers: {
    setInstallationArgs: (state, action: PayloadAction<any>) => {
      state.installationArgs = action.payload;
    },
    setInstallationStatus: (state, action: PayloadAction<boolean>) => {
      state.installationStatus = action.payload;
    },
    setZoweVersion: (state, action: PayloadAction<string>) => {
      state.zoweVersion = action.payload;
    },
  }
});

export const { setInstallationArgs, setInstallationStatus, setZoweVersion } = installationSlice.actions;

export const selectInstallationArgs = (state: RootState) => state.installation.installationArgs;
export const selectZoweVersion = (state: RootState) => state.installation.zoweVersion;
export const selectInstallationStatus = (state: RootState) => state.installation.installationStatus;

export default installationSlice.reducer;
