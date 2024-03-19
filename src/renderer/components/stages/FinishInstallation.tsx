/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { Typography } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';


import '../../styles/ReviewInstallation.css';

const ReviewInstallation = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw' }}>
      <div style={{ textAlign: 'center', width: '300px' }}>
        <CheckCircle sx={{ color: 'green', fontSize: '5rem' }} />
        <Typography sx={{ fontSize: 'large', fontWeight: 'bold', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>Installation Successful!</Typography>
        <Typography sx={{ marginTop: '10px', fontSize: 'small', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>Your Zowe Installation has been completed.</Typography>    
      </div>
    </div>
  );
};

export default ReviewInstallation;
