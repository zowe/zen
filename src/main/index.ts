/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import MenuBuilder from './menu';
import { HomeActions } from "../actions/HomeActions";
import { ConnectionActions } from "../actions/ConnectionActions";
import { InstallActions } from "../actions/InstallActions";
import { PlanningActions } from "../actions/PlanningActions";
import { IIpcConnectionArgs } from '../types/interfaces';
import { ProgressStore } from "../storage/ProgressStore";
import { checkDirExists } from '../services/ServiceUtils';
import { ConfigurationStore } from '../storage/ConfigurationStore';
import { EditorStore } from '../storage/EditorStore';
import { log, warn, error, info } from 'electron-log/main';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const connectionActions = new ConnectionActions();
const installActions = new InstallActions();

console.log = log;
console.warn = warn;
console.error = error;
console.info = info;

// REVIEW: electron-squirrel-startup, review the necessity of it, package will have an operation viloation as it is 7 years old. 
// if (require('electron-squirrel-startup')) { // ?
//   app.quit();
// }
// TODO: Add icon support (public/assets/icon-zen.png)
// REVIEW: Make proper logger  
// TODO: Add inline help for inputs, components, etc
// TODO: Make separate component for validation button - button / icon / error details
// REVIEW: services/FileTransfer.ts SubmitJcl.ts CheckHLQ.ts
// REVIEW: merge all services to ServiceUtils.ts file?

