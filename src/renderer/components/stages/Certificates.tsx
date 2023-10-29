/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState, useEffect } from "react";
import { Box, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { setConfiguration, getConfiguration, getZoweConfig, setTopLevelZConfig } from '../../../services/ConfigService';
import ContainerCard from '../common/ContainerCard';
import JsonForm from '../common/JsonForms';
import EditorDialog from "../common/EditorDialog";
import Ajv from "ajv";
import { selectInstallationArgs } from "./installation/installationSlice";
import { selectConnectionArgs } from "./connection/connectionSlice";
import { IResponse } from "../../../../src/types/interfaces";

const Certificates = () => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const installationArgs = useAppSelector(selectInstallationArgs);
  const setupSchema = schema ? schema.properties.zowe.properties.setup.properties.certificate : "";
  const verifyCertsSchema = schema ? {"type": "object", "properties": {"verifyCertificates": schema.properties.zowe.properties.verifyCertificates}} : "";
  const [setupYaml, setSetupYaml] = useState(yaml?.zowe.setup.certificate);
  const [verifyCertsYaml, setVerifyCertsYaml] = useState({'verifyCertificates': yaml?.zowe.verifyCertificates});
  const [init, setInit] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formError, setFormError] = useState('');

  const section = 'certificate';
  const initConfig: any = getConfiguration(section);
  const verifyCertsConfig: any = (getZoweConfig() as any).zowe.verifyCertificates;

  console.log('verifyCertsSchema: ', JSON.stringify(verifyCertsSchema));
  console.log('verifyCertsYaml:', JSON.stringify(verifyCertsYaml));

  const ajv = new Ajv();
  ajv.addKeyword("$anchor");
  let certificateSchema;
  let validate: any;
  let validateVerifyCertSchema: any;
  if(schema) {
    certificateSchema = schema.properties.zowe.properties.setup.properties.certificate;
  }

  if(certificateSchema) {
    validate = ajv.compile(certificateSchema);
  }

  if(verifyCertsSchema) {
    validateVerifyCertSchema = ajv.compile(verifyCertsSchema);
  }

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    if(Object.keys(initConfig) && Object.keys(initConfig).length != 0) {
      setSetupYaml(initConfig);
    }
    setInit(true);
  }, []);

  const toggleEditorVisibility = () => {
    setEditorVisible(!editorVisible);
  };
  
  const handleFormChange = (data: any, isYamlUpdated?: boolean) => {
    let newData = init ? (Object.keys(initConfig).length > 0 ? initConfig: data) : (data ? data : initConfig);
    setInit(false);

    if (newData) {
      newData = isYamlUpdated ? data.certificate : newData;

      if(setupSchema.if) {
        const ifProp = Object.keys(setupSchema.if.properties)[0];
        const ifPropValue = setupSchema.if.properties[ifProp].const.toLowerCase();
        const thenProp = setupSchema.then.required[0].toLowerCase();
        const elseProp = setupSchema.else.required[0].toLowerCase();

        if(newData && newData[ifProp]) {
          const newDataPropValue = newData[ifProp].toLowerCase();
          if( newDataPropValue == ifPropValue && newData[elseProp] ) {
            delete newData[elseProp];
          }
          if(newDataPropValue != ifPropValue && newData[thenProp]) {
            delete newData[thenProp];
          }
        }
      }

      if(validate) {
        validate(newData);
        if(validate.errors) {
          const errPath = validate.errors[0].schemaPath;
          const errMsg = validate.errors[0].message;
          setStageConfig(false, errPath+' '+errMsg, newData, false);
        } else {
          setConfiguration(section, newData, true);
          setStageConfig(true, '', newData, true);
        }
      }
    }
  };

  const handleVerifyCertsChange = (e: any) => {
    if(e.verifyCertificates && e.verifyCertificates != verifyCertsYaml.verifyCertificates){
      if(validateVerifyCertSchema){
        validateVerifyCertSchema(e);
        if(validateVerifyCertSchema.errors) {
          const errPath = validateVerifyCertSchema.errors[0].schemaPath;
          const errMsg = validateVerifyCertSchema.errors[0].message;
          setIsFormValid(false);
          setFormError(errPath+' '+errMsg);
          dispatch(setNextStepEnabled(false));
        } else {
          setTopLevelZConfig('verifyCertificates', e.verifyCertificates);
          setVerifyCertsYaml({'verifyCertificates': e.verifyCertificates});
          setIsFormValid(true);
          dispatch(setNextStepEnabled(true));
        }
      }
    }
  }

  const setStageConfig = (isValid: boolean, errorMsg: string, data: any, proceed: boolean) => {
    setIsFormValid(isValid);
    setFormError(errorMsg);
    setSetupYaml(data);
    dispatch(setNextStepEnabled(proceed));
  } 

  return (
    <div>
      <div style={{ position: 'fixed', top: '140px', right: '30px'}}>
        <Button style={{ color: 'white', backgroundColor: '#1976d2', fontSize: 'x-small'}} onClick={toggleEditorVisibility}>Open Editor</Button>
      </div>
      <ContainerCard title="Certificates" description="Configure Zowe Certificates"> 
        <EditorDialog isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} onChange={handleFormChange}/>
        <Box sx={{ width: '60vw' }}>
          {!isFormValid && <div style={{color: 'red', fontSize: 'small', marginBottom: '20px'}}>{formError}</div>}
          <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
          <JsonForm schema={verifyCertsSchema} onChange={handleVerifyCertsChange} formData={verifyCertsYaml}/>
          <Button sx={{boxShadow: 'none', mr: '12px'}} type="submit" variant="text" onClick={e => {
            window.electron.ipcRenderer.initCertsButtonOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
              dispatch(setNextStepEnabled(true));
              // clearInterval(timer);
            }).catch(() => {
              // clearInterval(timer);
              console.warn('Installation failed');
            });
          }}>Run 'zwe init certificates'</Button>
        </Box>
      </ContainerCard>
    </div>
  );
};

export default Certificates;