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

// Note: This file is not usable by the Renderer

export const JCL_UNIX_SCRIPT_CHARS = 70;

export const JCL_JOBNAME_DEFAULT = "ZENJOB";

export const MKDIR_ERROR_PARENT = "EDC5129I"; // when MKDIR tries to create top-level dir in a dir that doesn't exist

export const MKDIR_ERROR_EXISTS = "EDC5117I"; // when dir already exist

export const MKDIR_ERROR_BADARGS= "EDC5134I"; // when func not implemented

export const LIST_ERROR_NOTFOUND = "FSUM6785"; // when dir doesn't exist

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
    if (error.toString().includes(LIST_ERROR_NOTFOUND) == false) { // List cmd returns an error for not found, so hide that one
      console.warn(error);
    }
    return false;
  } finally {
    client.close();
  }
}

export async function makeDir(config: IIpcConnectionArgs, dir: string): Promise<any> {
  if (!isValidUSSPath(dir)) {
    console.warn("Attempted to create invalid Unix directory: " + dir);
    return false;
  }
  const client = await connectFTPServer(config);
  try {
    await client.makeDirectory(dir);
    return true;
  } catch (error) {
    if (error.toString().includes(MKDIR_ERROR_PARENT)) {
      let parentDir = reducePath(dir);
      if (parentDir !== "/") {
        console.info("Wasn't able to create: '" + dir + "'. Will attempt to create: " + parentDir);
        await makeDir(config, parentDir);
        return makeDir(config, dir);
      }
    }
    if (error.toString().includes(MKDIR_ERROR_EXISTS)) {
      return true;
    }
    if (error.toString().includes(MKDIR_ERROR_BADARGS)) {
      console.info("Wasn't able to create: '" + dir + "'. Problem with using mkdir. Method usage is not implemented (bad arguments?)");
    } else {
      console.warn(error);
    }
    return false;
  } finally {
    client.close();
  }
}

// /u/tsxxx/blaa --> /u/tsxxx
export function reducePath(path: string): string {
  if (path.lastIndexOf('/') > 0) {
    path = path.slice(0, path.lastIndexOf('/'));
  }
  return path; // stops at "/"
}

// Check if the path starts with a slash and does not contain spaces
export function isValidUSSPath(path: string): boolean {
  const validUSSRegex = /^\/[\w\/-]+$/;
  return validUSSRegex.test(path);
}

// This adds a "\n" inside Unix commands separated by ";" if char limit reached
export function parseUnixScriptByNumOfChars(script: string, charCount: number = JCL_UNIX_SCRIPT_CHARS): string {
  const parts: string[] = [];
  let currentPart = '';
  let counter = 0;

  for (let i = 0; i < script.length; i++) {
      if (counter >= charCount) {
          const lastSpaceIndex = currentPart.lastIndexOf(' ');

          if (lastSpaceIndex !== -1) {
              // If there's a space within the character limit, backtrack to the last encountered space
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
