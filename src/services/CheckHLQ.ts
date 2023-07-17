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

export class CheckHLQ {

  public async run(config: IIpcConnectionArgs, hlq: string, jobheader: string) {

    const jcl = `${jobheader}
//DEFINSO  EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSUDUMP DD SYSOUT=*
//AMSDUMP  DD SYSOUT=*
//SYSIN    DD *
DELETE ${hlq}
      SET MAXCC=0
/*
//*-------------------------------------------------------------------*
//ALLOC    EXEC PGM=IEFBR14
//OUT      DD DSN=${hlq},
//            STORCLAS=TSO,UNIT=3390,
//            DISP=(NEW,CATLG,DELETE),
//            DSNTYPE=LIBRARY,
//            SPACE=(TRK,(15,5)),
//            RECFM=FB,LRECL=80,BLKSIZE=3120,DSORG=PO
//*
//STDOUT   DD  SYSOUT=*
//STDERR   DD  SYSOUT=*
//SYSOUT   DD SYSOUT=*
//SYSPRINT DD SYSOUT=*
//*
/* `

    const resp: IJobResults = await submitJcl(config, jcl, ["STDOUT", "STDERR"])
/*max cc*/
    return resp.jobOutput
  }
}
