/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IIpcConnectionArgs } from '../types/interfaces';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    connectionButtonOnClick(connectionArgs: IIpcConnectionArgs) {
      return ipcRenderer.invoke("check-connection", connectionArgs);
    },
    saveJobHeader(jobStatement: string) {
      return ipcRenderer.invoke("save-job-header", jobStatement);
    },
    getJobHeader(jobStatement: string) {
      return ipcRenderer.invoke("get-job-header", jobStatement);
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
    getConfigByKey(key: string, value: any) {
      return ipcRenderer.invoke("get-config-by-key", key);
    },
    setConfig(completeZoweYamlObj: any) {
      return ipcRenderer.invoke("set-config", completeZoweYamlObj);
    },
    setConfigByKey(key: string, value: any) {
      return ipcRenderer.invoke("set-config-by-key", key, value);
    },
    setSchema(schema: any) {
      return ipcRenderer.invoke("set-schema", schema);
    },
    checkZoweCLI() {
      return ipcRenderer.invoke("check-zowe-cli");
    },
    uploadPax(){
      return ipcRenderer.invoke('upload-pax')
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
    checkSpaceAndCreateDir(connectionArgs: IIpcConnectionArgs, location: string) {
      return ipcRenderer.invoke("check-space-create-dir", connectionArgs, location);
    },
    checkDirExists(connectionArgs: IIpcConnectionArgs, location: string) {
      return ipcRenderer.invoke("check-dir-exists", connectionArgs, location);
    },
    checkDirOrCreate(connectionArgs: IIpcConnectionArgs, location: string) {
      return ipcRenderer.invoke("check-dir-or-create", connectionArgs, location);
    },
    installButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installDir: string, javaHome: string, nodeHome: string, installationType: string, userUploadedPaxPath: string}, version: string, zoweConfig: any, skipDownload: boolean) {
      return ipcRenderer.invoke("install-mvs", connectionArgs, installationArgs, version, zoweConfig, skipDownload);
    },
    initCertsButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installDir: string}, zoweConfig: any) {
      return ipcRenderer.invoke("init-certificates", connectionArgs, installationArgs, zoweConfig);
    },
    apfAuthButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installationDir: string, installationType: string, userUploadedPaxPath: string}, zoweConfig: any) {
      return ipcRenderer.invoke("init-apf", connectionArgs, installationArgs, zoweConfig);
    },
    getApfAuthProgress(){
      return ipcRenderer.invoke("get-apf-auth-progress");
    },
    getInstallationProgress() {
      return ipcRenderer.invoke("get-installation-progress");
    },
    getCertificateProgress() {
      return ipcRenderer.invoke("get-certificate-progress");
    },
    initSecurityButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installDir: string}, zoweConfig: any) {
      return ipcRenderer.invoke("init-security", connectionArgs, installationArgs, zoweConfig);
    },
    getInitSecurityProgress(){
      return ipcRenderer.invoke("get-init-security-progress");
    },
    on(channel: string, func: any) {
      // REVIEW: Used to have channel validation with ipcRenderer.send, do we need something similar for ipcRenderer.invoke?
      const validChannels = ['install-mvs', 'init-security'];
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
