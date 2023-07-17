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
import { useEffect } from "react";
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { IResponse, IIpcConnectionArgs } from '../../types/interfaces';
import { setConnectionArgs } from './stages/connection/connectionSlice';
import { setZoweCLIVersion } from './wizard/wizardSlice';
import { useAppDispatch } from '../hooks';

import installationImg from '../assets/installation.png'
import installationDryImg from '../assets/installation-dry-run.png'

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
    description: "It will help you to download, install and configure Zowe on your z/OS", 
    link: "/wizard",
    media: installationImg,
  }, 
  {
    id: "configure", 
    name: "Zowe Installtion Dry Run", 
    description: "It will guide you through installtion steps without running the installation", 
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

  useEffect(() => {
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
        const connectionArgs: IIpcConnectionArgs = {...connectionStore["ftp-details"], password: '', connectionType: 'ftp'}; 
        dispatch(setConnectionArgs(connectionArgs));
      } else {
        // TODO: Add support for other types
        console.warn('Connection types other than FTP are not supported yet');
      }
    }); 
  }, []);

  return (
    <div className="home-container">
      {cards.map(card => makeCard(card))}
    </div>
  );
};

export default Home;
