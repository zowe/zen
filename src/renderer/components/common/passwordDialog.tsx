/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useEffect, useRef, useState } from 'react';
import { selectConnectionArgs, setConnectionValidationDetails, setPassword } from '../stages/connection/connectionSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { IResponse } from '../../../types/interfaces'
import { setConnectionStatus } from '../stages/progress/progressSlice';

const PasswordDialog = ({ onPasswordSubmit }:{ onPasswordSubmit: any }) => {

  const dispatch = useAppDispatch();

  const connectionArgs = useAppSelector(selectConnectionArgs);
  const userName = connectionArgs.user;

  const [isDialogVisible, setIsDialogVisible] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setIsDialogVisible(false);
    onPasswordSubmit(false);
  };

  const onPasswordUpdate = (password: string) => {
    dispatch(setPassword(password));
  }

  const onSubmit = () => {
    setIsLoading(true);
    window.electron.ipcRenderer
      .connectionButtonOnClick(connectionArgs)
      .then((res: IResponse) => {
        dispatch(setConnectionStatus(res.status));
        if(res.status) {
          onPasswordSubmit(res.status);
          setError(false, '');
          setIsDialogVisible(false);
        } else {
          setError(true, 'Incorrect Password');
        }
        dispatch(setConnectionValidationDetails(res.details));
        setIsLoading(false);
      })
      .catch((err: any) => {
        setError(true, err.message);
        onPasswordSubmit(false);
        setIsLoading(false);
      });
  }

  const setError = (err: boolean, errMsg: string) => {
    setIsError(err);
    setErrorMessage(errMsg);
  }

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth={'xs'}
        open={isDialogVisible}
        PaperProps={{
          style: {
            width: '95vw',
          },
        }}>
        <DialogTitle>Enter Password</DialogTitle>
        <DialogContent sx={{ paddingBottom: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {isLoading && <CircularProgress style={{ position: 'absolute', top: '40%', left: '45%', transform: 'translate(-50%, -50%)' }}/>}
          <FormControl>
            <TextField
              id='uname'
              label='User Name'
              size='small'
              variant="filled"
              value={userName}
              InputProps={{readOnly: true}}/>
          </FormControl>
          <FormControl style={{ paddingBottom: '5px' }}>
            <TextField
              id='password'
              label='Password'
              type="password"
              size='small'
              variant="filled"
              onChange={(e) => onPasswordUpdate(e.target.value)}/>
          </FormControl>
          {isError && <span style={{ color: 'red', fontFamily: 'Arial, sans-serif', fontSize: 'small', paddingBottom: '1px' }}>{errorMessage}</span>}
        </DialogContent>
        <DialogActions>
          <div>
            <Button onClick={onSubmit}>Submit</Button>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PasswordDialog;