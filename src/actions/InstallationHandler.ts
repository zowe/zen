/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { app } from 'electron';
import { DataType, FileTransfer } from "../services/FileTransfer";
import path from "path/posix";
import { Script } from "../services/RunScript";
import { stringify } from 'yaml';
import { IIpcConnectionArgs, IResponse } from '../types/interfaces';
import { ProgressStore } from "../storage/ProgressStore";
import * as fs from 'fs';

class Installation {

  public async runInstallation (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: {installationDir: string, installationType: string, userUploadedPaxPath: string},
    version: string,
    zoweConfig: any,
    skipDownload: boolean
  ): Promise<IResponse> {
    const SMPE_INSTALL: boolean = installationArgs.installationType === "smpe";
    const savingResult = await this.generateYamlFile(zoweConfig);
    if (!savingResult.status) {
      return savingResult;
    }
    
    try {
      console.log("uploading yaml...");
      const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
      ProgressStore.set('installation.uploadYaml', uploadYaml.status);

      if(!uploadYaml.status){
        return {status: false, details: `Error uploading yaml configuration: ${uploadYaml.details}`};
      }

      let download, upload, unpax;
      if(!skipDownload){
        if(installationArgs.installationType === "download"){
          console.log("downloading...", version);
          download = await this.downloadPax(version);
          ProgressStore.set('installation.download', download.status);
        } else {
          //if the user has selected an SMPE or opted to upload their own pax, we simply set this status to true as no download is required
          download = {status: true, details: ''}
          ProgressStore.set('installation.download', true);
        }

        if(!download.status){
          return {status: false, details: `Error downloading pax: ${download.details}`};
        }

        console.log("uploading...");
        if(installationArgs.installationType === "upload"){
          //upload the PAX the user selected in the "Install Type" stage to the installation dir (from the planning stage)
          console.log('Uploading user selected pax')
          upload = await new FileTransfer().upload(connectionArgs, installationArgs.userUploadedPaxPath, path.join(installationArgs.installationDir, "zowe.pax"), DataType.BINARY)
        } else if (installationArgs.installationType === "download"){
          console.log('Uploading pax downloaded from jfrog')
          upload = await this.uploadPax(connectionArgs, installationArgs.installationDir);
        }
        ProgressStore.set('installation.upload', upload.status);

        if(!upload.status){
          return {status: false, details: `Error uploading pax: ${upload.details}`};
        }

        console.log("unpaxing...");
        unpax = await this.unpax(connectionArgs, installationArgs.installationDir); 
        ProgressStore.set('installation.unpax', unpax.status);

        if(!unpax.status){
          return {status: false, details: `Error unpaxing Zowe archive: ${unpax.details}`};
        }
      } else {
        //if the user has selected an SMPE or opted to upload their own pax, we simply set this status to true as no download is required
        download = {status: true, details: ''}
        ProgressStore.set('installation.download', true);
      }

      if(!download.status){
        return {status: false, details: `Error downloading pax: ${download.details}`};
      }

      console.log("uploading...");
      if(installationArgs.installationType === "upload"){
        //upload the PAX the user selected in the "Install Type" stage to the installation dir (from the planning stage)
        console.log('Uploading user selected pax')
        upload = await new FileTransfer().upload(connectionArgs, installationArgs.userUploadedPaxPath, path.join(installationArgs.installationDir, "zowe.pax"), DataType.BINARY)
      } else if (installationArgs.installationType === "download"){
        console.log('Uploading pax downloaded from jfrog')
        upload = await this.uploadPax(connectionArgs, installationArgs.installationDir);
      }
      ProgressStore.set('installation.upload', upload.status);

      if(!upload.status){
        return {status: false, details: `Error uploading pax: ${upload.details}`};
      }

      unpax = {status: false, details: ""};
      if (!SMPE_INSTALL) {
        console.log("unpaxing...");
        unpax = await this.unpax(connectionArgs, installationArgs.installationDir); 
        ProgressStore.set('installation.unpax', unpax.status);

        if (!unpax.status) {
          return {status: false, details: `Error unpaxing Zowe archive: ${unpax.details}`};
        }
      }

      let installation;
      if (installationArgs.installationType !== "smpe") {
        console.log("installing...");
        installation = await this.install(connectionArgs, installationArgs.installationDir);
        ProgressStore.set('installation.install', installation.status);
      } else {
        //If the user has opted to perform an SMPE installation, they must run 'zwe install' manually and therefore we set this to true
        installation = {status: true, details: ''}
        ProgressStore.set('installation.install', true);
      }

      if(!installation.status){
        return {status: false, details: `Error running zwe install: ${JSON.stringify(installation.details)}`};
      }

      let initMvs;
      if(installation.status){
        console.log("running zwe init mvs...");
         initMvs = await this.initMVS(connectionArgs, SMPE_INSTALL ? installationArgs.installationDir : installationArgs.installationDir + '/runtime');
        ProgressStore.set('installation.initMVS', initMvs.status);
      } else {
        initMvs = {status: false, details: `zwe install step failed, unable to run zwe init mvs.`}
        ProgressStore.set('installation.initMVS', false);
      }

      if(!initMvs.status){
        return {status: false, details: `Error running zwe init mvs: ${initMvs.details}`};
      }      

      return {status: download.status && uploadYaml.status && upload.status && unpax.status && installation.status && initMvs.status, details: 'Zowe install successful.'};
    } catch (error) {
      return {status: false, details: error.message};
    }
  }

