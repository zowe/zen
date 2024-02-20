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
import { JCL_UNIX_SCRIPT_OK, startBPXBATCHAndShellSession } from "./utils";

export class CheckSpace {

  public async run(config: IIpcConnectionArgs, dir: string) {

    const jcl = `${config.jobStatement}
${startBPXBATCHAndShellSession("ZNCHKSP")}
echo "SPACE in MB" &&
df -m ${dir} &&
echo "${JCL_UNIX_SCRIPT_OK}"
/* `

    const resp: IJobResults = await submitJcl(config, jcl, ["STDOUT", "STDERR"])
    /* find ${install} and parse then the rest by two(2x) space? */
    if (resp.rc === 0 && resp.jobOutput && resp.jobOutput["3"]) {
      return {status: true, details: resp.jobOutput["3"]};
    } else {
      return {status: false, details: `${resp.rc}: ${resp.jobOutput}`};
    }
  }
}
