/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { SyntheticEvent, useEffect } from "react";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import secureIcon from '../../../assets/secure.png';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ContainerCard from '../../common/ContainerCard';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { IResponse } from '../../../../types/interfaces';
import { setConnectionArgs, setConnectionStatus, selectConnectionArgs, selectConnectionStatus } from './connectionSlice';
import { setLoading, setNextStepEnabled, selectZoweCLIVersion } from '../../wizard/wizardSlice';
import { Container } from "@mui/material";

const Connection = () => {

  const dispatch = useAppDispatch();
  const zoweCLIVersion = useAppSelector(selectZoweCLIVersion);
  const [expanded, setExpanded] = React.useState<string | false>('FTPConn');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    dispatch(setNextStepEnabled(false));
  }, []);

  return (
    <ContainerCard 
      title="Connection" 
      description="Specify connection details" 
      onSubmit={(e: SyntheticEvent) => e.preventDefault()} 
      sx={{display: 'flex', flexDirection: 'column', height: '-webkit-fill-available'}}
    >
      {zoweCLIVersion 
      ? <React.Fragment>
        <Accordion expanded={expanded === 'FTPConn'} onChange={handleChange('FTPConn')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id="ftp-conn-header">
            <Typography>Connect with FTP</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FTPConnectionForm/>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'CLIConn'} onChange={handleChange('CLIConn')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id="cli-conn-header">
            <Typography>Connect with Zowe CLI</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CLIConnectionForm zoweCLIVersion={zoweCLIVersion}/>
          </AccordionDetails>
        </Accordion>
      </React.Fragment>
      : <FTPConnectionForm/>} 
    </ContainerCard>
  )
};

const CLIConnectionForm = ({zoweCLIVersion}: {zoweCLIVersion: string}) => {
  return (
    <Typography variant="body2" display="block" style={{whiteSpace: 'pre-wrap'}}>
      {`<Not implemented yet>

Found Zowe CLI ${zoweCLIVersion}It can be used as a provider to install Zowe Server side components 
<List available profiles there with hosts>`
      }
    </Typography>
  );
}

const FTPConnectionForm = () => {

  const dispatch = useAppDispatch();
  
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const [formProcessed, toggleFormProcessed] = React.useState(false);
  const [validationDetails, setValidationDetails] = React.useState('');
  
  const processForm = () => {
    dispatch(setLoading(true));
    window.electron.ipcRenderer
      .connectionButtonOnClick(connectionArgs)
      .then((res: IResponse) => {
        dispatch(setConnectionStatus(res.status));
        if(res.status) {
          dispatch(setNextStepEnabled(true));
        }
        toggleFormProcessed(true);
        setValidationDetails(res.details);
        dispatch(setLoading(false));
      }); 
  };

  return (
    <Box 
      onSubmit={(e: SyntheticEvent) => e.preventDefault()} 
      onChange={() => toggleFormProcessed(false)}
    >
      <FormControl>
        <TextField
          required
          id="standard-required"
          label="Host"
          variant="standard"
          helperText="Target system for Zowe z/OS components installation"
          value={connectionArgs.host}
          onChange={(e) => {dispatch(setConnectionArgs({...connectionArgs, host: e.target.value}))}}
        />
      </FormControl>
      <FormControl>
        <TextField
          id="standard-number"
          label="FTP Port"
          type="number"
          InputLabelProps={{ shrink: true }}
          variant="standard"
          helperText="FTP port number. If you'll not specify we try use default service port"
          value={connectionArgs.port}
          onChange={(e) => dispatch(setConnectionArgs({...connectionArgs, port: Number(e.target.value)}))}
        />
      </FormControl>
      <FormControl>
        <TextField
          required
          id="standard-required"
          label="User Name"
          variant="standard"
          helperText="Your z/OS (Mainframe) user name"
          value={connectionArgs.user}
          onChange={(e) => dispatch(setConnectionArgs({...connectionArgs, user: e.target.value}))}
        />
      </FormControl>
      <FormControl>
        <TextField
          required
          id="standard-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="standard"
          helperText={<span style={{display: 'flex', margin: 0}}>
              <img style={{width: '12px', height: '16px', paddingRight: '8px'}} src={secureIcon} alt="secure"/> 
              <span>We keep your password only for the current session</span>
            </span>}
          value={connectionArgs.password}
          onChange={(e) => dispatch(setConnectionArgs({...connectionArgs, password: e.target.value}))}
        />
      </FormControl>
      <Container sx={{display: "flex", justifyContent: "center", flexDirection: "row"}}>
        <Button sx={{boxShadow: 'none'}} type="submit" variant="text" onClick={() => processForm()}>Validate credentials</Button>
        <div style={{opacity: formProcessed ? '1' : '0', minWidth: '32px', paddingLeft: '12px'}}>
          {useAppSelector(selectConnectionStatus) ? <CheckCircleOutlineIcon color="success" sx={{ fontSize: 32 }}/> 
          : <div style={{display: 'flex', alignItems: 'center'}}><CancelOutlinedIcon color="error" sx={{ fontSize: 32, pr: '12px' }}/>
              <div style={{color: 'red', maxWidth: '300px'}}>{validationDetails}</div>
            </div>}
        </div>
      </Container>
    </Box>
  )
} 

export default Connection;

