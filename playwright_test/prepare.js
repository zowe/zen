const Script = require('./setup.js');

const SSH_HOST = process.env.SSH_HOST;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const SSH_PASSWD = process.env.SSH_PASSWD;
const ZOWE_ROOT_DIR = process.env.ZOWE_ROOT_DIR;

async function prepare() {
  const scriptRunner = new Script({
    host: SSH_HOST,
    port: SSH_PORT,
    user: SSH_USER,
    password: SSH_PASSWD,
  });
	
  await scriptRunner.install(ZOWE_ROOT_DIR);
}

prepare().then(() => {
  console.log('Preparation complete.');
}).catch((error) => {
  console.error('Error during preparation:', error);
  process.exit(1);
});