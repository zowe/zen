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
import flatten, { unflatten } from 'flat';
import { IResponse, IIpcConnectionArgs } from '../../types/interfaces';
import { setConnectionArgs, setResumeProgress, selectInitJobStatement, selectResumeProgress } from './stages/connection/connectionSlice';
import { setJobStatement } from './stages/PlanningSlice';
import { selectSchema, selectYaml, setSchema, setYaml, setZoweCLIVersion } from './configuration-wizard/wizardSlice';
import { useAppDispatch, useAppSelector } from '../hooks';
import { Tooltip } from '@mui/material';
import installationImg from '../assets/installation.png'
import installationDryImg from '../assets/installation-dry-run.png'
import eventDispatcher from "../../services/eventDispatcher";
import { selectConnectionStatus} from './stages/progress/progressSlice';
import  HorizontalLinearStepper  from './common/Stepper';
import Wizard from './configuration-wizard/Wizard'
import { ActiveState } from '../../types/stateInterfaces';
import { getInstallationArguments, getPreviousInstallation } from './stages/progress/StageProgressStatus';
import { DEF_NO_OUTPUT, FALLBACK_SCHEMA, FALLBACK_YAML } from './common/Utils';
import { selectInstallationArgs, setInstallationArgs } from './stages/installation/installationSlice';
import PasswordDialog from './common/PasswordDialog';

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
    id: "dry run", 
    name: "Zowe Installation Dry Run", 
    description: "It will guide you through the installation steps without running the installation.", 
    link: "/wizard",
    media: installationDryImg,
  }
]

const prevInstallationKey = "prev_installation";
const lastActiveState: ActiveState = {
  activeStepIndex: 0,
  isSubStep: false,
  activeSubStepIndex: 0,
};

const Home = () => {

  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const [showWizard, setShowWizard] = useState(false);
  const [showLoginDialog, setShowLogin] = useState(false);
  const [localYaml, setLocalYaml] = useState(useAppSelector(selectYaml));
  const [schema, setLocalSchema] = useState(useAppSelector(selectSchema));
  const installationArgs = useAppSelector(selectInstallationArgs);

  const { activeStepIndex, isSubStep, activeSubStepIndex, lastActiveDate } = getPreviousInstallation();

  const [isNewInstallation, setIsNewInstallation] = useState(false);

  const stages: any = [];
  const defaultTooltip: string = "Resume";
  const resumeTooltip = connectionStatus ? defaultTooltip : `Validate Credentials & ${defaultTooltip}`;
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [updatedConnection, setUpdatedConnection] = useState(false);

  const makeCard = (card: ICard) => {
    const {id, name, description, link, media} = card;
  
    const handleClick = () => {
      const flattenedData = flatten(lastActiveState);
      localStorage.setItem(prevInstallationKey, JSON.stringify(flattenedData));
      let newInstallationArgs = {};
      if (id === "install") {
        newInstallationArgs = {...newInstallationArgs, dryRunMode: false};
      } else if (id === "dry run") {
        newInstallationArgs = {...newInstallationArgs, dryRunMode: true};
      }
      dispatch(setYaml(FALLBACK_YAML));
      dispatch(setInstallationArgs(newInstallationArgs));
      window.electron.ipcRenderer.setConfigByKeyNoValidate("installationArgs", newInstallationArgs);
      setLocalYaml(FALLBACK_YAML);
      window.electron.ipcRenderer.setConfig(FALLBACK_YAML);
      // TODO: Ideally, reset connectionArgs too
    };
  
    return (  
      <Link key={`link-${id}`} to={link} >
        <Box sx={{ width: '40vw', height: '40vh'}} onClick={handleClick}>
          <Card id={`card-${id}`} square={true}>
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

  useEffect(() => {
    eventDispatcher.on('saveAndCloseEvent', () => setShowWizard(false));

    //Home is the first screen the user will always see 100% of the time. Therefore, we will call the loading of the configs, schemas, and installation args here and set them to the redux memory states

    //YAML LOADING - necessary for editor state as well as form values
    if(localYaml == undefined || (typeof localYaml === "object" && Object.keys(localYaml).length === 0)){
      window.electron.ipcRenderer.getConfig().then((res: IResponse) => {
        if (res.status) {
          dispatch(setYaml(res.details));
        } else {
          dispatch(setYaml(FALLBACK_YAML));
        }
      })
    }

    //SCHEMA LOADING - necessary for JsonForms
    if(schema == undefined || (typeof schema === "object" && Object.keys(schema).length === 0)){
      window.electron.ipcRenderer.getSchema().then((res: IResponse) => {
        if (res.status && res.details !== undefined) {
          dispatch(setSchema(res.details));
        } else {
          dispatch(setSchema(FALLBACK_SCHEMA));
        }
      })
    }

    //Load installation args
    window.electron.ipcRenderer.getConfigByKey("installationArgs").then((res: IResponse) => {
      if(res != undefined){
        dispatch(setInstallationArgs(res));
      } else {
        dispatch(setInstallationArgs({...selectInstallationArgs, ...getInstallationArguments()}));
      }
    })

    window.electron.ipcRenderer.checkZoweCLI().then((res: IResponse) => {
      if (res.status) {
        dispatch(setZoweCLIVersion(res.details));
      } else {
        console.info('No Zowe CLI found on local machine');
      }
    });

    window.electron.ipcRenderer.setStandardOutput(DEF_NO_OUTPUT).then((res: any) => {
    })

    window.electron.ipcRenderer.findPreviousInstallations().then((res: IResponse) => {
      const connectionStore = res.details;
      if (connectionStore["connection-type"] === 'ftp') {
        const jobStatement = connectionStore['ftp-details'].jobStatement.trim() || useAppSelector(selectInitJobStatement);
        // console.log(JSON.stringify(connectionStore['ftp-details'],null,2));
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
      if (!lastInstallation) {
        const flattenedData = flatten(lastActiveState);
        localStorage.setItem(prevInstallationKey, JSON.stringify(flattenedData));
        setIsNewInstallation(true);
      } else {
        const data: ActiveState = unflatten(JSON.parse(lastInstallation));
        setIsNewInstallation(!(data && data.lastActiveDate));
      }


    });
    return () => {
      eventDispatcher.off('saveAndCloseEvent', () => setShowWizard(true));
    };
  }, []);

  const resumeProgress = () => {
    setShowWizard(true);
    dispatch(setResumeProgress(true));

    if(connectionStatus) {
      setShowPasswordDialog(true);
    }
  }

  const confirmConnection = (status: boolean) => {
    setUpdatedConnection(status);
    setShowWizard(status);
  }

  return (
    <>
      {!showWizard && <div className="home-container" style={{ display: 'flex', flexDirection: 'column' }}>

        <div style={{ position: 'absolute', left: '-9999px' }}>
          <HorizontalLinearStepper stages={stages} />
        </div>

        {!connectionStatus && <div style={{marginBottom: '20px'}}></div>}

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
                <Tooltip title={resumeTooltip} arrow>
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
    {showWizard &&
      <>
        {showPasswordDialog && <PasswordDialog onPasswordSubmit={confirmConnection}></PasswordDialog>}
        {<Wizard initialization={false}/>}
      </>
    }
   </>
  );
};

export default Home;
