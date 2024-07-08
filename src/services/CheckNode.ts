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
import { startBPXBATCHAndShellSession } from "./ServiceUtils";
import { JCL_UNIX_SCRIPT_OK } from "../renderer/components/common/Utils";

export class CheckNode {

  public async run(config: IIpcConnectionArgs, node: string) {

    const jcl = `${config.jobStatement}
${startBPXBATCHAndShellSession("ZNCKNOD")}
${node}/bin/node -v &&
echo "${JCL_UNIX_SCRIPT_OK}"
/* `

    const resp: IJobResults = await submitJcl(config, jcl, ["STDOUT", "STDERR"])
    /* node: FSUM7351 not found
    /* check version is lower then 8.x */
    if (resp.rc === 0 && resp.jobOutput && resp.jobOutput["3"]) {
      return {status: true, details: resp.jobOutput["3"]};
    } else {
      return {status: false, details: `${resp.rc}: ${resp.jobOutput}`};
    }
  }
}
