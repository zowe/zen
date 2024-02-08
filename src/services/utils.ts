/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import {IIpcConnectionArgs} from "../types/interfaces";
import Header from "../renderer/components/Header"
import { AlertColor } from "@mui/material/Alert";
import zos from 'zos-node-accessor';

export const JCL_UNIX_SCRIPT_CHARS = 70;

export const JCL_JOBNAME_DEFAULT = "ZENJOB";

export async function connectFTPServer(config: IIpcConnectionArgs): Promise<any> {

  const client = new zos();
  //Config Doc: https://github.com/IBM/zos-node-accessor/blob/3e32cc8b8cbd74c6bc3c29c268338e23f173bebc/README.md?plain=1#L89
  await client.connect(config);
  if (!client.connected) {
    console.error('Failed to connect to', config.host);
  }
  return client;
}

export async function checkDirExists(config: IIpcConnectionArgs, dir: string): Promise<any> {
  const client = await connectFTPServer(config);
  try {
    const list = await client.listDataset(dir);
    return !!list;
  } catch (error) {
    return false;
  } finally {
    client.close();
  }
}

export async function makeDir(config: IIpcConnectionArgs, dir: string): Promise<any> {
  const client = await connectFTPServer(config);
  try {
    await client.makeDirectory(dir);
    return true;
  } catch (error) {
    return false;
  } finally {
    client.close();
  }
}

export function splitUnixScriptByNumOfChars(script: string, charCount: number = JCL_UNIX_SCRIPT_CHARS): string {
  const parts: string[] = [];
  let currentPart = '';
  let counter = 0;

  for (let i = 0; i < script.length; i++) {
      if (counter >= charCount) {
          // Check if we've exceeded the character limit
          const lastSpaceIndex = currentPart.lastIndexOf(' ');

          if (lastSpaceIndex !== -1) {
              // If there's a space within the character limit, backtrack to the last space
              const backtrackedPart = currentPart.substring(0, lastSpaceIndex);
              parts.push(backtrackedPart);
              currentPart = currentPart.substring(lastSpaceIndex + 1);
          }
          if (currentPart.length > 0) {
              // Add the current part and reset the counter
              parts.push('\n');
              counter = 0;
          }
      }
      currentPart += script[i];
      counter++;
  }
  if (currentPart.length > 0) {
      parts.push(currentPart);
  }
  return parts.join('');
}

export function startBPXBATCHAndShellSession(jobName: string = JCL_JOBNAME_DEFAULT): string {
  return `//${jobName}    EXEC PGM=BPXBATCH,REGION=0M
//STDOUT DD SYSOUT=*
//STDPARM      DD *
sh set -x;`;
}
