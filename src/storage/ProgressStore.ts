/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import Store from 'electron-store';
import { DefaultStore } from './DefaultStore';

// TODO: Store overall progress and restore up to last successful step

const STORE_DEFAULT = {
  "installation": {
    "uploadYaml": false,
    "download": false,
    "upload": false,
    "unpax": false,
    "install": false,
    "initMVS": false
  },
  "apfAuth":{
    "writeYaml": false,
    "uploadYaml": false,
    "success": false
  },
  "initSecurity": {
    "writeYaml": false,
    "uploadYaml": false,
    "success": false
  },
  "certificate": {
    "writeYaml": false,
    "uploadYaml": false,
    "zweInitCertificate": false,
  }
};
const STORE_NAME = 'zen-editor-store';

export class ProgressStore extends DefaultStore {

  public static store: any = new Store({cwd: STORE_NAME});

  public static deleteAll(): void {
    this.store.store = STORE_DEFAULT;
  }
}
