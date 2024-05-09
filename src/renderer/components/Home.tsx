/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import '../global.css';
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography, Button, DialogContent, DialogActions } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { IResponse, IIpcConnectionArgs } from '../../types/interfaces';
import { setConnectionArgs, selectConnectionArgs, selectInitJobStatement } from './stages/connection/connectionSlice';
import { setJobStatement } from './stages/PlanningSlice';
import { setZoweCLIVersion } from './configuration-wizard/wizardSlice';
import { useAppDispatch, useAppSelector } from '../hooks';
import { Tooltip } from '@mui/material';
import installationImg from '../assets/installation.png'
import installationDryImg from '../assets/installation-dry-run.png'
import eventDispatcher from "../../utils/eventDispatcher";
import { selectActiveStepIndex, selectIsSubstep, selectActiveSubStepIndex, selectActiveStepDate} from './stages/progress/activeStepSlice';
import { selectConnectionStatus} from './stages/progress/progressSlice';
import  HorizontalLinearStepper  from './common/Stepper';
import Wizard from './configuration-wizard/Wizard'
import Connection from './stages/connection/Connection';
import { ActiveState } from '../../types/stateInterfaces';
import flatten from 'flat';
import { getPreviousInstallation } from './stages/progress/StageProgressStatus';

// REVIEW: Get rid of routing

interface ICard {
  id: string, 
  name: string, 
  description: string, 
  link: string,
  media: any,
}

const cards: Array<ICard> = [
  {
    id: "install", 
    name: "New Zowe Installation", 
    description: "It will help you download, install, and configure Zowe on z/OS.", 
    link: "/wizard",
    media: installationImg,
  }, 
  {
    id: "configure", 
    name: "Zowe Installation Dry Run", 
    description: "It will guide you through the installation steps without running the installation.", 
    link: "/",
    media: installationDryImg,
  }
]

const makeCard = (card: ICard) => {
  const {id, name, description, link, media} = card;
  return (  
    <Link key={`link-${id}`} to={link}>
      <Box sx={{ width: '40vw', height: '40vh'}}>
        <Card id={`card-${id}`} square={true} >
          <CardMedia
            sx={{ height: 240 }}
            image={media}
          />
          <CardContent className="action-card">
            <Box>
              <Typography variant="subtitle1" component="div">
                {name}
              </Typography>
              <Typography sx={{ mb: 1.5, mt: 1.5, fontSize: '0.875rem' }} color="text.secondary">
                {description}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Link>
  )
}

const Home = () => {

  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const [showWizard, setShowWizard] = useState(false);
  const [showLoginDialog, setShowLogin] = useState(false);

  const { activeStepIndex, isSubStep, activeSubStepIndex, lastActiveDate } = getPreviousInstallation();

  const prevInstallationKey = "prev_installation";
  const lastActiveState: ActiveState = {
    activeStepIndex: 0,
    isSubStep: false,
    activeSubStepIndex: 0,
  };
  const [isNewInstallation, setIsNewInstallation] = useState(true);

  const stages: any = [];

  useEffect(() => {
    eventDispatcher.on('saveAndCloseEvent', () => setShowWizard(false));
    window.electron.ipcRenderer.checkZoweCLI().then((res: IResponse) => {
      if (res.status) {
        dispatch(setZoweCLIVersion(res.details));
      } else {
        console.info('No Zowe CLI found on local machine');
      }
    }); 
    window.electron.ipcRenderer.findPreviousInstallations().then((res: IResponse) => {
      const connectionStore = res.details;
      if (connectionStore["connection-type"] === 'ftp') {
        const jobStatement = connectionStore['ftp-details'].jobStatement.trim() || useAppSelector(selectInitJobStatement);
        console.log(JSON.stringify(connectionStore['ftp-details'],null,2));
        const connectionArgs: IIpcConnectionArgs = {
          ...connectionStore["ftp-details"],
          password: "",
          connectionType: 'ftp',
          jobStatement: jobStatement};
        dispatch(setConnectionArgs(connectionArgs));
        dispatch(setJobStatement(jobStatement));
      } else {
        // TODO: Add support for other types
        console.warn('Connection types other than FTP are not supported yet');
      }

      const lastInstallation = localStorage.getItem(prevInstallationKey);
      if(!lastInstallation) {
        const flattenedData = flatten(lastActiveState);
        localStorage.setItem(prevInstallationKey, JSON.stringify(flattenedData));
      } else {
        setIsNewInstallation(false);
      }

    });
    return () => {
      eventDispatcher.off('saveAndCloseEvent', () => setShowWizard(true));
    };
  }, []);

  const resumeProgress = () => {
    setShowWizard(true);
    setShowLogin(!connectionStatus);
    eventDispatcher.emit('updateActiveStep', activeStepIndex, isSubStep, activeSubStepIndex);
  }

  return (
    <>
      <Dialog onClose={() => {}} open={showLoginDialog} style={{fontSize: '14px'}} fullWidth={true}
        maxWidth={"lg"}>
        <DialogTitle>Re-enter FTP Credentials</DialogTitle>
         <Connection />
         <DialogActions>
          <Button onClick={() => setShowLogin(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {!showWizard && <div className="home-container" style={{ display: 'flex', flexDirection: 'column' }}>

        <div style={{ position: 'absolute', left: '-9999px' }}>
          <HorizontalLinearStepper stages={stages} />
        </div>

        {!connectionStatus && <div style={{marginBottom: '50px'}}></div>}

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '8%' }}>
          {cards.map(card => makeCard(card))}
        </div>

        {!isNewInstallation && <div style={{marginBottom: '1px',marginTop: '120px',background: 'white', fontSize: 'small',marginLeft: 'calc(8% + 10px)', padding: '15px 0 15px 15px',width: 'calc(80% + 5px)', boxShadow: '1px 1px 3px #a6a6a6'}}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>

            <div style={{paddingBottom: '10px', color: 'black'}}>
             <Typography variant="subtitle1" component="div">Saved Installation</Typography>
            </div>

            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: '10px'}}>
              <div style={{paddingRight: '10px'}}><span style={{color: 'black'}}>Last updated on:</span> {lastActiveDate}</div>
              <div style={{marginBottom: '1px', marginTop: '-5px'}}>
                <Tooltip title="Continue to Last Active Stage" arrow>
                  <Button style={{ color: 'white', backgroundColor: '#1976d2', fontSize: '9px', padding: '4px'}} onClick={resumeProgress}>
                    Resume Progress
                  </Button>
                </Tooltip>
              </div>
            </Box>

          </Box>

        </div>}
      </div>
    }
    {showWizard && <Wizard initialization={false}/>}
   </>
  );
};

export default Home;
