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
import {startBPXBATCHAndShellSession} from "./ServiceUtils";

export class CheckENV {

  public async run(connectionArgs: IIpcConnectionArgs) {
    const jcl = `${connectionArgs.jobStatement}
${startBPXBATCHAndShellSession("ZNCHKNV")}
echo $JAVA_HOME &&
echo $NODE_HOME;
/* `

    const resp: IJobResults = await submitJcl(connectionArgs, jcl, ["STDOUT", "STDERR"]);
    // REVIEW: Need to find better parsing option. For some responses, relevant info is in 4th element (3) or some in 3rd element (2)
    if (resp.rc === 0 && resp.jobOutput) { // Success case
      if (resp.jobOutput["3"]) {
        return {status: true, details: resp.jobOutput["3"]};
      }
    } else if (resp.jobOutput["2"]) { // Failure case, but do we have relevant info?
      return {status: false, details: resp.jobOutput["2"]};
    }
    return {status: false, details: `${resp.rc}: ${resp.jobOutput}`}; // Failure case, just send whatever you can I suppose
  }
}