  public async apfAuth(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string, installationType: string}, zoweConfig: object): Promise<IResponse>{
    console.log('writing current yaml to disk');
    const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
    await fs.writeFile(filePath, stringify(zoweConfig), (err) => {
      if (err) {
          console.warn("Can't save configuration to zowe.yaml");
          return ProgressStore.set('apfAuth.writeYaml', false);
      }
    });
    ProgressStore.set('apfAuth.writeYaml', true);
    console.log("uploading yaml...");
    const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
    if(!uploadYaml.status){
      ProgressStore.set('apfAuth.uploadYaml', false);
      return {status: false, details: 'Failed to upload YAML file'}

    }
    ProgressStore.set('apfAuth.uploadYaml', uploadYaml.status);
    const script = `cd ${installationArgs.installationType === "smpe" ? installationArgs.installationDir + '/bin' : installationArgs.installationDir + '/runtime/bin'};./zwe init apfauth -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten --update-config`;
    const result = await new Script().run(connectionArgs, script);
    ProgressStore.set('apfAuth.success', result.rc === 0);
    return {status: result.rc === 0, details: result.jobOutput}
  }
  
  public async initSecurity(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string, installationType: string}, zoweConfig: object): Promise<IResponse>{
      console.log('writing current yaml to disk');
      const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
      await fs.writeFile(filePath, stringify(zoweConfig), (err) => {
        if (err) {
            console.warn("Can't save configuration to zowe.yaml");
            ProgressStore.set('initSecurity.writeYaml', false);
            return {status: false, details: `Can't save configuration to zowe.yaml`};
        }
      });
      ProgressStore.set('initSecurity.writeYaml', true);
      console.log("uploading yaml...");
      const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
      if(!uploadYaml.status){
        return {status: false, details: `Error uploading yaml configuration: ${uploadYaml.details}`};
      }
      ProgressStore.set('initSecurity.uploadYaml', uploadYaml.status);
      const script = `cd ${installationArgs.installationType === "smpe" ? installationArgs.installationDir + '/bin' : installationArgs.installationDir + '/runtime/bin'};./zwe init security -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten --update-config`;
      const result = await new Script().run(connectionArgs, script);
      ProgressStore.set('initSecurity.success', result.rc === 0);
      return {status: result.rc === 0, details: result.jobOutput}
  }

  async initCertificates(connectionArgs: IIpcConnectionArgs, installationArgs: {installationDir: string, installationType: string}, zoweConfig: any){
    console.log('writing current yaml to disk');
    const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
    await fs.writeFile(filePath, stringify(zoweConfig), (err: any) => {
      if (err) {
          console.warn("Can't save configuration to zowe.yaml");
          return ProgressStore.set('certificate.writeYaml', false);
      } 
    });
    ProgressStore.set('certificate.writeYaml', true);
    console.log("uploading yaml...");
    const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
    if(!uploadYaml.status){
      return ProgressStore.set('certificate.uploadYaml', false);;
    }
    ProgressStore.set('certificate.uploadYaml', uploadYaml.status);
    const script = `cd ${installationArgs.installationType === "smpe" ? installationArgs.installationDir + '/bin' : installationArgs.installationDir + '/runtime/bin'} && ./zwe init certificate --update-config -c ${installationArgs.installationDir}/zowe.yaml`;
    const result = await new Script().run(connectionArgs, script);
    ProgressStore.set('certificate.zweInitCertificate', result.rc === 0);
    return {status: result.rc === 0, details: result.jobOutput}
  }

  public async initVsam(connectionArgs: IIpcConnectionArgs,
    installationArgs: {installationDir: string, installationType: string}, zoweConfig: object): Promise<IResponse>{

      // Initialize Progress Store For Vsam
      ProgressStore.set('initVsam.writeYaml', false);
      ProgressStore.set('initVsam.uploadYaml', false);
      ProgressStore.set('initVsam.success', false);

      console.log('writing current yaml to disk');
      const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
      await fs.writeFile(filePath, stringify(zoweConfig), (err) => {
        if (err) {
          console.warn("Can't save configuration to zowe.yaml");
          ProgressStore.set('initVsam.writeYaml', false);
          return {status: false, details: `Can't save configuration to zowe.yaml`};
        }
      });
      ProgressStore.set('initVsam.writeYaml', true);
      console.log("uploading yaml...");
      const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
      if(!uploadYaml.status){
        return {status: false, details: `Error uploading yaml configuration: ${uploadYaml.details}`};
      }
      ProgressStore.set('initVsam.uploadYaml', uploadYaml.status);
      const script = `cd ${installationArgs.installationType === "smpe" ? installationArgs.installationDir + '/bin' : installationArgs.installationDir + '/runtime/bin'};./zwe init vsam -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten --update-config`;
      const result = await new Script().run(connectionArgs, script);

      let errorFound = false;
      let errorMessage = '';
      const errorPattern = /Error ZWE.*/;
      for (const key in result.jobOutput) {
        const match = result.jobOutput[key].match(errorPattern);
        if (match) {
          errorFound = true;
          errorMessage = match[0];
          break;
        }
      }

      ProgressStore.set('initVsam.success', result.rc === 0 && !errorFound);
      return {status: result.rc === 0 && !errorFound, details: result.jobOutput, error: errorFound, errorMsg: errorMessage }
  }

  async generateYamlFile(zoweConfig: object): Promise<IResponse> {
    const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
    await fs.writeFile(filePath, stringify(zoweConfig), (err) => {
      if (err) {
          console.warn("Can't save configuration to zowe.yaml");
          return {status: false, details: err.message};
      } 
    });
    return {status: true, details: ''};
  }

  async uploadYaml(connectionArgs: IIpcConnectionArgs, installDir: string) {
    const tempPath = path.join(app.getPath("temp"), "zowe.yaml");
    const filePath = path.join(installDir, "zowe.yaml");
    await new FileTransfer().upload(connectionArgs, tempPath, filePath, DataType.BINARY)
    const script = `chtag -t -c ISO8859-1 ${installDir}/zowe.yaml`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }
  
  async downloadPax(version: string): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
  }

  async uploadPax(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
  }

  async unpax(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
  }

  async install(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
  }

  async initMVS(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
  }
  
}

