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

<<<<<<< HEAD
const storeDefault = {
  "downloadUnpax": {
=======
const STORE_DEFAULT = {
  "installation": {
>>>>>>> origin/v2.x/staging
    "uploadYaml": false,
    "download": false,
    "upload": false,
    "unpax": false,
    "getExampleYaml": false,
    "getSchemas": false,
  },
  "installation": {
    "uploadYaml": false,
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
const STORE_NAME = 'zen-progress-store';
const store = new Store({cwd: STORE_NAME});
store.set(STORE_DEFAULT);

export class ProgressStore extends DefaultStore {

  protected static getStore(): Store {
    return new Store({cwd: STORE_NAME});
  }

  public static deleteAll(): void {
    this.getStore().store = STORE_DEFAULT;
  }
}