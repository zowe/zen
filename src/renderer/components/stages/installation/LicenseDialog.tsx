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
            },
        }}>
       <DialogTitle sx={{color: '#0678c6'}}>End User Liscense Agreement for Zowe</DialogTitle>
        <DialogContent sx={{paddingBottom: '0'}}>
          <p>{licenseHeader}</p>
          <p>{licenseContent}</p>
          <b>{licenseMainConetnt}</b>
          <p>{licenseLinkText}<a href={licenseLink} target="_blank">{licenseLink}</a></p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { licenseAgreement(1)} }>Agree</Button>
          <Button onClick={() => { licenseAgreement(0)} }>Disagree</Button>
          <Button onClick={() => { licenseAgreement(-1)} }>Close</Button>
        </DialogActions>
      </Dialog> 
    </div>
    );
};
    
export default LicenseDialog;
