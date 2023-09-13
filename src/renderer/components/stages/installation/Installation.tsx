/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useEffect, useRef, useState} from "react";
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { dump, load } from 'js-yaml';
import { Box, Button, FormControl, Typography } from '@mui/material';
import { selectYaml, setYaml, selectSchema, setNextStepEnabled, setLoading } from '../../configuration-wizard/wizardSlice';
import { selectInstallationArgs, selectZoweVersion } from './installationSlice';
import { selectConnectionArgs } from '../connection/connectionSlice';
import { IResponse } from '../../../../types/interfaces';
import { setConfiguration, getConfiguration } from '../../../../services/ConfigService';
import ProgressCard from '../../common/ProgressCard';
import ContainerCard from '../../common/ContainerCard';
import Ajv from "ajv";
import MonacoEditorComponent from "../../common/MonacoEditor";
import JsonForm from '../../common/JsonForms';


const Installation = () => {

  // TODO: Display granular details of installation - downloading - unpacking - running zwe command

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const setupSchema = schema.properties.zowe.properties.setup.properties.dataset;
  const [setupYaml, setSetupYaml] = useState(yaml.zowe.setup.dataset);
  const [showProgress, toggleProgress] = useState(false);
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isSchemaValid, setIsSchemaValid] = useState(true);
  const [installationProgress, setInstallationProgress] = useState({
    uploadYaml: false,
    download: false,
    upload: false,
    unpax: false,
    install: false
  });

  const installationArgs = useAppSelector(selectInstallationArgs);
  const version = useAppSelector(selectZoweVersion);
  let timer: any;

  const section = 'dataset';
  const initConfig = getConfiguration(section);
  const ajv = new Ajv();
  ajv.addKeyword("$anchor");

  useEffect(() => {
    // dispatch(setNextStepEnabled(false));
    dispatch(setNextStepEnabled(true));
    if(Object.keys(initConfig) && Object.keys(initConfig).length != 0) {
      setSetupYaml(initConfig);
      //To serialize a JavaScript object into a YAML-formatted string
      setEditorContent(dump(initConfig));
    }
    setInit(true);
  }, []);

  useEffect(() => {
    setEditorContent(dump(setupYaml));
  }, [setupYaml]);

  useEffect(() => {
    if(editorVisible && !isSchemaValid) {
      dispatch(setNextStepEnabled(false));
    }
  }, [isSchemaValid, editorVisible]);

  useEffect(() => {
    timer = setInterval(() => {
      window.electron.ipcRenderer.getInstallationProgress().then((res: any) => {
        setInstallationProgress(res);
      })
    }, 3000);
    const nextPosition = document.getElementById('installation-progress');
    nextPosition.scrollIntoView({behavior: 'smooth'});
  }, [showProgress]);

  const toggleEditorVisibility = () => {
    setEditorVisible(!editorVisible);
  };

  const process = (event: any) => {
    event.preventDefault();
    dispatch(setLoading(true));
    const {javaHome, nodeHome, installationDir} = installationArgs;
    // FIXME: runtime dir is hardcoded, fix there and in InstallActions.ts - Unpax and Install functions

    Promise.all([
      window.electron.ipcRenderer.setConfigByKey('zowe.setup.dataset', setupYaml),
      window.electron.ipcRenderer.setConfigByKey('zowe.runtimeDirectory', `${installationDir}/runtime`),
      window.electron.ipcRenderer.setConfigByKey('zowe.logDirectory', `${installationDir}/logs`),
      window.electron.ipcRenderer.setConfigByKey('zowe.workspaceDirectory', `${installationDir}/workspace`),
      window.electron.ipcRenderer.setConfigByKey('zowe.extensionDirectory', `${installationDir}/extensions`),
      window.electron.ipcRenderer.setConfigByKey('java.home', javaHome),
      window.electron.ipcRenderer.setConfigByKey('node.home', nodeHome),
      window.electron.ipcRenderer.setConfigByKey('zowe.externalDomains', [connectionArgs.host])
    ]).then(() => {
      setYaml(window.electron.ipcRenderer.getConfig());
      toggleProgress(true);
      dispatch(setLoading(false));
      window.electron.ipcRenderer.installButtonOnClick(connectionArgs, installationArgs, version).then((res: IResponse) => {
        dispatch(setNextStepEnabled(res.status));
        clearInterval(timer);
      }).catch(() => {
        clearInterval(timer);
        console.warn('Installation failed');
      });
    })
  }

  const editHLQ = (data: any) => {

    const updatedData = init ? (initConfig? initConfig: data) : (data ? data : initConfig);
    setInit(false);

    if (updatedData && setupYaml && setupYaml.prefix !== updatedData.prefix) {
      const newPrefix = updatedData.prefix ? updatedData.prefix : '';
      const newData = Object.keys(setupYaml).reduce((acc, k) => {
        if (typeof(setupYaml[k]) === 'string' && setupYaml[k].startsWith(`${setupYaml.prefix}.`)) {
          return {...acc, [k]: setupYaml[k].replace(setupYaml.prefix, newPrefix), prefix: newPrefix}
        }
        return {...acc, [k]: setupYaml[k]}
      }, {});
      setConfiguration(section, newData);
      setSetupYaml(newData);
    } else {
      setConfiguration(section, updatedData);
      setSetupYaml(updatedData);
    }
  }

  const handleEditorContentChange = (newCode: any, isError: boolean) => {
    if(isError) {
      dispatch(setNextStepEnabled(false));
      return;
    }

    const validate = ajv.compile(setupSchema);
    let jsonData;

    try {
      // To parse the yaml and convert it to the javascript object
      jsonData = load(newCode);
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }

    // To validate the javascript object against the schema
    const isValid = validate(jsonData);
    setIsSchemaValid(isValid);
    
    if(isSchemaValid && jsonData) {
      setConfiguration(section, jsonData);
      dispatch(setNextStepEnabled(true));
      setSetupYaml(jsonData);
    }
  };

  return (
    <ContainerCard title="Installation" description="Provide installation details"> 
      <Typography id="position-2" sx={{ mb: 1, whiteSpace: 'pre-wrap', marginBottom: '50px', color: 'text.secondary', fontSize: '13px' }}>
        {`Ready to download Zowe ${version} and deploy it to the ${installationArgs.installationDir}\nThen we will install MVS data sets, please provide HLQ below\n`}
      </Typography>
      <Button onClick={toggleEditorVisibility}>
        {editorVisible ? "Hide Editor" : "Show Editor"}
      </Button>
      <Box sx={{ width: '70vw', paddingTop: '10px', paddingBottom: '20px'}}>
        {editorVisible && <MonacoEditorComponent initialContent={editorContent} onContentChange={handleEditorContentChange} isSchemaValid={isSchemaValid}/>}
      </Box> 
      <Box sx={{ width: '60vw' }}>
        {!editorVisible && <JsonForm schema={setupSchema} onChange={editHLQ} formData={setupYaml}/> }
      </Box>  
      {!showProgress ? <FormControl sx={{display: 'flex', alignItems: 'center', maxWidth: '72ch', justifyContent: 'center'}}>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={(e: any) => process(e)}>Install MVS datasets</Button>
        </FormControl> : null}
      <Box sx={{height: showProgress ? 'calc(100vh - 220px)' : 'auto'}} id="installation-progress">
      {!showProgress ? null :
        <React.Fragment>
          <ProgressCard label={`Upload configuration file to ${installationArgs.installationDir}`} id="download-progress-card" status={installationProgress.uploadYaml}/>
          <ProgressCard label="Download convenience build pax locally" id="download-progress-card" status={installationProgress.download}/>
          <ProgressCard label={`Upload to pax file to ${installationArgs.installationDir}`} id="upload-progress-card" status={installationProgress.upload}/>
          <ProgressCard label="Unpax installation files" id="unpax-progress-card" status={installationProgress.unpax}/>
          <ProgressCard label="Run installation script (zwe install)" id="install-progress-card" status={installationProgress.install}/>
        </React.Fragment>
      }
      </Box> 
    </ContainerCard>
  );
};

export default Installation;