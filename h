[1mdiff --git a/src/renderer/components/stages/connection/Connection.tsx b/src/renderer/components/stages/connection/Connection.tsx[m
[1mindex b03f9cb..548560c 100644[m
[1m--- a/src/renderer/components/stages/connection/Connection.tsx[m
[1m+++ b/src/renderer/components/stages/connection/Connection.tsx[m
[36m@@ -36,7 +36,7 @@[m [mimport { alertEmitter } from "../../Header";[m
 import { getStageDetails, initStageSkipStatus } from "../../../../services/StageDetails";[m
 import { initializeProgress, getActiveStage } from "../progress/StageProgressStatus";[m
 import eventDispatcher from "../../../../services/eventDispatcher";[m
[31m-import { EXAMPLE_YAML, YAML_SCHEMA } from "../../common/Constants";[m
[32m+[m[32mimport { FALLBACK_YAML, FALLBACK_SCHEMA } from "../../common/Constants";[m
 [m
 const Connection = () => {[m
 [m
[36m@@ -155,12 +155,12 @@[m [mconst FTPConnectionForm = () => {[m
         const schema = res.details.schema;[m
         dispatch(setSchema(schema));[m
       } else {[m
[31m-        dispatch(setYaml(EXAMPLE_YAML));[m
[31m-        dispatch(setSchema(YAML_SCHEMA));[m
[31m-        window.electron.ipcRenderer.setConfig(EXAMPLE_YAML).then((res: IResponse) => {[m
[32m+[m[32m        dispatch(setYaml(FALLBACK_YAML));[m
[32m+[m[32m        dispatch(setSchema(FALLBACK_SCHEMA));[m
[32m+[m[32m        window.electron.ipcRenderer.setConfig(FALLBACK_YAML).then((res: IResponse) => {[m
           // yaml response[m
         });[m
[31m-        window.electron.ipcRenderer.setSchema(YAML_SCHEMA).then((res: IResponse) => {[m
[32m+[m[32m        window.electron.ipcRenderer.setSchema(FALLBACK_SCHEMA).then((res: IResponse) => {[m
           // schema response[m
         });[m
       }[m
[1mdiff --git a/src/renderer/components/stages/installation/installationSlice.ts b/src/renderer/components/stages/installation/installationSlice.ts[m
[1mindex bfb0c65..c8a7a28 100644[m
[1m--- a/src/renderer/components/stages/installation/installationSlice.ts[m
[1m+++ b/src/renderer/components/stages/installation/installationSlice.ts[m
[36m@@ -13,27 +13,6 @@[m [mimport { RootState } from '../../../store';[m
 import { setInstallationTypeStatus, getInstallationTypeStatus, setInstallationArguments } from '../progress/StageProgressStatus'; [m
 import { InstallationArgs } from '../../../../types/stateInterfaces';[m
 [m
[31m-export interface InstallationArgs {[m
[31m-  installationDir: string;[m
[31m-  workspaceDir: string;[m
[31m-  logDir: string,[m
[31m-  extensionDir: string,[m
[31m-  installationType?: string;[m
[31m-  downloadDir: string;[m
[31m-  userUploadedPaxPath?: string;[m
[31m-  smpeDir?: string;[m
[31m-  javaHome: string;[m
[31m-  nodeHome: string;[m
[31m-  setupConfig: any;[m
[31m-  jobName: string;[m
[31m-  jobPrefix: string;[m
[31m-  rbacProfile: string;[m
[31m-  cookieId: string;[m
[31m-  zosmfHost: string,[m
[31m-  zosmfPort: string,[m
[31m-  zosmfApplId: string[m
[31m-}[m
[31m-[m
 interface InstallationState {[m
   installationArgs: InstallationArgs;[m
   zoweVersion: string;[m
