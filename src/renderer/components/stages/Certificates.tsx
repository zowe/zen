/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useEffect, useState, useRef} from "react";
import ContainerCard from '../common/ContainerCard';
import { Box, Button, FormControl, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../wizard/wizardSlice';
import JsonForm from '../common/JsonForms';

const Certificates = () => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);
  const setupSchema = schema.properties.zowe.properties.setup.properties.certificate;
  const [setupYaml, setSetupYaml] = useState(yaml.zowe.setup.certificate);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }

  const editParam = () => {

  }

  return (
    <ContainerCard title="Certificates" description="Configure certificates"> 
      <Box sx={{ width: '60vw' }} ref={inputRef} onClick={handleInputFocus}> 
        <JsonForm schema={setupSchema} initialdata={setupYaml} onChange={editParam} />
      </Box> 
    </ContainerCard>
  );
};

export default Certificates;
