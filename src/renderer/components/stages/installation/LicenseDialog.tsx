/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { useState, useEffect, useRef } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { licenseHeader, licenseContent, licenseMainConetnt, licenseLinkText, licenseLink} from './License';

const LicenseDialog = ({isAgreementVisible, licenseAgreement}: any) => {
const [licenseText, setLicenseText] = useState('');

  return (
    <div> 
      <Dialog 
        open={isAgreementVisible} 
        onClose={() => {licenseAgreement(-1)}} 
        PaperProps={{
            style: {
            width: '100vw',
            borderRadius: '15px'
            },
        }}>
       <DialogTitle sx={{color: '#0678c6', fontSize: 'medium'}}>End User Liscense Agreement for Zowe</DialogTitle>
        <DialogContent sx={{paddingBottom: '0', fontSize: '15px'}}>
          <p>{licenseHeader}</p>
          <p>{licenseContent}</p>
          <b >{licenseMainConetnt}</b>
          <p>{licenseLinkText}<a href={licenseLink} target="_blank">{licenseLink}</a></p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { licenseAgreement(1)} }>Agree</Button>
          <Button onClick={() => { licenseAgreement(0)} }>Disagree</Button>
        </DialogActions>
      </Dialog> 
    </div>
    );
};
    
export default LicenseDialog;
