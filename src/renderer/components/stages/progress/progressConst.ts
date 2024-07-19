/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { ProgressState } from "../../../../types/stateInterfaces";

export const initProgressStatus: ProgressState = {
    connectionStatus: false,
    planningStatus: false,
    installationTypeStatus: false,
    downloadUnpaxStatus: false,
    initializationStatus: false,
    datasetInstallationStatus: false,
    networkingStatus: false,
    apfAuthStatus: false,
    securityStatus: false,
    stcsStatus: false,
    certificateStatus: false,
    vsamStatus: false,
    launchConfigStatus: false,
    reviewStatus: false,
  }