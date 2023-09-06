/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useEffect } from "react";
import ContainerCard from '../common/ContainerCard';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectYaml, selectSchema, setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { Box } from '@mui/material';
import MonacoEditorComponent from "../common/MonacoEditor";

const Certificates = () => {

  const dispatch = useAppDispatch();
  const schema = useAppSelector(selectSchema);
  const yaml = useAppSelector(selectYaml);

  const requireConfig = {
    url: 'node_modules/monaco-editor/min/vs/loader.js',
    paths: {
      url: 'node_modules/monaco-editor/min/vs',
    }
  };
  
  return (
    
    <ContainerCard title="Certificates" description="Configure certificates">
      <Box sx={{ width: '60vw' }}>
        <MonacoEditorComponent/>
        
      </Box> 
    </ContainerCard>
  );
};

export default Certificates;
