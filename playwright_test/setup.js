const zos = require('zos-node-accessor');
const https = require('https');
const fs = require('fs');
const JCL_JOBNAME_DEFAULT = "ZENJOB";

function startBPXBATCHAndShellSession(jobName) {
  return `//${jobName}    EXEC PGM=BPXBATCH,REGION=0M
//STDOUT DD SYSOUT=*
//STDPARM      DD *
sh set -x;`;
}
class Script {
  constructor(config) {
    this.config = config;
  }

  async mkdir(installDir) {
    const script = `mkdir -p ${installDir}`;
    return this.runShellCommand(script);
  }

  async remove(installDir) {
    const script = `rm -rf ${installDir}`;
    return this.runShellCommand(script);
  }

  static getZoweVersion() {
    return new Promise((resolve, reject) => {
      https.get('https://raw.githubusercontent.com/zowe/zowe-install-packaging/v2.x/master/manifest.json.template', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({ status: true, details: parsedData.version });
          } catch (error) {
            reject({ status: false, details: { error } });
          }
        });
      }).on('error', (error) => {
        reject({ status: false, details: { error } });
      });
    });
  }

  async download(installDir) {
    try {
      const { status, details: version } = await Script.getZoweVersion();
      if (!status) {
        throw new Error('Failed to retrieve Zowe version.');
      }

      const script = `URL="https://zowe.jfrog.io/zowe/list/libs-release-local/org/zowe";
      curl $URL/${version}/zowe-${version}.pax
      return this.runShellCommand(script);
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async unpax(installDir) {
    const script = `cd ${installDir}; pax -ppx -rf zowe.pax; rm zowe.pax`;
    return this.runShellCommand(script);
  }

  async checkDatasets(installDir) {
    if (this.client && this.client.connected) {
      return await this.client.listDataset(installDir);
    }
    return [];
  }

  async runShellCommand(script) {
     const jcl = `//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,
//         MSGLEVEL=(1,1),MSGCLASS=A
//RUNSCRP EXEC PGM=BPXBATCH,REGION=0M
//STDOUT DD SYSOUT=*
//STDERR DD SYSOUT=*
//STDPARM  DD *
sh set -x;
${script};
echo "Script finished."
/* `;

  try {
      console.log('Connecting to z/OS...');
      const client = new zos();
      await client.connect(this.config);
      this.client = client;

      console.log('Submitting JCL...');
      console.log('Submitting JCL:', jcl);
      const result = await client.submitJCL(jcl, ["STDOUT", "STDERR"]);
      console.log('Submission result:', result);
      console.log('Job Output:', result.jobOutput);

      if (result.rc === 0 && result.jobOutput && result.jobOutput["STDOUT"]) {
        console.log("---JCL OP RESULT: ", result.jobOutput, result.jobOutput["STDOUT"]);
        return { status: true, details: result.jobOutput["STDOUT"] };
      } else {
        console.log("---JOB SUBMISSION FAIL");
        return { status: false, details: `${result.rc}: ${result.jobOutput}` };
      }
    } catch (error) {
      console.error('Error during JCL submission:', error);
      return { status: false, details: `Error: ${error.message}` };
    }
  }
}

module.exports = Script;
