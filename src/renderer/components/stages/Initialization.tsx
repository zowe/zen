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
import { useAppDispatch } from '../../hooks';
import ContainerCard from '../common/ContainerCard';
import { setActiveStep } from "./progress/activeStepSlice";
import { getStageDetails } from "../../../../src/services/StageDetails";

const Initialization = () => {

  const dispatch = useAppDispatch();

  const stageLabel = 'Initialization';
  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = true;

  useEffect(() => {
    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, []);
  
  return (
    <ContainerCard title="Initialization" description="Validate the configuration and run Zowe intialization"> 
      
    </ContainerCard>
  );
};

export default Initialization;
