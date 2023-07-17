/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import {connectFTPServer} from "./utils";
import {IIpcConnectionArgs, IJobResults, JobOutput} from "../types/interfaces";

export async function submitJcl(config: IIpcConnectionArgs, jcl: string, returnDDs: string[]): Promise<IJobResults> {

  return new Promise(async (resolve, reject) => {
    let jobOutput: IJobResults;
    let client
    try {
      client = await connectFTPServer(config);
      const jobId = await client.submitJCL(jcl);
      console.log(`jobId: ${jobId}`);
      jobOutput = await waitForjobToFinish(client, jobId, returnDDs)

      client.close();

      resolve(jobOutput);

    } catch (err) {
      console.error(err)
      client.close()
      reject(err)
    }
  })
}

async function waitForjobToFinish(client: any, jobId: string, returnDDs: string[]): Promise<IJobResults> {
  let jobStatus: any
  let jobOutput: JobOutput;

  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    jobStatus = await client.getJobStatus(jobId)
  } catch (e) {
    throw new Error("Error: " + e )
  }

  for (let i = 0; jobStatus['status'] !== 'OUTPUT'; i++) {
    if (i < 10) {
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 250));
    } else {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    try {
      jobStatus = await client.getJobStatus(jobId)
    } catch (e) {
      throw new Error("Error: " + e )
    }
  }

  if (jobStatus['rc'] === 0) {
    console.log(returnDDs)
    jobOutput = await gatherAll(client, jobStatus)
  } else {
    jobOutput = await gatherAll(client, jobStatus)
  }
  return {rc: jobStatus['rc'], jobOutput: jobOutput};
}

async function gatherAll(client: any, jobStatus: any): Promise<JobOutput> {
  const ddnames: JobOutput = {}
  // REVIEW why *?
  ddnames["*"] = await client.getJobLog('*', jobStatus['jobid'], 'x')
  ddnames["*"].split(/\s*!! END OF JES SPOOL FILE !!\s*/)
    .forEach(function (spoolFile, i) {
      if (spoolFile.length > 0) {
          ddnames[i] = spoolFile;
      }
  });
  return ddnames
}
