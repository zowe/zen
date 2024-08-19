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
import { parse, stringify } from 'yaml';
import { IIpcConnectionArgs, IResponse } from '../types/interfaces';
import { ProgressStore } from "../storage/ProgressStore";
import * as fs from 'fs';
import { ConfigurationStore } from '../storage/ConfigurationStore';
import { InstallationArgs } from '../types/stateInterfaces';
import { FALLBACK_SCHEMA, deepMerge } from '../renderer/components/common/Utils';
import { updateSchemaReferences } from '../services/ResolveRef';

//AJV did not like the regex in our current schema
const zoweDatasetMemberRegexFixed = {
  "description": "PARMLIB member used by ZIS",
  "type": "string",
  "pattern": "^([A-Z$#@]){1}([A-Z0-9$#@]){0,7}$",
  "minLength": 1,
  "maxLength": 8
}

class Installation {

  public async uploadLatestYaml (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: InstallationArgs,
  ): Promise<IResponse> {
    let currentConfig: any = ConfigurationStore.getConfig();
    if(currentConfig.installationArgs) delete currentConfig.installationArgs;
    const savingResult = await this.generateYamlFile(currentConfig);
    if (!savingResult.status) {
      console.log("failed to save yaml");
      return savingResult;
    }
    
    try {
      console.log("uploading yaml...");
      const uploadYaml = await this.uploadYaml(connectionArgs,installationArgs.installationDir);
      ProgressStore.set('downloadUnpax.uploadYaml', uploadYaml.status);

      if(!uploadYaml.status){
        return {status: false, details: `Error uploading yaml configuration: ${uploadYaml.details}`};
      }
      return {status: true, details: "Successfully uploaded yaml config"};
    } catch (error) {
      return {status: false, details: error.message};
    }
  }

  // Mutates yamlObj from source installationArgs
  mergeYamlAndInstallationArgs = function(yamlObj: any, installationArgs: InstallationArgs){
    if (installationArgs.installationDir) {
      yamlObj.zowe.runtimeDirectory = installationArgs.installationDir;
    }
    if (installationArgs.workspaceDir) {
      yamlObj.zowe.workspaceDirectory = installationArgs.workspaceDir;
    }
    if (installationArgs.logDir) {
      yamlObj.zowe.logDirectory = installationArgs.logDir;
    }
    if (installationArgs.extensionDir) {
      yamlObj.zowe.extensionDirectory = installationArgs.extensionDir;
    }
    if (installationArgs.rbacProfile) {
      yamlObj.zowe.rbacProfileIdentifier = installationArgs.rbacProfile;
    }
    if (installationArgs.jobName) {
      if(yamlObj.zowe.job == undefined){
        yamlObj.zowe.job = {
          name: "",
          prefix: ""
        }
      }
      yamlObj.zowe.job.name = installationArgs.jobName;
    }
    if (installationArgs.jobPrefix) {
      yamlObj.zowe.job.prefix = installationArgs.jobPrefix;
    }
    if (installationArgs.cookieId) {
      yamlObj.zowe.cookieIdentifier = installationArgs.cookieId;
    }
    if (installationArgs.javaHome) {
      if(yamlObj.java == undefined){
        yamlObj.java = {home: ""}
      }
      yamlObj.java.home = installationArgs.javaHome;
    }
    if (installationArgs.nodeHome) {
      if(yamlObj.node == undefined){
        yamlObj.node = {home: ""}
      }
      yamlObj.node.home = installationArgs.nodeHome;
    }
    if (installationArgs.zosmfHost) {
      if(yamlObj.zOSMF == undefined){
        yamlObj.zOSMF = {host: "", port: "443", applId: ""}
      }
      yamlObj.zOSMF.host = installationArgs.zosmfHost;
    }
    if (installationArgs.zosmfPort) {
      yamlObj.zOSMF.port = installationArgs.zosmfPort;
    }
    if (installationArgs.zosmfApplId) {
      yamlObj.zOSMF.applId = installationArgs.zosmfApplId;
    }
  }

