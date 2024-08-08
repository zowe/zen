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
import { Link, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import flatten, { unflatten } from 'flat';
import { IResponse, IIpcConnectionArgs } from '../../types/interfaces';
import { setConnectionArgs, setResumeProgress, selectInitJobStatement, selectResumeProgress, connectionSlice } from './stages/connection/connectionSlice';
import { setJobStatement } from './stages/PlanningSlice';
import { selectSchema, selectYaml, setSchema, setYaml, setZoweCLIVersion } from './configuration-wizard/wizardSlice';
import { useAppDispatch, useAppSelector } from '../hooks';
import { Tooltip } from '@mui/material';
import installationImg from '../assets/installation.png'
import installationDryImg from '../assets/installation-dry-run.png'
import eventDispatcher from "../../services/eventDispatcher";
import { selectConnectionStatus, setConnectionStatus} from './stages/progress/progressSlice';
import  HorizontalLinearStepper  from './common/Stepper';
import Wizard from './configuration-wizard/Wizard'
import { ActiveState, InstallationArgs } from '../../types/stateInterfaces';
import { getInstallationArguments, getPreviousInstallation } from './stages/progress/StageProgressStatus';
import { DEF_NO_OUTPUT, FALLBACK_SCHEMA, FALLBACK_YAML } from './common/Utils';
import { selectInstallationArgs, setInstallationArgs, installationSlice, setIsNewInstallation, selectIsNewInstallation } from './stages/installation/installationSlice';
import PasswordDialog from './common/passwordDialog';
import WarningDialog from './Dialogs/WarningDialog';
import HomeCardComponent from './HomeCardComponent';
import { ICard } from '../../types/interfaces';

// REVIEW: Get rid of routing

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
  const navigate = useNavigate();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const [showWizard, setShowWizard] = useState(false);
  const [localYaml, setLocalYaml] = useState(useAppSelector(selectYaml));
  const schema = useAppSelector(selectSchema);

  const { lastActiveDate } = getPreviousInstallation();

  const stages: any = [];
  const defaultTooltip: string = "Resume";
  const resumeTooltip = connectionStatus ? defaultTooltip : `Validate Credentials & ${defaultTooltip}`;
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const isNewInstallation = useAppSelector(selectIsNewInstallation);
  const [newInstallationClicked, setNewInstallationClick] = useState(false);
  const [previousInstallation, setPreviousInstallation] = useState(false);
  let newInstallationArgs = installationSlice.getInitialState().installationArgs;

  const handleCardClick = (newInstallationArgs: InstallationArgs) => {
    dispatch(setYaml(FALLBACK_YAML));
    dispatch(setInstallationArgs(newInstallationArgs));
    window.electron.ipcRenderer.setConfigByKeyNoValidate("installationArgs", newInstallationArgs);
    setLocalYaml(FALLBACK_YAML);
    window.electron.ipcRenderer.setConfig(FALLBACK_YAML);
    // TODO: Ideally, reset connectionArgs too
    // but this introduces bug with "self certificate chain" it's the checkbox, it looks checked but
    // it acts like it's not unless you touch it
    // dispatch(setConnectionArgs(connectionSlice.getInitialState().connectionArgs));
  }

  const handleClick = (id: string) => {

    if (id === "install") {
      setNewInstallationClick(true);
      if(previousInstallation) {
        return;
      }
      dispatch(setIsNewInstallation(true));
      dispatch(setConnectionStatus(false));
      dispatch(setResumeProgress(false));
      newInstallationArgs = {...newInstallationArgs, dryRunMode: false};
    } else if (id === "dry run") {
      newInstallationArgs = {...newInstallationArgs, dryRunMode: true};
    }
    handleCardClick(newInstallationArgs);
  };

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
        dispatch(setIsNewInstallation(true));
        setPreviousInstallation(false);
      } else {
        const data: ActiveState = unflatten(JSON.parse(lastInstallation));
        dispatch(setIsNewInstallation(!(data && data.lastActiveDate)));
        setPreviousInstallation(!!(data && data.lastActiveDate));
      }


    });
    return () => {
      eventDispatcher.off('saveAndCloseEvent', () => setShowWizard(true));
    };
  }, []);

  const resumeProgress = () => {
    setShowWizard(true);
    dispatch(setResumeProgress(true));
    dispatch(setIsNewInstallation(false));
 
    if(connectionStatus) {
      setShowPasswordDialog(true);
    }
  }

  const confirmConnection = (status: boolean) => {
    setShowPasswordDialog(!status);
    setShowWizard(status);
  }

  const confirmNewInstallation = (status: boolean) => {
    dispatch(setIsNewInstallation(status))
    setNewInstallationClick(false);
    setPreviousInstallation(!status);

    if(status) {
      dispatch(setConnectionStatus(false));
      dispatch(setResumeProgress(false));
      newInstallationArgs = {...newInstallationArgs, dryRunMode: false};
      handleCardClick(newInstallationArgs);
      navigate('/wizard');
    }
  }

  return (
    <>
      { previousInstallation && newInstallationClicked &&
        <WarningDialog onWarningDialogSubmit={confirmNewInstallation}/>
      }

      {!showWizard && <div className="home-container" style={{ display: 'flex', flexDirection: 'column' }}>

        <div style={{ position: 'absolute', left: '-9999px' }}>
          {stages.length > 0 && <HorizontalLinearStepper stages={stages} />}
        </div>

        {!connectionStatus && <div style={{marginBottom: '20px'}}></div>}

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '8%' }}>
          {cards.map(card => (
            <HomeCardComponent
              key={card.id}
              id={card.id}
              name={card.name}
              description={card.description}
              link={card.link}
              media={card.media}
              handleClick={handleClick}
              previousInstallation={previousInstallation}
            />
            ))}
        </div>

        {previousInstallation && <div style={{marginBottom: '1px',marginTop: '120px',background: 'white', fontSize: 'small',marginLeft: 'calc(8% + 10px)', padding: '15px 0 15px 15px',width: 'calc(80% + 5px)', boxShadow: '1px 1px 3px #a6a6a6'}}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>

            <div style={{paddingBottom: '10px', color: 'black'}}>
             <Typography variant="subtitle1" component="div">Saved Installation</Typography>
            </div>

            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: '10px'}}>
              {lastActiveDate && <div style={{paddingRight: '10px'}}><span style={{color: 'black'}}>Last updated on:</span> {lastActiveDate}</div>}
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
        {!showPasswordDialog && <Wizard initialization={isNewInstallation}/>}
      </>
    }
   </>
  );
};

export default Home;
