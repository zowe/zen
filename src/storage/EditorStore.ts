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
import { TYPE_JCL, TYPE_OUTPUT, TYPE_YAML } from '../renderer/components/common/Utils';

const STORE_DEFAULT = {
  [TYPE_OUTPUT]: "",
  [TYPE_JCL]: "",
  [TYPE_YAML]: ""
};
const STORE_NAME = 'zen-editor-store';

export class EditorStore extends DefaultStore {

  public static store: any = new Store({cwd: STORE_NAME});

  public static deleteAll(): void {
    this.store.store = STORE_DEFAULT;
  }

  public static getJCLOutput(): any {
    return this.get(TYPE_JCL);
  }

  public static setJCLOutput(output: string): boolean {
    return this.set(TYPE_JCL, output);
  }

  public static getStandardOutput(): any {
    return this.get(TYPE_OUTPUT);
  }

  public static setStandardOutput(output: string): boolean {
    return this.set(TYPE_OUTPUT, output);
  }

  public static getYAMLOutput(): any {
    return this.get(TYPE_YAML);
  }

  public static setYAMLOutput(output: string): boolean {
    return this.set(TYPE_YAML, output);
  }
}
