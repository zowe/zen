### Prerequisite For Test

Make sure command zen is installed by running `npm install`

### Start Test

Example command:

```
  ZOWE_EXTENSION_DIR=\\path\\to\\zowe\\extension \
  ZOWE_LOG_DIR=\\path\\to\\zowe\\logs \
  ZOWE_ROOT_DIR=\\path\\to\\zowe \
  ZOWE_WORKSPACE_DIR=\\path\\to\\zowe\\workspaceDir \
  SSH_HOST=test-server \
  SSH_PORT=12022 \
  SSH_USER=********* \
  SSH_PASSWD=********* \
  ZOSMF_PORT=10443 \
  JOB_NAME=  \
  JOB_PREFIX=ZWE \
  JAVA_HOME=\\path\\to\\java \
  NODE_HOME=\\path\\to\\node \
  DATASET_PREFIX=  \
  AUTH_LOAD_LIB=  \
  AUTH_PLUGIN_LIB=  \
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
