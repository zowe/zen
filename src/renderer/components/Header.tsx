/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Outlet } from 'react-router-dom';
import Alert, {AlertColor} from "@mui/material/Alert";
import EventEmitter from 'events';

interface AlertData {
  show: boolean;
  duration: number;
  message: string;
  severity: AlertColor;
}

// Global event emmitter Zen can use
export const alertEmitter = new EventEmitter();

export default function Header() {
  const [alertData, setAlertData] = useState<AlertData>({
    show: false,
    duration: 5000,  // Default 5 seconds
    message: 'Success!',
    severity: 'success', 
  });
  let timer: any;

  const showAlert = (message: string, severity?: AlertColor, duration?: number) => {
    const severityOrDefault = severity || 'success';  // Default to 'success' if not provided
    const durationOrDefault = duration || 5000;  // Default to 5000 milliseconds if not provided
  
    setAlertData({ show: true, message, severity: severityOrDefault, duration: durationOrDefault });

    if (timer) { // Clear existing timer if any
      clearTimeout(timer);
    }
    timer = setTimeout(() => { // Set new timer
      setAlertData({ ...alertData, show: false });
    }, duration);
  };

  const hideAlert = () => {
    if (timer) {
      clearTimeout(timer);
    }
    setAlertData({ ...alertData, show: false });
  };

  useEffect(() => {
    const showGlobalAlert = (message: string, severity?: AlertColor, duration?: number) => {
      showAlert(message, severity, duration);
    };

    const hideGlobalAlert = () => {
      hideAlert();
    };
  
    alertEmitter.on('showAlert', showGlobalAlert);
    alertEmitter.on('hideAlert', hideGlobalAlert);
  
    return () => {
      alertEmitter.off('showAlert', showGlobalAlert);
      alertEmitter.off('hideAlert', hideGlobalAlert);
      if (timer) {
        clearTimeout(timer);
      }  // Cleanup timer on component unmount
    };
  }, []);

  return (
    <React.Fragment> 
      <Box>
        <AppBar position="static">
          <Toolbar sx={{boxShadow: '0px 0px 3px 3px rgb(0 0 0 / 25%)'}}>
            <Typography style={{ textAlign: 'right' }} variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Zowe Enterprise Necessity
            </Typography>
            {alertData.show && (
              <><Alert style={{ position: 'absolute' }} severity={alertData.severity}>{alertData.message}
                </Alert>
              </>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <Outlet />
    </React.Fragment>
  );
}