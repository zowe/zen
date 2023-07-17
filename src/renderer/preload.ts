/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

const { contextBridge, ipcRenderer } = require('electron');
import { IIpcConnectionArgs } from '../types/interfaces';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    connectionButtonOnClick(connectionArgs: IIpcConnectionArgs) {
      return ipcRenderer.invoke("check-connection", connectionArgs);
    },
    saveJobHeader(jobStatement: string) {
      return ipcRenderer.invoke("save-job-header", jobStatement);
    },
    getExampleZowe() {
      return ipcRenderer.invoke("get-example-zowe");
    },
    getZoweSchema() {
      return ipcRenderer.invoke("get-zowe-schema");
    },
    getConfig() {
      return ipcRenderer.invoke("get-config");
    },
    setConfigByKey(key: string, value: any) {
      return ipcRenderer.invoke("set-config-by-key", key, value);
    },
    checkZoweCLI() {
      return ipcRenderer.invoke("check-zowe-cli");
    },
    findPreviousInstallations() {
      return ipcRenderer.invoke("get-installation-history");
    },
    getZoweVersion() {
      return ipcRenderer.invoke("get-zowe-version");
    },
    getENVVars(connectionArgs: IIpcConnectionArgs) {
      return ipcRenderer.invoke("get-env-vars", connectionArgs);
    },
    checkJava(connectionArgs: IIpcConnectionArgs, location: string) {
      return ipcRenderer.invoke("check-java", connectionArgs, location);
    },
    checkNode(connectionArgs: IIpcConnectionArgs, location: string) {
      return ipcRenderer.invoke("check-node", connectionArgs, location);
    },
    checkSpace(connectionArgs: IIpcConnectionArgs, location: string) {
      return ipcRenderer.invoke("check-space", connectionArgs, location);
    },
    installButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installDir: string, javaHome: string, nodeHome: string}, version: string) {
      return ipcRenderer.invoke("install-mvs", connectionArgs, installationArgs, version);
    },
    getInstallationProgress() {
      return ipcRenderer.invoke("get-installation-progress");
    },
    on(channel: string, func: any) {
      // REVIEW: Used to have channel validation with ipcRenderer.send, do we need something similar for ipcRenderer.invoke?
      const validChannels = ['install-mvs'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel: string, func: any) {
      const validChannels: Array<string> = [];
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
