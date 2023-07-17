/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import connectionReducer from './components/stages/connection/connectionSlice';
import wizardReducer from './components/wizard/wizardSlice';
import installationReducer from './components/stages/installation/installationSlice';

export const store = configureStore({
  reducer: {
    wizard: wizardReducer,
    connection: connectionReducer,
    installation: installationReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
