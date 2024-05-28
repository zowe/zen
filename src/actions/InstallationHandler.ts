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
import { InstallationArgs } from '../renderer/components/stages/installation/installationSlice';

class Installation {

  public async runInstallation (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: InstallationArgs,
    version: string,
    zoweConfig: any,
    skipDownload: boolean
  ): Promise<IResponse> {
    const currentConfig: any = ConfigurationStore.getConfig();
    const SMPE_INSTALL: boolean = installationArgs.installationType === "smpe";
    const savingResult = await this.generateYamlFile(zoweConfig);
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
        unpax = upload = download = {status: true, details: ''}
        ProgressStore.set('installation.download', true);
      }

      if(!download.status){
        return {status: false, details: `Error downloading pax: ${download.details}`};
      }

      if (!SMPE_INSTALL) {
        console.log("unpaxing...");
        unpax = await this.unpax(connectionArgs, installationArgs.installationDir); 
        ProgressStore.set('installation.unpax', unpax.status);

        if (!unpax.status) {
          return {status: false, details: `Error unpaxing Zowe archive: ${unpax.details}`};
        }
      }
      let yamlObj
      let zoweRuntimePath = installationArgs.installationType === "smpe" ? installationArgs.installationDir : installationArgs.installationDir + "/runtime";
      let readPaxYamlAndSchema = await this.readExampleYamlAndSchema(connectionArgs, zoweRuntimePath);
      if(readPaxYamlAndSchema.details.yaml){
        const parseExampleYamlFromPax = function(catPath: string){
          const jobOutputSplit = JSON.stringify(readPaxYamlAndSchema.details.yaml).split(`cat ${catPath}\\r\\n`)
          if(jobOutputSplit[1]){
            const trimmedYamlSchema = jobOutputSplit[1].split(`+ echo 'Script finished.'`)[0].split(`Script finished.`);
            // console.log("\n\n *** trimmedYamlSchema[0]: ", trimmedYamlSchema[0].replaceAll(`\\r\\n`, `\r\n`).replaceAll(`\\"`, `"`));
            return trimmedYamlSchema[0].replaceAll(`\\r\\n`, `\r\n`).replaceAll(`\\"`, `"`);
          }
          return "";
        }
        const yamlFromPax = parseExampleYamlFromPax(`${zoweRuntimePath}/example-zowe.yaml`);
        if(yamlFromPax){
          try {
            yamlObj = parse(yamlFromPax);
            if (currentConfig) {
              console.log("current config:", JSON.stringify(currentConfig));
              // console.log("yamlObj: ", JSON.stringify(yamlObj));
              yamlObj = {...currentConfig, ...yamlObj}
              console.log("merged yamlObj: ", JSON.stringify(yamlObj));
            }
            if (yamlObj.zowe.runtimeDirectory === undefined && installationArgs.installationDir) {
              yamlObj.zowe.runtimeDirectory = installationArgs.installationDir;
            }
            if (yamlObj.zowe.workspaceDirectory === undefined && installationArgs.workspaceDir) {
              yamlObj.zowe.workspaceDirectory = installationArgs.workspaceDir;
            }
            if (yamlObj.zowe.logDirectory === undefined && installationArgs.logDir) {
              yamlObj.zowe.logDirectory = installationArgs.logDir;
            }
            if (yamlObj.zowe.extensionDirectory === undefined && installationArgs.extensionDir) {
              yamlObj.zowe.extensionDirectory = installationArgs.extensionDir;
            }
            if (yamlObj.zowe.rbacProfileIdentifier === undefined && installationArgs.rbacProfile) {
              yamlObj.zowe.rbacProfileIdentifier = installationArgs.rbacProfile;
            }
            if (yamlObj.zowe.job.name === undefined && installationArgs.jobName) {
              yamlObj.zowe.job.name = installationArgs.jobName;
            }
            if (yamlObj.zowe.job.prefix === undefined && installationArgs.jobPrefix) {
              yamlObj.zowe.job.prefix = installationArgs.jobPrefix;
            }
            if (yamlObj.zowe.cookieIdentifier === undefined && installationArgs.cookieId) {
              yamlObj.zowe.cookieIdentifier = installationArgs.cookieId;
            }
            if (yamlObj.java.home === undefined && installationArgs.javaHome) {
              yamlObj.java.home = installationArgs.javaHome;
            }
            if (yamlObj.node.home === undefined && installationArgs.nodeHome) {
              yamlObj.node.home = installationArgs.nodeHome;
            }
            if (yamlObj.zOSMF.host === undefined && installationArgs.zosmfHost) {
              yamlObj.zOSMF.host = installationArgs.zosmfHost;
            }
            if (yamlObj.zOSMF.port === undefined && installationArgs.zosmfPort) {
              yamlObj.zOSMF.port = installationArgs.zosmfPort;
            }
            if (yamlObj.zOSMF.applId === undefined && installationArgs.zosmfApplId) {
              yamlObj.zOSMF.applId = installationArgs.zosmfApplId;
            }
            if (zoweConfig) {
              yamlObj = {...yamlObj, ...zoweConfig};
            }
            console.log('Setting merged yaml:', JSON.stringify(yamlObj));
            ConfigurationStore.setConfig(yamlObj);
          } catch(e) {
            console.log('error parsing example-zowe.yaml:', e);
          }
        } else {
          console.log("no yaml found from pax");
        }

        //No reason not to always set schema to latest if user is re-running installation
        if(readPaxYamlAndSchema.details.yamlSchema && readPaxYamlAndSchema.details.serverCommon){
          const parseSchemaFromPax = function(inputString: string, catPath: string){
            const jobOutputSplit = inputString.split(`cat ${catPath}\\r\\n`)
            if(jobOutputSplit[1]){
              const trimmedYamlSchema = jobOutputSplit[1].split(`Script finished.`)[0].split(`Script finished.`);
              return trimmedYamlSchema[0].replaceAll(`\\r\\n`, `\r\n`).replaceAll(`\\"`, `"`).replaceAll(`\\\\"`, `\\"`);
            }
            return "";
          }
          try {
            let yamlSchema = JSON.parse(parseSchemaFromPax(JSON.stringify(readPaxYamlAndSchema.details.yamlSchema), `${zoweRuntimePath}/schemas/zowe-yaml-schema.json`));
            const serverCommon = JSON.parse(parseSchemaFromPax(JSON.stringify(readPaxYamlAndSchema.details.serverCommon), `${zoweRuntimePath}/schemas/server-common.json`));
            // console.log('yaml schema:', parseSchemas(JSON.stringify(readPaxYamlAndSchema.details.yamlSchema), `${zoweRuntimePath}/schemas/zowe-yaml-schema.json`));
            // console.log('server common', parseSchemas(JSON.stringify(readPaxYamlAndSchema.details.serverCommon), `${zoweRuntimePath}/schemas/server-common.json`));
            if(yamlSchema && serverCommon){
              // FIXME: Link schema by $ref properly - https://jsonforms.io/docs/ref-resolving
              // Without these, AJV does not properly find $refs in the schema and therefore validation cannot occur
              yamlSchema.properties.zowe.properties.setup.properties.dataset.properties.parmlibMembers.properties.zis = serverCommon.$defs.datasetMember;
              yamlSchema.properties.zowe.properties.setup.properties.certificate.properties.pkcs12.properties.directory = serverCommon.$defs.path;
              yamlSchema.$id = serverCommon.$id;
              if(yamlSchema.$defs?.networkSettings?.properties?.server?.properties?.listenAddresses?.items){
                delete yamlSchema.$defs?.networkSettings?.properties?.server?.properties?.listenAddresses?.items?.ref;
                yamlSchema.$defs.networkSettings.properties.server.properties.listenAddresses.items = serverCommon.$defs.ipv4
              }
              console.log('Setting schema from runtime dir:', JSON.stringify(yamlSchema));
              ConfigurationStore.setSchema(yamlSchema);
            }
          } catch (e) {
            console.log('error setting schema from pax:', e);
          }
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
         initMvs = await this.initMVS(connectionArgs, installationArgs.installationDir);
        ProgressStore.set('installation.initMVS', initMvs.status);
      } else {
        initMvs = {status: false, details: `zwe install step failed, unable to run zwe init mvs.`}
        ProgressStore.set('installation.initMVS', false);
      }

      if(!initMvs.status){
        return {status: false, details: `Error running zwe init mvs: ${initMvs.details}`};
      }      

      return {status: download.status && uploadYaml.status && upload.status && unpax.status && installation.status && initMvs.status, details: {message: 'Zowe install successful.', mergedYaml: yamlObj}};
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

  async install(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    return {status: false, details: 'Method not implemented.'}
  }

  async initMVS(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
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

  async readExampleYamlAndSchema(connectionArgs: IIpcConnectionArgs, installDir: string){
    const catYaml = `cat ${installDir}/example-zowe.yaml`;
    const yamlResult = await new Script().run(connectionArgs, catYaml);
    const catYamlSchema = `cat ${installDir}/schemas/zowe-yaml-schema.json`;
    const yamlSchemaResult = await new Script().run(connectionArgs, catYamlSchema);
    const catCommonSchema = `cat ${installDir}/schemas/server-common.json`;
    const commonSchemaResult = await new Script().run(connectionArgs, catCommonSchema);
    return {status: yamlResult.rc === 0 && yamlSchemaResult.rc == 0 && commonSchemaResult.rc == 0, details: {yaml: yamlResult.jobOutput, yamlSchema: yamlSchemaResult.jobOutput, serverCommon: commonSchemaResult.jobOutput}}
  }

  async checkInstallData() {
    // FIXME: Refine installation data validation
  }
}

export class CLIInstallation extends Installation {

}