export class FTPInstallation extends Installation {

  async uploadYaml(connectionArgs: IIpcConnectionArgs, installDir: string) {
    const tempPath = path.join(app.getPath("temp"), "zowe.yaml");
    const filePath = path.join(installDir, "zowe.yaml");
    await new FileTransfer().upload(connectionArgs, tempPath, filePath, DataType.BINARY)
    const script = `chtag -t -c ISO8859-1 ${installDir}/zowe.yaml`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }
  
  async downloadPax(version: string): Promise<IResponse> {
    // REVIEW, we can download directly on MF using curl --insecure --output "output-dir/zowe.pax" paxURL
    //         easier but could fail on real system?
    const paxURL = `https://zowe.jfrog.io/zowe/list/libs-release-local/org/zowe/${version}/zowe-${version}.pax`;
    const tempPath = path.join(app.getPath("temp"), "zowe.pax");
    const result = await new FileTransfer().downloadPax(paxURL, tempPath);
    return {status: true, details: ''} // REVIEW file transfer results
  }

  async uploadPax(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    const tempPath = path.join(app.getPath("temp"), "zowe.pax");
    const filePath = path.join(installDir, "zowe.pax");
    console.log(`Uploading ${tempPath} to ${filePath}`)
    const result = await new FileTransfer().upload(connectionArgs, tempPath, filePath, DataType.BINARY);
    try {
      fs.unlink(tempPath, () => {
        console.log("Deleted zowe.pax successfully.");
      });
    } catch (error) {
      console.log("Can't delete zowe.pax");
    }
    return result;
  }

  // TODO: Is this necessary adding "/runtime" ? User already specifies /runtime directory - removes 8 chars from max limit. See Planning.tsx
  async unpax(connectionArgs: IIpcConnectionArgs, installDir: string) {
    const script = `mkdir ${installDir}/runtime;cd ${installDir}/runtime;pax -ppx -rf ../zowe.pax;rm ../zowe.pax`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }

  async install(connectionArgs: IIpcConnectionArgs, installDir: string) {
    const script = `cd ${installDir}/runtime/bin;./zwe install -c ${installDir}/zowe.yaml --allow-overwritten`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }
  
  async initMVS(connectionArgs: IIpcConnectionArgs, installDir: string) {
    const script = `cd ${installDir}/runtime/bin;./zwe init mvs -c ${installDir}/zowe.yaml --allow-overwritten`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }

  async checkInstallData() {
    // FIXME: Refine installation data validation
  }
}

export class CLIInstallation extends Installation {

}
