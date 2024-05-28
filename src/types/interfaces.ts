/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

export interface IJobResults {
  rc: number,
  jobOutput: JobOutput
}

export type JobOutput = {
  [key: string]: string;
};

export interface IIpcConnectionArgsSecureOptions {
  enableTrace: boolean;
  rejectUnauthorized: boolean;
  //per node doc, if secureContext missing, this object will be used to create instead
  //the content below is from the object meant to be passed to secureContext.
  maxVersion: string;
  minVersion: string;
}

export interface IIpcConnectionArgs {
  host: string; 
  port?: number; 
  connectionType?: 'ftp' | 'sftp' | 'zosmf' | 'cli'; 
  user: string; 
  password: string;
  jobStatement: string;
  secure: boolean;
  secureOptions: IIpcConnectionArgsSecureOptions;
}

// TODO: Add some structure to res.details to highlight proper input field
export interface IResponse {
  status: boolean;
  details: any;
  error?: boolean;
  errorMsg?: string;
}

