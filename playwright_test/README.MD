### Prerequisite For Test

Make sure command zen is installed by running `npm install`

### Start Test

Example command:

```
ZOWE_ROOT_DIR=/path/to/zowe \
  ZOWE_WORKSPACE_DIR=/path/to/zowe/workspaceDir \
  SSH_HOST=test-server \
  SSH_PORT=12022 \
  SSH_USER=********* \
  SSH_PASSWD=********* \
  ZOSMF_PORT=10443 \
  npm run playtest
```
