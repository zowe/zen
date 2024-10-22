import { submitJcl } from '../src/services/SubmitJcl';
import { startBPXBATCHAndShellSession } from '../src/services/ServiceUtils';
import { JCL_UNIX_SCRIPT_OK } from '../src/renderer/components/common/Utils';
import config from './utils/config';
import * as https from 'https';


// Define the response type based on what submitJcl returns
interface Response {
    rc: number;
    jobOutput?: { [key: string]: string };
}

// Define the type for the result that this function returns
interface CommandResult {
    status: boolean;
    details: string;
}

// Initialize the config object directly from the imported config
const connectArgs = {
    jobStatement: `//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,\n//         MSGLEVEL=(1,1),MSGCLASS=A`,
    host: config.SSH_HOST,
    port: config.SSH_PORT,
    user: config.SSH_USER,
    password: config.SSH_PASSWD
};

class Script {
   
  async runCommand(command: string, timeout: number = 60000): Promise<CommandResult> {
    const jcl = `${connectArgs.jobStatement}
${startBPXBATCHAndShellSession("ZNCKNOD")}
${command} &&
echo "${JCL_UNIX_SCRIPT_OK}"
/* `;

    //console.log(`Connecting to host: ${connectArgs.host} on port: ${connectArgs.port || 21}`);

    const timeoutPromise = new Promise<CommandResult>((_, reject) => {
        setTimeout(() => {
            reject(new Error('Command execution timed out.'));
        }, timeout);
    });

    const commandPromise = submitJcl({
        jobStatement: connectArgs.jobStatement,
        host: connectArgs.host,
        port: connectArgs.port || 21, 
        user: connectArgs.user,
        password: connectArgs.password
    }, jcl, ["STDOUT", "STDERR"]);

    try {
        const resp = await Promise.race([commandPromise, timeoutPromise]);

        if (resp.rc === 0) {
            const output = resp.jobOutput && resp.jobOutput["3"] ? resp.jobOutput["3"] : "No output found";
            return { status: true, details: output };
        } else {
            return { status: false, details: `${resp.rc}: ${resp.jobOutput}` };
        }
    } catch (error) {
        console.error('Error during command execution:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}
    
    async unpax(installDir: string): Promise<CommandResult> {
        const script = `cd ${installDir};\npax -ppx -rf zowe.pax;\nrm zowe.pax`;
        return this.runCommand(script); 
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
          return this.runCommand(script);
	    } catch (error) {
          console.error('Error:', error);
          return null;
        }
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
  async mkdir(installDir) {
    const script = `mkdir -p ${installDir}`;
    return this.runCommand(script);
  }
  
  async remove(installDir) {
    const script = `rm -rf ${installDir}`;
    return this.runCommand(script);
  }

  async remove_createdDataset(dataset_prefix, loadlib, authPluginLib, authLoadlib, parmlib, jcllib, vsam) {
  const script = `
    tsocmd "DELETE '${dataset_prefix}.SZWEEXEC'";
    tsocmd "DELETE '${dataset_prefix}.'";
    tsocmd "DELETE '${loadlib}'";
    tsocmd "DELETE '${authPluginLib}'";
    tsocmd "DELETE '${authLoadlib}'";
    tsocmd "DELETE '${parmlib}'";
    tsocmd "DELETE '${jcllib}'";
    tsocmd "DELETE '${vsam}'"
  `;

  return this.runCommand(script);
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
  }

export { connectArgs, Script }; 
