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
import { useState } from 'react';

const WarningDialog = ({onWarningDialogSubmit}: {onWarningDialogSubmit: any}) => {

  const [isDialogVisible, setIsDialogVisible] = useState(true);

  const handleClose = () => {
    setIsDialogVisible(false);
    onWarningDialogSubmit(false);
  }

  const handleSubmit = () => {
    setIsDialogVisible(false);
    onWarningDialogSubmit(true);
  }

  return (
    <div>
      <Dialog open={isDialogVisible} maxWidth={'xs'}>
        <DialogTitle>Warning!</DialogTitle>
        <DialogContent> Hey There </DialogContent>
        <DialogActions>
          <div>
            <Button onClick={handleClose}>Submit</Button>
            <Button onClick={handleSubmit}>Close</Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default WarningDialog;