  public async getExampleYamlAndSchemas (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: InstallationArgs,
  ): Promise<IResponse> {
    try{
      ProgressStore.set('downloadUnpax.getSchemas', false);
      ProgressStore.set('downloadUnpax.getExampleYaml', false);
      const currentConfig: any = ConfigurationStore.getConfig();
      let yamlObj
      const zoweRuntimePath = installationArgs.installationDir;
      let readPaxYamlAndSchema = await this.readExampleYamlAndSchema(connectionArgs, zoweRuntimePath);
      let parsedSchema = false, parsedYaml = false;
      if(readPaxYamlAndSchema.details.yaml){
        const yamlFromPax = readPaxYamlAndSchema.details.yaml;
        let yamlSchema;
        if(yamlFromPax){
          try {
            yamlObj = parse(yamlFromPax);
            if (currentConfig) {
              yamlObj = deepMerge(yamlObj, currentConfig);
            }
            this.mergeYamlAndInstallationArgs(yamlObj, installationArgs);
            ConfigurationStore.setConfig(yamlObj);
            ProgressStore.set('downloadUnpax.getExampleYaml', true);
            parsedYaml = true;
          } catch(e) {
            console.log('error parsing example-zowe.yaml:', e);
            ProgressStore.set('downloadUnpax.getExampleYaml', false);
            return {status: false, details: {message: e.message}}
          }
        } else {
          console.log("no yaml found from pax");
          ProgressStore.set('downloadUnpax.getExampleYaml', false);
          return {status: false, details: {message: "no yaml found from pax"}}
        }

        //No reason not to always set schema to latest if user is re-running installation
        if(readPaxYamlAndSchema.details.yamlSchema && readPaxYamlAndSchema.details.serverCommon){
          try {
            yamlSchema = JSON.parse(readPaxYamlAndSchema.details.yamlSchema);
            const serverCommon = JSON.parse(readPaxYamlAndSchema.details.serverCommon);
            updateSchemaReferences(readPaxYamlAndSchema.details, yamlSchema);
            if(yamlSchema && serverCommon){
              // Hardcoding
              yamlSchema.properties.zowe.properties.setup.properties.dataset.properties.parmlibMembers.properties.zis = zoweDatasetMemberRegexFixed;
              ConfigurationStore.setSchema(yamlSchema);
              parsedSchema = true;
              ProgressStore.set('downloadUnpax.getSchemas', true);
            }
          } catch (e) {
            console.log('error setting schema from pax:', e);
            ProgressStore.set('downloadUnpax.getSchemas', false);
            ConfigurationStore.setSchema(FALLBACK_SCHEMA);
            return {status: false, details: {message: e.message}}
          }
        } else {
          console.log('no schema found from pax');
          ProgressStore.set('downloadUnpax.getSchemas', false);
          ConfigurationStore.setSchema(FALLBACK_SCHEMA);
          return {status: false, details: {message: 'no schemas found from pax'}}
        }
        return {status: parsedSchema && parsedYaml, details: {message: "Successfully retrieved example-zowe.yaml and schemas", mergedYaml: yamlObj, yamlSchema: yamlSchema}}
      }
    } catch (e) {
      ConfigurationStore.setSchema(FALLBACK_SCHEMA);
      return {status: false, details: e.message};
    }

  }

