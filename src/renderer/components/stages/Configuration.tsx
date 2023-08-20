/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState } from "react";
import { Box } from '@mui/material';
import ContainerCard from '../common/ContainerCard';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import JsonForm from '../common/JsonForms';

const Configuration = () => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const setupSchema = schema.properties.zowe.properties.setup.properties.security;
  const [setupYaml, setSetupYaml] = useState(yaml.zowe.setup.security);

  const handleFormChange = (data: any) => {
    setSetupYaml(data);
  };

  return (
    <ContainerCard title="Configuration" description="Configure Zowe initilaization and components"> 
      <Box sx={{ width: '60vw' }}>
        <JsonForm schema={setupSchema} onChange={handleFormChange} formData={setupYaml}/>
      </Box>
    </ContainerCard>
  );
};

export default Configuration;
