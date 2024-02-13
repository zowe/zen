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
import { Box, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { IResponse, IIpcConnectionArgs } from '../../types/interfaces';
import { setConnectionArgs, selectConnectionArgs, selectConnectionPassword } from './stages/connection/connectionSlice';
import { setZoweCLIVersion } from './configuration-wizard/wizardSlice';
import { useAppDispatch, useAppSelector } from '../hooks';
import { Tooltip } from '@mui/material';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import installationImg from '../assets/installation.png'
import installationDryImg from '../assets/installation-dry-run.png'
import eventDispatcher from "../../utils/eventDispatcher";
import { selectActiveStepIndex, selectIsSubstep, selectActiveSubStepIndex} from './stages/progress/activeStepSlice';
import { selectConnectionStatus} from './stages/progress/progressSlice';
import { selectActiveStepDate} from './stages/progress/activeStepSlice';
import  HorizontalLinearStepper  from './common/Stepper';
import Wizard from './configuration-wizard/Wizard'

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
  const activeStepIndex = useAppSelector(selectActiveStepIndex);
  const isSubStep = useAppSelector(selectIsSubstep);
  const activeSubStepIndex = useAppSelector(selectActiveSubStepIndex);
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const lastActiveDate = useAppSelector(selectActiveStepDate);
  const connectionPassword = useAppSelector(selectConnectionPassword);

  const [showWizard, setShowWizard] = useState(false);
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
        console.log(JSON.stringify(connectionStore['ftp-details'],null,2));
        const connectionArgs: IIpcConnectionArgs = {
          ...connectionStore["ftp-details"],
          password: connectionPassword,
          connectionType: 'ftp'}; 
        dispatch(setConnectionArgs(connectionArgs));
      } else {
        // TODO: Add support for other types
        console.warn('Connection types other than FTP are not supported yet');
      }
    });
    return () => {
      eventDispatcher.off('saveAndCloseEvent', () => setShowWizard(true));
    };
  }, []);

  const resumeProgress = () => {
    setShowWizard(true);
    eventDispatcher.emit('updateActiveStep', activeStepIndex, isSubStep, activeSubStepIndex);
  }

  return (
    <>
      {!showWizard && <div className="home-container" style={{ display: 'flex', flexDirection: 'column' }}>

        <div style={{ position: 'absolute', left: '-9999px' }}>
          <HorizontalLinearStepper stages={stages} />
        </div>

        {!connectionStatus && <div style={{marginBottom: '50px'}}></div>}

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '8%' }}>
          {cards.map(card => makeCard(card))}
        </div>

        {connectionStatus && <div style={{marginBottom: '1px',marginTop: '130px',background: 'white', fontSize: 'small',marginLeft: '8.9%',padding: '15px 0 15px 15px',width: '495px', boxShadow: '1px 1px 3px #a6a6a6'}}>
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
