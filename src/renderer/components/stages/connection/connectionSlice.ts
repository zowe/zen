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
import { IIpcConnectionArgs } from '../../../../types/interfaces';

export interface ConnectionState {
  connectionStatus: boolean;
  connectionArgs: IIpcConnectionArgs;
}

const initialState: ConnectionState = {
  connectionStatus: false,
  connectionArgs: {
    host: '',
    connectionType: 'ftp',
    port: 21,
    user: '',
    password: '',
    jobStatement: '',
  },
};

export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnectionArgs: (state, action: PayloadAction<IIpcConnectionArgs>) => {
      state.connectionArgs = action.payload;
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.connectionStatus = action.payload;
    },
  },
});

// REVIEW: Split to distinct: setHost, setPort, setConnectionType, setUser, setPassword 
export const { setConnectionArgs, setConnectionStatus } = connectionSlice.actions;

export const selectConnectionArgs = (state: RootState) => state.connection.connectionArgs;
export const selectConnectionStatus = (state: RootState) => state.connection.connectionStatus;

export default connectionSlice.reducer;
