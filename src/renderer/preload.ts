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
import { InstallationArgs } from '../types/stateInterfaces';

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
    uploadLatestYaml(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs) {
      return ipcRenderer.invoke("upload-latest-yaml", connectionArgs, installationArgs);
    },
    getConfigByKey(key: string, value: any) {
      return ipcRenderer.invoke("get-config-by-key", key);
    },
    setConfig(completeZoweYamlObj: any) {
      return ipcRenderer.invoke("set-config", completeZoweYamlObj);
    },
    setConfigByKeyAndValidate(key: string, value: any) {
      return ipcRenderer.invoke("set-config-by-key", key, value);
    },
    setConfigByKeyNoValidate(key: string, value: any) {
      return ipcRenderer.invoke("set-config-by-key-no-validate", key, value);
    },
    getJCLOutput() {
      return ipcRenderer.invoke("get-jcl-output");
    },
    setJCLOutput(value: any) {
      return ipcRenderer.invoke("set-jcl-output", value);
    },
    getYAMLOutput() {
      return ipcRenderer.invoke("get-yaml-output");
    },
    setYAMLOutput(value: any) {
      return ipcRenderer.invoke("set-yaml-output", value);
    },
    getStandardOutput() {
      return ipcRenderer.invoke("get-standard-output");
    },
    setStandardOutput(value: any) {
      return ipcRenderer.invoke("set-standard-output", value);
    },
    setSchema(schema: any) {
      return ipcRenderer.invoke("set-schema", schema);
    },
    getSchema() {
      return ipcRenderer.invoke("get-schema");
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
    installButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs, version: string) {
      return ipcRenderer.invoke("install-mvs", connectionArgs, installationArgs, version);
    },
    downloadButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs, version: string) {
      return ipcRenderer.invoke("download-unpax", connectionArgs, installationArgs, version);
    },
    fetchExampleYamlBtnOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs) {
      return ipcRenderer.invoke("get-yaml-schema", connectionArgs, installationArgs);
    },
    initCertsButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installDir: string}) {
      return ipcRenderer.invoke("init-certificates", connectionArgs, installationArgs);
    },
    apfAuthButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs) {
      return ipcRenderer.invoke("init-apf", connectionArgs, installationArgs);
    },
    getApfAuthProgress(){
      return ipcRenderer.invoke("get-apf-auth-progress");
    },
    getInstallationProgress() {
      return ipcRenderer.invoke("get-installation-progress");
    },
    getDownloadUnpaxProgress() {
      return ipcRenderer.invoke("get-download-unpax-progress");
    },
    getCertificateProgress() {
      return ipcRenderer.invoke("get-certificate-progress");
    },
    initSecurityButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installDir: string}) {
      return ipcRenderer.invoke("init-security", connectionArgs, installationArgs);
    },
    initStcsButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installDir: string}) {
      return ipcRenderer.invoke("init-stcs", connectionArgs, installationArgs);
    },
    initVsamButtonOnClick(connectionArgs: IIpcConnectionArgs, installationArgs: {installDir: string}) {
      return ipcRenderer.invoke("init-vsam", connectionArgs, installationArgs);
    },
    getInitSecurityProgress(){
      return ipcRenderer.invoke("get-init-security-progress");
    },
    getInitStcsProgress(){
      return ipcRenderer.invoke("get-init-stcs-progress");
    },
    getInitVsamProgress(){
      return ipcRenderer.invoke("get-init-vsam-progress");
    },
    on(channel: string, func: any) {
      // REVIEW: Used to have channel validation with ipcRenderer.send, do we need something similar for ipcRenderer.invoke?
      const validChannels = ['install-mvs', 'init-apf', 'init-certificates', 'init-security', 'init-vsam', 'init-stcs'];
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
