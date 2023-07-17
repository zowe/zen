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
import { ConfigurationStore } from "../storage/ConfigurationStore";
import { ProgressStore } from "../storage/ProgressStore";

class Installation {

  public async runInstallation (
    connectionArgs: IIpcConnectionArgs, 
    installationArgs: {installationDir: string}, 
    version: string
  ): Promise<IResponse> {

    const savingResult = await this.generateYamlFile();
    if (!savingResult.status) {
      return savingResult;
    }
    
    try {
      console.log("uploading yaml...");
      const uploadYaml = await this.uploadYaml(connectionArgs, installationArgs.installationDir);
      ProgressStore.set('installation.uploadYaml', uploadYaml.status);

      console.log("downloading...", version);
      const download = await this.downloadPax(version);
      ProgressStore.set('installation.download', download.status);

      console.log("uploading...");
      const upload = await this.uploadPax(connectionArgs, installationArgs.installationDir);
      ProgressStore.set('installation.upload', upload.status);

      console.log("unpaxing...");
      const unpax = await this.unpax(connectionArgs, installationArgs.installationDir); 
      ProgressStore.set('installation.unpax', unpax.status);

      console.log("installing...");
      const install = await this.install(connectionArgs, installationArgs.installationDir);
      ProgressStore.set('installation.install', install.status);

      return {status: download.status && uploadYaml.status && upload.status && unpax.status && install.status, details: ''};
    } catch (error) {
      return {status: false, details: error.message};
    }
  }

  async generateYamlFile() {
    const zoweYaml: any = ConfigurationStore.getConfig();
    const fs = require('fs');
    const filePath = path.join(app.getPath('temp'), 'zowe.yaml')
    await fs.writeFile(filePath, stringify(zoweYaml), (err: any) => {
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
    throw new Error('Method not implemented.');
  }

  async uploadPax(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }

  async unpax(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    throw new Error('Method not implemented.');
  }

  async install(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    throw new Error('Method not implemented.');
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
    const result = await new FileTransfer().download_PAX(paxURL, tempPath);
    return {status: true, details: ''} // REVIEW file transfer results
  }

  async uploadPax(connectionArgs: IIpcConnectionArgs, installDir: string): Promise<IResponse> {
    const tempPath = path.join(app.getPath("temp"), "zowe.pax");
    const filePath = path.join(installDir, "zowe.pax");
    const result = await new FileTransfer().upload(connectionArgs, tempPath, filePath, DataType.BINARY);
    const fs = require('fs');
    try {
      fs.unlink(tempPath, () => {
        console.log("Deleted zowe.pax successfully.");
      });
    } catch (error) {
      console.log("Can't delete zowe.pax");
    }
    return result;
  }

  async unpax(connectionArgs: IIpcConnectionArgs, installDir: string) {
    const script = `mkdir ${installDir}/runtime;\ncd ${installDir}/runtime;\npax -ppx -rf ../zowe.pax;\nrm ../zowe.pax`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }

  async install(connectionArgs: IIpcConnectionArgs, installDir: string) {
    const script = `cd ${installDir}/runtime/bin;\n./zwe install -c ${installDir}/zowe.yaml`;
    const result = await new Script().run(connectionArgs, script);
    return {status: result.rc === 0, details: result.jobOutput}
  }

  async checkInstallData(args: Array<any>) {
    // FIXME: Refine installation data validation
  }
}

export class CLIInstallation extends Installation {

}