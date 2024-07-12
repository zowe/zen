## Prerequisite For Test

Make sure command zen is installed by running `npm install`


## Inputs

### `SSH_HOST`

**Required** - The ssh zOS host for doing the testing.

### `SSH_PORT`

**Required** - The ssh zOS port for doing the testing.

### `SSH_USER`

**Required** - The ssh zOS login username.

### `SSH_PASSWD`

**Required** - The ssh zOS login password.


## Start Test

Example command:

```
  MSYS_NO_PATHCONV=1 \
  SSH_HOST=test-server \
  SSH_PORT=12022 \
  SSH_USER=********* \
  SSH_PASSWD=********* \
  ZOWE_ROOT_DIR=/path/to/zowe \
  ZOWE_EXTENSION_DIR=/path/to/zowe/extension \
  ZOWE_LOG_DIR=/path/to/zowe/logs \
  ZOWE_WORKSPACE_DIR=/path/to/zowe/workspaceDir \
  ZOSMF_PORT=10443 \
  JOB_NAME=ZWESVSTC \
  JOB_PREFIX=ZWE \
  JAVA_HOME=/path/to/java \
  NODE_HOME=/path/to/node \
  DATASET_PREFIX=IBMUSER.ZWEV2 \
  PROC_LIB=USER.PROCLIB \
  PARM_LIB=IBMUSER.ZWEV2.CUST.PARMLIB \
  JCL_LIB=IBMUSER.ZWEV2.CUST.PARMLIB \
  LOAD_LIB=IBMUSER.ZWEV2.SZWELOAD \
  AUTH_LOAD_LIB=IBMUSER.ZWEV2.SZWEAUTH \
  AUTH_PLUGIN_LIB=IBMUSER.ZWEV2.CUST.ZWESAPL \
  SECURITY_ADMIN=ZWEADMIN \
  SECURITY_SYSPROG=ZWEADMIN \
  SECURITY_STC=ZWEADMIN \
  SECURITY_AUX=ZWESASTC \
  SECURITY_USER_ZIS=ZWESIUSR \
  SECURITY_USER_ZOWE=ZWESVUSR \
  SECURITY_STC_ZIS=ZWESISTC \
  SECURITY_STC_ZOWE=ZWESLSTC \
  ZOSMF_APP_ID=IZUDFLT \
  DOMAIN_NAME=domain.com \
  EXTERNAL_PORT=7556 \
  npm run playtest
```

To run individial test, specify the name of the test file ex:

``` npm run playtest testConnectionTab.spec.ts ```
