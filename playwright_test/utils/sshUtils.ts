import { NodeSSH } from 'node-ssh';
import config from './config.ts';

const ssh = new NodeSSH();
const host = config.SSH_HOST;
const username = config.SSH_USER;
const password = config.SSH_PASSWD;
const SFTP_port = 22;

export async function runSSHCommand(command: string): Promise<string> {
    try {
        await ssh.connect({
            host,
            username,
            password,
            SFTP_port,
        });
        const result = await ssh.execCommand(command);
        return result.stdout;
    } catch (error) {
        throw new Error(`Failed to execute SSH command: ${error.message}`);
    } finally {
        ssh.dispose();
    }
}
