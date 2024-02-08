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
import {splitUnixScriptByNumOfChars, startBPXBATCHAndShellSession} from "./utils";

export class Script {

  public async run(config: IIpcConnectionArgs, script: string) {

    // TODO: Shouldn't we change ";" to "&&" to stop on first fail instead of keep going?
    const jcl = `${config.jobStatement}
${startBPXBATCHAndShellSession("ZNSCRPT")}
${splitUnixScriptByNumOfChars(script)};
echo "Script finished."
/* `
    console.log(`JOB: ${jcl}`)
    const resp: IJobResults = await submitJcl(config, jcl, ["STDOUT", "STDERR"])

    return resp
  }
}
