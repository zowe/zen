/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useEffect} from "react";
import Button from '@mui/material/Button';
import ProgressCard from '../common/ProgressCard';
import ContainerCard from '../common/ContainerCard';

const Initialization = () => {

  return (
    <ContainerCard title="Initialization" description="Validate the configuration and run Zowe intialization"> 
      
    </ContainerCard>
  );
};

export default Initialization;
