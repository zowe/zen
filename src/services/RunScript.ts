/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import {IIpcConnectionArgs, IJobResults} from "../types/interfaces";
import {submitJcl} from "./SubmitJcl";
import { parseUnixScriptByNumOfChars, startBPXBATCHAndShellSession } from "./ServiceUtils";
import { JCL_UNIX_SCRIPT_OK } from "../renderer/components/common/Constants";

export class Script {

  public async run(config: IIpcConnectionArgs, script: string) {

    const jcl = `${config.jobStatement}
${startBPXBATCHAndShellSession("ZNSCRPT")}
${parseUnixScriptByNumOfChars(script)} &&
echo "${JCL_UNIX_SCRIPT_OK}"
/* `
    console.log(`JOB: ${jcl}`)
    const resp: IJobResults = await submitJcl(config, jcl, ["STDOUT", "STDERR"])

    return resp
  }
}
