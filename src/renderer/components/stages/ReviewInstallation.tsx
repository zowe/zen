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
import {Box, Button, Typography, Tooltip} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ContainerCard from '../common/ContainerCard';
import {stages} from "../configuration-wizard/Wizard";
import { selectConnectionArgs } from './connection/connectionSlice';
import { useAppSelector } from '../../hooks';
import eventDispatcher from '../../../utils/eventDispatcher';

import '../../styles/ReviewInstallation.css';

const ReviewInstallation = () => {

  const connectionArgs = useAppSelector(selectConnectionArgs);

  const updateActiveStep = (index: number, isSubStep: boolean, subStepIndex?: number) => {
    eventDispatcher.emit('updateActiveStep', index, isSubStep, subStepIndex);
    console.log("---------EMITING EVENT----\n");
  }

  return (
    
    <ContainerCard title="Review Installation" description="Review the Installation">
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start'}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => updateActiveStep(2, false)}>Active step?</Button>
      </Box>
      <Box sx={{ overflow: 'auto' }}>
        {stages.map(stage => (
          <React.Fragment key={stage.id}>
            {stage.id === 0 && (
              <Box className="review-component-box-conn">
                <Typography className="review-component-text" onClick={() => updateActiveStep(stage.id, false)}>{stage.label}</Typography>
                {!stage.isSkippable && (<Tooltip title="Connection Successful" arrow><CheckCircleIcon className="checkmark" /></Tooltip>)}
                <Box className="connection-attr-box">
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Host</span> 
                      <span className="connection-attr-value">{connectionArgs.host}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">FTP Port</span> 
                      <span className="connection-attr-value">{connectionArgs.port}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Username</span> 
                      <span className="connection-attr-value">{connectionArgs.user}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Password</span> 
                      <span className="connection-attr-value">*****</span>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            {stage.id !== 0 && stage.id !== 4 && (
              <div>
                <Box className="review-component-box">
                  <Typography className="review-component-text" onClick={() => updateActiveStep(stage.id, false)}>{stage.label}</Typography>
                  {!stage.isSkipped && (<Tooltip title={`${stage.label} Successful`} arrow><CheckCircleIcon className="checkmark" /></Tooltip>)}
                  {stage.isSkipped && (<Tooltip title={`${stage.label} Pending`} arrow><WarningIcon className="warningIcon"/></Tooltip>)}
                </Box>
                
                <Box className="substages">
                  { stage.subStages && (<div className="vertical-line"></div>)}
                  <div>
                    {stage.subStages && stage.subStages.map(subStage => (
                      <Box key={subStage.id} className="review-component-box-nested">
                        <Typography className="review-component-text" onClick={() => updateActiveStep(stage.id, true, subStage.id)}>{subStage.label}</Typography>
                        {!subStage.isSkipped && (<Tooltip title={`${subStage.label} Successful`} arrow><CheckCircleIcon className="checkmark" /></Tooltip>)}
                        {subStage.isSkipped && (<Tooltip title={`${subStage.label} Pending`} arrow><WarningIcon className="warningIcon"/></Tooltip>)}
                      </Box>
                      )
                    )}
                  </div>
                </Box>
              </div>
            )}
          </React.Fragment>
        ))}
      </Box>
    </ContainerCard>
  );
};

export default ReviewInstallation;
