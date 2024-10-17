import { connectArgs, Script }  from './setup';

async function prepareEnvironment(options = {}) {
  const { install = false, remove = false } = options;

  const SSH_HOST = process.env.SSH_HOST;
  const SSH_PORT = process.env.SSH_PORT;
  const SSH_USER = process.env.SSH_USER;
  const SSH_PASSWD = process.env.SSH_PASSWD;
  const ZOWE_ROOT_DIR = process.env.ZOWE_ROOT_DIR;
  const ZOWE_EXTENSION_DIR = process.env.ZOWE_EXTENSION_DIR;
  const ZOWE_LOG_DIR = process.env.ZOWE_LOG_DIR;
  const ZOWE_WORKSPACE_DIR = process.env.ZOWE_WORKSPACE_DIR;
  const JAVA_HOME = process.env.JAVA_HOME;
  const NODE_HOME = process.env.NODE_HOME;
  const DATASET_PREFIX = process.env.DATASET_PREFIX;
  const AUTH_LOAD_LIB = process.env.AUTH_LOAD_LIB;
  const AUTH_PLUGIN_LIB = process.env.AUTH_PLUGIN_LIB;
  const SECURITY_ADMIN = process.env.SECURITY_ADMIN;
  const SECURITY_SYSPROG = process.env.SECURITY_SYSPROG;
  const SECURITY_STC = process.env.SECURITY_STC;
  const SECURITY_AUX = process.env.SECURITY_AUX;
  const SECURITY_USER_ZIS = process.env.SECURITY_USER_ZIS;
  const SECURITY_USER_ZOWE = process.env.SECURITY_USER_ZOWE;
  const SECURITY_STC_ZIS = process.env.SECURITY_STC_ZIS;
  const SECURITY_STC_ZOWE = process.env.SECURITY_STC_ZOWE;
  const ZOSMF_APP_ID = process.env.ZOSMF_APP_ID;
  const DOMAIN_NAME = process.env.DOMAIN_NAME;
  const EXTERNAL_PORT = process.env.EXTERNAL_PORT;
  let ZOSMF_PORT = process.env.ZOSMF_PORT || 10443;
  let JOB_NAME = process.env.JOB_NAME || 'ZWE1SV';
  let JOB_PREFIX = process.env.JOB_PREFIX || 'ZWE';

  if (!SSH_HOST) {
    throw new Error('SSH_HOST is not defined');
  }
  if (!SSH_PORT) {
    throw new Error('SSH_PORT is not defined');
  }
  if (!SSH_USER) {
    throw new Error('SSH_USER is not defined');
  }
  if (!SSH_PASSWD) {
    throw new Error('SSH_PASSWD is not defined');
  }
  if (!ZOWE_ROOT_DIR) {
    throw new Error('ZOWE_ROOT_DIR is not defined');
  }
  if (!ZOWE_EXTENSION_DIR) {
    throw new Error('ZOWE_EXTENSION_DIR is not defined');
  }
  if (!ZOWE_LOG_DIR) {
    throw new Error('ZOWE_LOG_DIR is not defined');
  }
  if (!ZOWE_WORKSPACE_DIR) {
    throw new Error('ZOWE_WORKSPACE_DIR is not defined');
  }
  if (!JAVA_HOME) {
    throw new Error('JAVA_HOME is not defined');
  }
  if (!NODE_HOME) {
    throw new Error('NODE_HOME is not defined');
  }
  if (!DATASET_PREFIX) {
    throw new Error('DATASET_PREFIX is not defined');
  }  
  if (!AUTH_LOAD_LIB) {
    throw new Error('AUTH_LOAD_LIB is not defined');
  }
  if (!AUTH_PLUGIN_LIB) {
    throw new Error('AUTH_PLUGIN_LIB is not defined');
  }
  if (!SECURITY_ADMIN) {
    throw new Error('SECURITY_ADMIN is not defined');
  }
  if (!SECURITY_SYSPROG) {
    throw new Error('SECURITY_SYSPROG is not defined');
  }
  if (!SECURITY_STC) {
    throw new Error('SECURITY_STC is not defined');
  }
  if (!SECURITY_AUX) {
    throw new Error('SECURITY_AUX is not defined');
  }
  if (!SECURITY_USER_ZIS) {
    throw new Error('SECURITY_USER_ZIS is not defined');
  }
  if (!SECURITY_USER_ZOWE) {
    throw new Error('SECURITY_USER_ZOWE is not defined');
  }
  if (!SECURITY_STC_ZIS) {
    throw new Error('SECURITY_STC_ZIS is not defined');
  }
  if (!SECURITY_STC_ZOWE) {
    throw new Error('SECURITY_STC_ZOWE is not defined');
  }
  if (!ZOSMF_APP_ID) {
    throw new Error('ZOSMF_APP_ID is not defined');
  }
  if (!DOMAIN_NAME) {
    throw new Error('DOMAIN_NAME is not defined');
  }
  if (!EXTERNAL_PORT) {
    throw new Error('EXTERNAL_PORT is not defined');
  }
  
  const scriptRunner = new Script({
    host: SSH_HOST,
    port: SSH_PORT,
    user: SSH_USER,
    password: SSH_PASSWD,
  });

  if (install) {
    await scriptRunner.install(ZOWE_ROOT_DIR);
    console.log('Installation complete.');
  }
  
  if (remove) { 
    await scriptRunner.remove(ZOWE_ROOT_DIR);
    console.log('Removal complete.');
  }
  
  console.log('Preparation complete.');
}

module.exports = { prepareEnvironment };
