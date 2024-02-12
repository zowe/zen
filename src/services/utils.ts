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
    console.error(error);
    return false;
  } finally {
    client.close();
  }
}