  public async downloadUnpax (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: InstallationArgs,
    version: string,
  ): Promise<IResponse> {

    // Initialize Progress Store For unpaxing
    ProgressStore.set('downloadUnpax.uploadYaml', false);
    ProgressStore.set('downloadUnpax.download', false);
    ProgressStore.set('downloadUnpax.upload', false);
    ProgressStore.set('downloadUnpax.unpax', false);
    ProgressStore.set('downloadUnpax.getExampleYaml', false);
    ProgressStore.set('downloadUnpax.getSchemas', false);
    

    let currentConfig: any = ConfigurationStore.getConfig();
    if(currentConfig.installationArgs) delete currentConfig.installationArgs;
    const SMPE_INSTALL: boolean = installationArgs.installationType === "smpe";
    const savingResult = await this.generateYamlFile(currentConfig);
    if (!savingResult.status) {
      console.log("failed to save yaml");
      return savingResult;
    }
    
    try {
      console.log("uploading yaml...");
      const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
      ProgressStore.set('downloadUnpax.uploadYaml', uploadYaml.status);

      if(!uploadYaml.status){
        return {status: false, details: `Error uploading yaml configuration: ${uploadYaml.details}`};
      }

      let download, upload, unpax;
      if(installationArgs.installationType === "download"){
        console.log("downloading...", version);
        download = await this.downloadPax(version);
        ProgressStore.set('downloadUnpax.download', download.status);
      } else {
        //if the user has selected an SMPE or opted to upload their own pax, we simply set this status to true as no download is required
        download = {status: true, details: ''}
        ProgressStore.set('downloadUnpax.download', true);
      }

      if(!download.status){
        return {status: false, details: `Error downloading pax: ${download.details}`};
      }

      console.log("uploading...");
      if(installationArgs.installationType === "upload"){
        //upload the PAX the user selected in the "Install Type" stage to the installation dir (from the planning stage)
        console.log('Uploading user selected pax from ', installationArgs.userUploadedPaxPath)
        upload = await new FileTransfer().upload(connectionArgs, installationArgs.userUploadedPaxPath, path.join(installationArgs.installationDir, "zowe.pax"), DataType.BINARY)
      } else if (installationArgs.installationType === "download"){
        console.log('Uploading pax downloaded from jfrog')
        upload = await this.uploadPax(connectionArgs, installationArgs.installationDir);
      }
      ProgressStore.set('downloadUnpax.upload', upload.status);

      if(!upload.status){
        return {status: false, details: `Error uploading pax: ${upload.details}`};
      }

      if (!SMPE_INSTALL) {
        console.log("unpaxing...");
        unpax = await this.unpax(connectionArgs, installationArgs.installationDir); 
        ProgressStore.set('downloadUnpax.unpax', unpax.status);

        if (!unpax.status) {
          return {status: false, details: `Error unpaxing Zowe archive: ${unpax.details}`};
        }
      }
      let yamlObj = {};
      let yamlSchema = {};
      await this.getExampleYamlAndSchemas(connectionArgs, installationArgs).then((res: IResponse) => {
        if(res.status){
          if(res.details.mergedYaml != undefined){
            yamlObj = res.details.mergedYaml;
            yamlSchema = res.details.yamlSchema;
          }
        }
      })
      return {status: download.status && uploadYaml.status && upload.status && unpax.status, details: {message: 'Zowe unpax successful.', mergedYaml: yamlObj, yamlSchema: yamlSchema}};
    } catch (error) {
      return {status: false, details: error.message};
    }
  }

  public async runInstallation (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: InstallationArgs,
  ): Promise<IResponse> {
    // Initialize Progress Store For Dataset Installation
    ProgressStore.set('installation.uploadYaml', false);
    ProgressStore.set('installation.install', false);
    ProgressStore.set('installation.initMVS', false);
    let currentConfig: any = ConfigurationStore.getConfig();
    if(currentConfig.installationArgs) delete currentConfig.installationArgs;
    const savingResult = await this.generateYamlFile(currentConfig);
    if (!savingResult.status) {
      console.log("failed to save yaml");
      return savingResult;
    }
    
    try {
      console.log("uploading yaml...");
      const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
      ProgressStore.set('installation.uploadYaml', uploadYaml.status);

      if(!uploadYaml.status){
        return {status: false, details: `Error uploading yaml configuration: ${uploadYaml.details}`};
      }

      let installation;
      if (installationArgs.installationType !== "smpe") {
        console.log("installing...");
        installation = await this.install(connectionArgs, installationArgs);
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
         initMvs = await this.initMVS(connectionArgs, installationArgs);
        ProgressStore.set('installation.initMVS', initMvs.status);
      } else {
        initMvs = {status: false, details: `zwe install step failed, unable to run zwe init mvs.`}
        ProgressStore.set('installation.initMVS', false);
      }

      if(!initMvs.status){
        return {status: false, details: `Error running zwe init mvs: ${initMvs.details}`};
      }      

      return {status: installation.status && initMvs.status, details: {message: 'Zowe install successful.'}};
    } catch (error) {
      return {status: false, details: error.message};
    }
  }

