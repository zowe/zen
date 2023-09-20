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
import ContainerCard from '../common/ContainerCard';
import { Box } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import JsonForm from '../common/JsonForms';
import { setConfiguration, getConfiguration } from '../../../services/configService';

const Certificates = () => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const setupSchema = schema ? schema.properties.zowe.properties.setup.properties.certificate : "";
  const initialYaml = yaml ? yaml : "";
  const [setupYaml, setSetupYaml] = useState(initialYaml.zowe.setup.certificate);
  const [init, setInit] = useState(false);
  const section = 'certificate';
  const initConfig: any = getConfiguration(section);

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
    if(Object.keys(initConfig) && Object.keys(initConfig).length != 0) {
      setSetupYaml(initConfig);
    }
    setInit(true);
  }, []);
  
  const handleFormChange = (data: any) => {
    const newData = init ? (initConfig? initConfig: data) : (data ? data : initConfig);
    setInit(false);

    if(newData) {
      setConfiguration(section, newData);
      dispatch(setNextStepEnabled(true));
      setSetupYaml(newData);
    }
  };

  return (
    <ContainerCard title="Certificates" description="Configure certificates"> 
      <Box sx={{ width: '60vw' }}>
        <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml} />
      </Box> 
    </ContainerCard>
  );
};

export default Certificates;