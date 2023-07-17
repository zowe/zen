/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { ConnectionStore } from "../storage/ConnectionStore";
import { IResponse } from '../types/interfaces';

export class HomeActions {

  public static async checkZoweCLI(): Promise<IResponse> {
    const version = await ConnectionStore.get('zowe-cli-version');
    if (!version) {
      const util = require('node:util');
      const execFile = util.promisify(require('node:child_process').execFile);
      // TODO: Verify not just Zowe CLI version, but get list of profiles available with host names
      //        and check ssh commands are operational to verify it set up correctly.
      try {
        const { stdout } = await execFile('zowe', ['--version']);
        const status = ConnectionStore.set('zowe-cli-version', stdout);
        return {status, details: stdout};
      } catch (err) {
        console.info('Failed to detect Zowe CLI version', err);
        return {status: false, details: ''};
      }
    }
    return {status: true, details: version};
  }

  public static findPreviousInstallations(): IResponse {
    const data = ConnectionStore.getAll();
    return {status: true, details: data};
  }
}
