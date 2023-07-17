/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React from "react";
import {Box, Button, Card, CardContent, CircularProgress, Typography} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Support errors - red bottom border
// TODO: define props interface, rework this component

const ProgressCard = (props: any) => {

  const {id, label, status} = props;

  return (
    <Box key={`box-${id}`} id={`box-${id}`} sx={{ paddingBottom: '24px' }}>
        <Card sx={{borderBottom: status === 'error' ? 'solid 2px red' : 'none'}} id={`card-${id}`} square={true} >
            <CardContent className="progress-card">
                <Typography sx={{ mb: 1.5, mt: 1.5, fontSize: '0.875rem', color: status === 'error' ? 'red' : 'inherit' }} color="text.secondary">
                    {label}
                </Typography>
                {status ? 
                  <CheckCircleOutlineIcon color="success" sx={{ fontSize: 32 }}/> : 
                  status === 'error' ? 
                    <Button sx={{boxShadow: 'none'}} variant="text">Display logs</Button> : 
                    <CircularProgress size={28} sx={{p: '2px'}}/>}
            </CardContent>
        </Card>
    </Box>
  );
};

export default ProgressCard;
