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
import React, { useEffect, useRef, useState } from 'react';
import { selectConnectionArgs, setConnectionValidationDetails, setPassword } from '../stages/connection/connectionSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setLoading } from '../configuration-wizard/wizardSlice';
import { IResponse } from '../../../types/interfaces'
import { setConnectionStatus } from '../stages/progress/progressSlice';

const PasswordDialog = ({ onPasswordSubmit }:{onPasswordSubmit: any}) => {

  const dispatch = useAppDispatch();

  const connectionArgs = useAppSelector(selectConnectionArgs);
  const userName = connectionArgs.user;

  const [isDialogVisible, setIsDialogVisible] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    setIsDialogVisible(false);
    onPasswordSubmit(false);
  };

  const onSubmit = () => {
    dispatch(setLoading(true));
    console.log("connectionArgs: aftersubmit", connectionArgs);

    window.electron.ipcRenderer
      .connectionButtonOnClick(connectionArgs)
      .then((res: IResponse) => {
        dispatch(setConnectionStatus(res.status));
        if(res.status) {
          console.log("RESPONSE STATUS: ", res.status);
          setIsDialogVisible(false);
          onPasswordSubmit(res.status);
          setError(false, '');
        } else {
          setError(true, 'Incorrect Password');
          console.log("INCPRRECT PASSWORD");
        }
        dispatch(setConnectionValidationDetails(res.details));
        dispatch(setLoading(false));
      })
      .catch((err: any) => {
        dispatch(setLoading(false));
        console.log("ERR: ",err);
        setError(true, err);
        onPasswordSubmit(false);
      });
  }

  const onPasswordUpdate = (password: string) => {
    dispatch(setPassword(password));
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
        <DialogContent sx={{paddingBottom: '0'}}>
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