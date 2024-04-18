const zos = require('zos-node-accessor');
const https = require('https');

class Script {
  constructor(config) {
    this.config = config;
  }

  async mkdir(installDir) {
    const script = `mkdir -p ${installDir}`;
    return this.run(script);
  }
  
  async remove(installDir) {
    const script = `rm -rf ${installDir}`;
    return this.run(script);
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
-k
-o ${installDir}/zowe.pax`
      return this.run(script);
	} catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
  
  async unpax(installDir) {
    const script = `cd ${installDir};\npax -ppx -rf zowe.pax;\nrm zowe.pax`;
    return this.run(script);
  }
  
  async install(installDir) {
    try {
      await this.mkdir(installDir);
      await this.download(installDir);
      await this.unpax(installDir);
      console.log('Installation completed successfully.');
    } catch (error) {
      console.error('Installation failed:', error);
    }
  }

  async run(script) {
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
      console.log('Connecting to FTP server...');
      const client = new zos();
      await client.connect(this.config);

      if (!client.connected) {
        throw new Error('Failed to connect to ' + this.config.host);
      }
      const result = await client.submitJCL(jcl, ["STDOUT", "STDERR"]);
      console.log('JCL submitted successfully.');
      console.log('Result:', result);
      return result;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}

module.exports = Script;

