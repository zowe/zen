/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState} from "react";
import ContainerCard from '../common/ContainerCard';
import { Box } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import JsonForm from '../common/JsonForms';

const Certificates = () => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const setupSchema = schema.properties.zowe.properties.setup.properties.certificate;
  const [setupYaml, setSetupYaml] = useState(yaml.zowe.setup.certificate);

  const handleFormChange = (data: any) => {
    const updatedData = data;
    setSetupYaml(updatedData);
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