  public async runApfAuth(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse>{
    ProgressStore.set('apfAuth.writeYaml', false);
    ProgressStore.set('apfAuth.uploadYaml', false);
    ProgressStore.set('apfAuth.success', false);
    let currentConfig: any = ConfigurationStore.getConfig();
    if(currentConfig.installationArgs) delete currentConfig.installationArgs;
    console.log('writing current yaml to disk');
    const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
    await fs.writeFile(filePath, stringify(currentConfig), (err) => {
      if (err) {
          console.warn("Can't save configuration to zowe.yaml");
          return ProgressStore.set('apfAuth.writeYaml', false);
      }
    });
    ProgressStore.set('apfAuth.writeYaml', true);
    console.log("uploading yaml...");
    const uploadYaml = await this.uploadYaml(connectionArgs,installationArgs.installationDir);
    if(!uploadYaml.status){
      ProgressStore.set('apfAuth.uploadYaml', false);
      return {status: false, details: 'Failed to upload YAML file'}

    }
    ProgressStore.set('apfAuth.uploadYaml', uploadYaml.status);
    console.log("Check out this install arg! " + installationArgs.installationDir);
    const script = `cd ${installationArgs.installationDir}/bin;./zwe init apfauth -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten --update-config`;
    const result = await new Script().run(connectionArgs, script);
    ProgressStore.set('apfAuth.success', result.rc === 0);
    return {status: result.rc === 0, details: result.jobOutput}
  }
  
  public async runInitSecurity(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse>{
      ProgressStore.set('initSecurity.writeYaml', false);
      ProgressStore.set('initSecurity.uploadYaml', false);
      ProgressStore.set('initSecurity.success', false);
      let currentConfig: any = ConfigurationStore.getConfig();
      if(currentConfig.installationArgs) delete currentConfig.installationArgs;
      console.log('writing current yaml to disk');
      const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
      await fs.writeFile(filePath, stringify(currentConfig), (err) => {
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
      console.log("Check out this install arg! " + installationArgs.installationDir);
      const script = `cd ${installationArgs.installationDir}/bin;./zwe init security -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten --update-config`;
      const result = await new Script().run(connectionArgs, script);
      ProgressStore.set('initSecurity.success', result.rc === 0);
      return {status: result.rc === 0, details: result.jobOutput}
  }

  public async initStcs(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse>{
      let currentConfig: any = ConfigurationStore.getConfig();
      if(currentConfig.installationArgs) delete currentConfig.installationArgs;

      // Initialize Progress Store For Stcs
      ProgressStore.set('initStcs.writeYaml', false);
      ProgressStore.set('initStcs.uploadYaml', false);
      ProgressStore.set('initStcs.success', false);

      console.log('writing current yaml to disk');
      const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
      await fs.writeFile(filePath, stringify(currentConfig), (err) => {
        if (err) {
          console.warn("Can't save configuration to zowe.yaml");
          ProgressStore.set('initStcs.writeYaml', false);
          return {status: false, details: `Can't save configuration to zowe.yaml`};
        }
      });
      ProgressStore.set('initStcs.writeYaml', true);
      console.log("uploading yaml...");
      const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
      if(!uploadYaml.status){
        return {status: false, details: `Error uploading yaml configuration: ${uploadYaml.details}`};
      }
      ProgressStore.set('initStcs.uploadYaml', uploadYaml.status);
      const script = `cd ${installationArgs.installationDir + '/bin'};./zwe init stc -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten --update-config`;
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

      ProgressStore.set('initStcs.success', result.rc === 0 && !errorFound);
      return {status: result.rc === 0 && !errorFound, details: result.jobOutput, error: errorFound, errorMsg: errorMessage }

  }

  async initCertificates(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs){
    ProgressStore.set('certificate.writeYaml', false);
    ProgressStore.set('certificate.uploadYaml', false);;
    ProgressStore.set('certificate.zweInitCertificate', false);
    let currentConfig: any = ConfigurationStore.getConfig();
    if(currentConfig.installationArgs) delete currentConfig.installationArgs
    console.log('writing current yaml to disk');
    const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
    await fs.writeFile(filePath, stringify(currentConfig), (err: any) => {
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
    console.log("Check out this install arg! " + installationArgs.installationDir);
    const script = `cd ${installationArgs.installationDir + '/bin'};./zwe init certificate --update-config -c ${installationArgs.installationDir}/zowe.yaml`;
    const result = await new Script().run(connectionArgs, script);
    ProgressStore.set('certificate.zweInitCertificate', result.rc === 0);
    const yamlPath = `${installationArgs.installationDir}/zowe.yaml`;
    // const tagScript = `chtag -t -c ISO8859-1 ${yamlPath}`;
    // const tagResult = await new Script().run(connectionArgs, tagScript);
    const yaml = await new FileTransfer().download(connectionArgs, yamlPath, DataType.ASCII);
    var parsedYaml;
    try{
      parsedYaml = JSON.parse(JSON.stringify(parse(yaml)));
    } catch (e){
      console.log('error parsing yaml:', e.message);
    }
    return {status: result.rc === 0, details: {jobOutput: result.jobOutput, updatedYaml: parsedYaml}}
  }

  public async initVsam(connectionArgs: IIpcConnectionArgs,
    installationArgs: InstallationArgs): Promise<IResponse>{
      let currentConfig: any = ConfigurationStore.getConfig();
      if(currentConfig.installationArgs) delete currentConfig.installationArgs;
      // Initialize Progress Store For Vsam
      ProgressStore.set('initVsam.writeYaml', false);
      ProgressStore.set('initVsam.uploadYaml', false);
      ProgressStore.set('initVsam.success', false);

      console.log('writing current yaml to disk');
      const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
      await fs.writeFile(filePath, stringify(currentConfig), (err) => {
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
      const script = `cd ${installationArgs.installationDir + '/bin'};./zwe init vsam -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten --update-config`;
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

  async uploadYaml(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
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

  async install(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
  }

  async initMVS(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
  }

  async readExampleYamlAndSchema(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse>{
    return {status: false, details: 'Method not implemented.'}
  }
  
}

export class FTPInstallation extends Installation {

  async uploadYaml(connectionArgs: IIpcConnectionArgs, installDir: string) {
    const tempPath = path.join(app.getPath("temp"), "zowe.yaml");
    const filePath = path.join(installDir, "zowe.yaml");
    console.log(`Uploading ${tempPath} to ${filePath}`)
    await new FileTransfer().upload(connectionArgs, tempPath, filePath, DataType.BINARY)
    // console.log("Check out this install arg! " + installDir);
    const script = `cd ${installDir}; cat zowe.yaml | grep 'zowe' > /dev/null; if [ $? -eq 0 ]; then if [ $(chtag -p zowe.yaml | cut -f 2 -d" ") != "untagged" ]; then iconv -f iso8859-1 -t 1047 zowe.yaml > zowe.yaml.1047; mv zowe.yaml.1047 zowe.yaml; chtag -tc 1047 zowe.yaml; fi; else iconv -f iso8859-1 -t 1047 zowe.yaml > zowe.yaml.1047; mv zowe.yaml.1047 zowe.yaml; chtag -tc 1047 zowe.yaml; fi`;
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
    const script = `mkdir ${installDir};cd ${installDir} && pax -ppx -rf ./zowe.pax;rm -rf ./zowe.pax`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }

  async install(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs) {
    const script = `cd ${installationArgs.installationDir + '/bin' }; ./zwe install -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }
  
  async initMVS(connectionArgs: IIpcConnectionArgs, installationArgs: InstallationArgs) {
    const script = `cd ${installationArgs.installationDir + '/bin' }; ./zwe init mvs -c ${installationArgs.installationDir}/zowe.yaml --allow-overwritten`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }

  async readExampleYamlAndSchema(connectionArgs: IIpcConnectionArgs, installDir: string){
    try {    
      const yamlPath = `${installDir}/example-zowe.yaml`;
      const yaml = await new FileTransfer().download(connectionArgs, yamlPath, DataType.ASCII);
      const yamlSchemaPath = `${installDir}/schemas/zowe-yaml-schema.json`;
      const yamlSchema = await new FileTransfer().download(connectionArgs, yamlSchemaPath, DataType.ASCII);
      const serverCommonPath = `${installDir}/schemas/server-common.json`;
      const serverCommon = await new FileTransfer().download(connectionArgs, serverCommonPath, DataType.ASCII);
      return {status: true, details: {yaml, yamlSchema, serverCommon}};
    } catch (e) {
      console.log("Error downloading example-zowe.yaml and schemas:", e.message);
      return {status: false, details: {yaml: '', yamlSchema: '', serverCommon: ''}}  
    }
  }

  async checkInstallData() {
    // FIXME: Refine installation data validation
  }
}

export class CLIInstallation extends Installation {

}