const createWindow = (): void => {

  const mainWindow = new BrowserWindow({
    height: 900,
    width: 1400,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // FIXME: Add dev mode switch 
  // mainWindow.webContents.openDevTools();

  ipcMain.handle('check-zowe-cli', async () => {
    const res = await HomeActions.checkZoweCLI();
    return res;
  });

  ipcMain.handle('get-installation-history', () => {
    const res = HomeActions.findPreviousInstallations();
    return res;
  });

  ipcMain.handle('upload-pax', async () => {
    return await dialog.showOpenDialog({ properties: ['openFile'], filters: [
      { name: 'pax', extensions: ['pax'] },
    ] });
  });

  ipcMain.handle('save-job-header', async (_event, jobStatement: string) => {
    const res = connectionActions.saveJobStatement(jobStatement);
    return res;
  });

  ipcMain.handle('check-connection', async (_event, args: IIpcConnectionArgs) => {
    const res = await connectionActions.checkConnectionData(args);
    return res;
  });

  ipcMain.handle('get-example-zowe', async () => {
    const res = await PlanningActions.getExampleZowe();
    return res;
  });

  ipcMain.handle('get-zowe-schema', async () => {
    const res = await PlanningActions.getZoweSchema();
    return res;
  });

  ipcMain.handle('set-config', async (event, completeZoweYamlObj: any) => {
    const res: any = await ConfigurationStore.setConfig(completeZoweYamlObj);
    return res;
  });

  ipcMain.handle('get-config', async (event) => {
    const res: any = await ConfigurationStore.getConfig();
    return {status: true, details: res};
  });

  ipcMain.handle('set-schema', async (event, schema: any) => {
    const res: any = await ConfigurationStore.setSchema(schema);
    return res;
  });

  ipcMain.handle('get-schema', async (event, schema: any) => {
    const res: any = await ConfigurationStore.getSchema();
    return {status: true, details: res};
  });


  ipcMain.handle('get-config-by-key', async (_event, key: string) => {
    const res = await ConfigurationStore.getConfigByKey(key);
    return res;
  });

  ipcMain.handle('set-config-by-key', async (_event, key: string, value) => {
    const res = await PlanningActions.setConfigByKeyAndValidate(key, value);
    return res;
  });

  ipcMain.handle('get-jcl-output', async (event) => {
    const res: any = await EditorStore.getJCLOutput();
    return res;
  });

  ipcMain.handle('set-jcl-output', async (event, value) => {
    const res: any = await EditorStore.setJCLOutput(value);
    return res;
  });

  ipcMain.handle('get-standard-output', async (event) => {
    const res: any = await EditorStore.getStandardOutput();
    return res;
  });

  ipcMain.handle('set-standard-output', async (event, value) => {
    const res: any = await EditorStore.setStandardOutput(value);
    return res;
  });

  ipcMain.handle('get-yaml-output', async (event) => {
    const res: any = await EditorStore.getYAMLOutput();
    return res;
  });

  ipcMain.handle('set-yaml-output', async (event, value) => {
    const res: any = await EditorStore.setYAMLOutput(value);
    return res;
  });

  ipcMain.handle('set-config-by-key-no-validate', async (_event, key: string, value) => {
    const res = await ConfigurationStore.setConfigByKeyNoValidate(key, value);
    return res;
  });

  ipcMain.handle('get-zowe-version', async () => {
    const res = await PlanningActions.getZoweVersion();
    return res;
  });

  ipcMain.handle('get-env-vars', async (_event, connectionArgs) => {
    const res = await PlanningActions.getENV(connectionArgs);
    return res;
  });

  ipcMain.handle('check-java', async (_event, connectionArgs, location) => {
    const res = await PlanningActions.checkJava(connectionArgs, location);
    return res;
  });

  ipcMain.handle('check-node', async (_event, connectionArgs, location) => {
    const res = await PlanningActions.checkNode(connectionArgs, location);
    return res;
  });

  ipcMain.handle('check-space-create-dir', async (_event, connectionArgs, location) => {
    const res = await PlanningActions.checkSpaceAndCreateDir(connectionArgs, location);
    return res;
  });

  ipcMain.handle('check-dir-exists', async (_event, connectionArgs, location) => {
    const res = await checkDirExists(connectionArgs, location);
    return res;
  })

  ipcMain.handle('check-dir-or-create', async (_event, connectionArgs, location) => {
    const res = await PlanningActions.checkOrCreateDir(connectionArgs, location);
    return res;
  })

  ipcMain.handle('install-mvs', async (event, connectionArgs, installationArgs) => {
    const res = await installActions.runInstallation(connectionArgs, installationArgs);
    return res;
  });

  ipcMain.handle('download-unpax', async (event, connectionArgs, installationArgs, version) => {
    const res = await installActions.downloadUnpax(connectionArgs, installationArgs, version);
    return res;
  });

  ipcMain.handle('get-yaml-schema', async (event, connectionArgs, installationArgs) => {
    const res = await installActions.smpeGetExampleYamlAndSchemas(connectionArgs, installationArgs);
    return res;
  });

  ipcMain.handle('init-certificates', async (event, connectionArgs, installationArgs) => {
    const res = await installActions.runInitCertificates(connectionArgs, installationArgs);
    return res;
  });

  ipcMain.handle('init-apf', async (_event, connectionArgs, installationArgs) => {
    const res = await installActions.runApfAuth(connectionArgs, installationArgs);
    return res;
  });


  ipcMain.handle('get-apf-auth-progress', async () => {
    const res = ProgressStore.getAll()['apfAuth'];
    return res;
  });


  ipcMain.handle('get-installation-progress', async () => {
    const res = ProgressStore.getAll()['installation'];
    return res;
  });

  ipcMain.handle('get-download-unpax-progress', async () => {
    const res = ProgressStore.getAll()['downloadUnpax'];
    return res;
  });

  ipcMain.handle('get-certificate-progress', async (event) => {
    const res = ProgressStore.getAll()['certificate'];
    return res;
  });

  ipcMain.handle('init-security', async (event, connectionArgs, installationArgs) => {
    const res = await installActions.runInitSecurity(connectionArgs, installationArgs);
    return res;
  });

  ipcMain.handle('upload-latest-yaml', async (event, connectionArgs, installationArgs) => {
    const res = await installActions.uploadLatestYaml(connectionArgs, installationArgs);
    return res;
  });

  ipcMain.handle('init-stcs', async (event, connectionArgs, installationArgs) => {
    const res = await installActions.initStcs(connectionArgs, installationArgs);
    return res;
  });

  ipcMain.handle('init-vsam', async (event, connectionArgs, installationArgs) => {
    const res = await installActions.initVsam(connectionArgs, installationArgs);
    return res;
  });

  ipcMain.handle('get-init-security-progress', async () => {
    const res = ProgressStore.getAll()['initSecurity'];
    return res;
  });

  ipcMain.handle('get-init-stcs-progress', async () => {
    const res = ProgressStore.getAll()['initStcs'];
    return res;
  });

  ipcMain.handle('get-init-vsam-progress', async () => {
    const res = ProgressStore.getAll()['initVsam'];
    return res;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
  
};

app.on('ready', createWindow);

app.on('window-all-closed', async () => { 
  app.quit(); 
});

app.on('activate', () => {
    // Intentionally left empty
});
