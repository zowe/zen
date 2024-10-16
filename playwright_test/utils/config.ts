interface Config {
  SSH_HOST: string | undefined;
  SSH_PASSWD: string | undefined;
  SSH_PORT: string | undefined;
  SSH_USER: string | undefined;
  ZOWE_EXTENSION_DIR: string | undefined;
  ZOWE_LOG_DIR: string | undefined;
  ZOWE_ROOT_DIR: string | undefined;
  ZOWE_WORKSPACE_DIR: string | undefined;
  JOB_NAME: string | undefined;
  JOB_PREFIX: string | undefined;
  JAVA_HOME: string | undefined;
  NODE_HOME: string | undefined;
  ZOSMF_HOST: string | undefined;
  ZOSMF_PORT: string | undefined;
  ZOSMF_APP_ID: string | undefined;
  DATASET_PREFIX: string | undefined;
  AUTH_LOAD_LIB: string | undefined;
  AUTH_PLUGIN_LIB: string | undefined;
  PROC_LIB: string | undefined;
  PARM_LIB: string | undefined;
  ZIS: string | undefined;
  JCL_LIB: string | undefined;
  LOAD_LIB: string | undefined;
  DOMAIN_NAME: string | undefined;
  SECURITY_ADMIN: string | undefined;
  EXTERNAL_PORT: number | undefined;
  SECURITY_STC: string | undefined;
  SECURITY_SYSPROG: string | undefined;
  SECURITY_USER_ZIS: string | undefined;
  SECURITY_USER_ZOWE: string | undefined;
  SECURITY_AUX: string | undefined;
  SECURITY_STC_ZOWE: string | undefined;
  SECURITY_STC_ZIS: string | undefined;
}

const config: Config = {
  SSH_HOST: process.env.SSH_HOST,
  SSH_PASSWD: process.env.SSH_PASSWD,
  SSH_PORT: process.env.SSH_PORT,
  SSH_USER: process.env.SSH_USER,
  ZOWE_EXTENSION_DIR: process.env.ZOWE_EXTENSION_DIR,
  ZOWE_LOG_DIR: process.env.ZOWE_LOG_DIR,
  ZOWE_ROOT_DIR: process.env.ZOWE_ROOT_DIR,
  ZOWE_WORKSPACE_DIR: process.env.ZOWE_WORKSPACE_DIR,
  JOB_NAME: process.env.JOB_NAME,
  JOB_PREFIX: process.env.JOB_PREFIX,
  JAVA_HOME: process.env.JAVA_HOME,
  NODE_HOME: process.env.NODE_HOME,
  ZOSMF_HOST: process.env.ZOSMF_HOST,
  ZOSMF_PORT: process.env.ZOSMF_PORT,
  ZOSMF_APP_ID: process.env.ZOSMF_APP_ID,
  DATASET_PREFIX: process.env.DATASET_PREFIX,
  AUTH_LOAD_LIB: process.env.AUTH_LOAD_LIB,
  AUTH_PLUGIN_LIB: process.env.AUTH_PLUGIN_LIB,
  PROC_LIB: process.env.PROC_LIB,
  PARM_LIB: process.env.PARM_LIB,
  ZIS: process.env.ZIS,
  JCL_LIB: process.env.JCL_LIB,
  LOAD_LIB: process.env.LOAD_LIB,
  EXTERNAL_PORT: process.env.EXTERNAL_PORT,
  SECURITY_ADMIN: process.env.SECURITY_ADMIN,
  SECURITY_STC: process.env.SECURITY_STC,
  SECURITY_SYSPROG: process.env.SECURITY_SYSPROG,
  SECURITY_USER_ZIS: process.env.SECURITY_USER_ZIS,
  SECURITY_USER_ZOWE: process.env.SECURITY_USER_ZOWE,
  SECURITY_AUX: process.env.SECURITY_AUX,
  SECURITY_STC_ZOWE: process.env.SECURITY_STC_ZOWE,
  SECURITY_STC_ZIS: process.env.SECURITY_STC_ZIS,
  DOMAIN_NAME: process.env.DOMAIN_NAME
};
export default config;
