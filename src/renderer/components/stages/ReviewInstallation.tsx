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
import '../../styles/ReviewInstallation.css';

const ReviewInstallation = () => {

  const dynamicValues = {
    host: 'rs28',
    port: '8080',
    username: 'user123',
    password: '******', // Placeholder for password
  };

  return (
    <ContainerCard title="Review Installation" description="Review the Installation">
      <Box sx={{ overflow: 'auto' }}>
        {stages.map(stage => (
          <React.Fragment key={stage.id}>
            {stage.id === 0 && (
              <Box className="review-component-box-conn">
                <Typography className="review-component-text">{stage.label}</Typography>
                <Tooltip title="Connection Successful" arrow><CheckCircleIcon className="checkmark" /></Tooltip>
                <Box className="connection-attr-box">
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Host</span> 
                      <span className="connection-attr-value">{dynamicValues.host}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">FTP Port</span> 
                      <span className="connection-attr-value">{dynamicValues.port}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Username</span> 
                      <span className="connection-attr-value">{dynamicValues.username}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Password</span> 
                      <span className="connection-attr-value">{dynamicValues.password}</span>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            {stage.id !== 4 && stage.id !== 0 && (
              <Box className="review-component-box">
                <Typography className="review-component-text">{stage.label}</Typography>
                <WarningIcon className="warningIcon"/>
              </Box>
            )}
            {stage.subStages && (
                <Box sx={{ overflow: 'auto' }}>
                  {stage.subStages.map(subStage => (
                    <Box className="review-component-box">
                      <Typography className="review-component-text">{subStage.label}</Typography>
                      <WarningIcon className="warningIcon"/>
                    </Box>
                  ))}
                </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    </ContainerCard>
  );
};

export default ReviewInstallation;
