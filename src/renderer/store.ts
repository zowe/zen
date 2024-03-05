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
import wizardReducer from './components/configuration-wizard/wizardSlice';
import installationReducer from './components/stages/installation/installationSlice';
import progressReducer from './components/stages/progress/progressSlice';
import { planningReducer, locationValidationReducer } from './components/stages/PlanningSlice';
import activeStepReducer from './components/stages/progress/activeStepSlice'

export const store = configureStore({
  reducer: {
    wizard: wizardReducer,
    connection: connectionReducer,
    installation: installationReducer,
    progress: progressReducer,
    planning: planningReducer,
    locationValidation: locationValidationReducer,
    activeStep: activeStepReducer,
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
