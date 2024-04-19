/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, {useEffect, useState} from "react";
import { useSelector } from 'react-redux';
import {Box, Button, Typography, Tooltip} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ContainerCard from '../common/ContainerCard';
import {stages} from "../configuration-wizard/Wizard";
import { selectConnectionArgs } from './connection/connectionSlice';
import { useAppSelector, useAppDispatch } from '../../hooks';
import eventDispatcher from '../../../services/eventDispatcher';
import EditorDialog from "../common/EditorDialog";
import { createTheme } from '@mui/material/styles';
import { selectConnectionStatus, selectPlanningStatus, selectInstallationTypeStatus, selectInitializationStatus, selectDatasetInstallationStatus, selectNetworkingStatus, selectApfAuthStatus, selectSecurityStatus, selectCertificateStatus, selectLaunchConfigStatus, setReviewStatus } from './progress/progressSlice';
import { setActiveStep } from './progress/activeStepSlice';
import { setNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { getStageDetails, getSubStageDetails } from "./progress/progressStore";
import { TYPE_YAML, TYPE_OUTPUT, TYPE_JCL } from '../common/Utils';

import '../../styles/ReviewInstallation.css';

const ReviewInstallation = () => {

  const dispatch = useAppDispatch();

  const stageLabel = 'Review Installation';

  const STAGE_ID = getStageDetails(stageLabel).id;
  const SUB_STAGES = !!getStageDetails(stageLabel).subStages;

  const [contentType, setContentType] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);

  const connectionArgs = useAppSelector(selectConnectionArgs);

  const theme = createTheme();

  const stageProgressStatus = [
    useSelector(selectConnectionStatus),
    useSelector(selectPlanningStatus),
    useSelector(selectInstallationTypeStatus),
    useSelector(selectInitializationStatus),
  ];
  
  const subStageProgressStatus = [
    useSelector(selectDatasetInstallationStatus),
    useSelector(selectNetworkingStatus),
    useSelector(selectApfAuthStatus),
    useSelector(selectSecurityStatus),
    useSelector(selectCertificateStatus),
    useSelector(selectLaunchConfigStatus),
  ];



  useEffect(() => {

    const stageProgress = stageProgressStatus.every(status => status === true);
    const subStageProgress = subStageProgressStatus.every(status => status === true);

    if(stageProgress && subStageProgress) {
      dispatch(setNextStepEnabled(true));
    } else {
      dispatch(setNextStepEnabled(false));
    }

    dispatch(setReviewStatus(true));

    return () => {
      dispatch(setActiveStep({ activeStepIndex: STAGE_ID, isSubStep: SUB_STAGES, activeSubStepIndex: 0 }));
    }
  }, []);

  const toggleEditorVisibility = (type: any) => {
    setContentType(type);
    setEditorVisible(!editorVisible);
  };

  const updateActiveStep = (index: number, isSubStep: boolean, subStepIndex?: number) => {
    eventDispatcher.emit('updateActiveStep', index, isSubStep, subStepIndex);
  }

  return (
    <div>
      <Box sx={{ position:'absolute', bottom: '1px', display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-start', [theme.breakpoints.down('lg')]: {flexDirection: 'column',alignItems: 'flex-start'}}}>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_YAML)}>View Yaml</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_JCL)}>View/Submit Job</Button>
        <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => toggleEditorVisibility(TYPE_OUTPUT)}>View Job Output</Button>
      </Box>
    <ContainerCard title="Review Installation" description="Review all steps before clicking Finish Installation. Visit a previous step to change it.">
      <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} readOnlyYaml={true} />
      <Box sx={{ overflow: 'auto' }}>
        {stages.map(stage => (
          <React.Fragment key={stage.id}>
            {stage.id === 0 && (
              <Box className="review-component-box-conn">
                <Typography className="review-component-text" onClick={() => updateActiveStep(stage.id, false)}>{stage.label}</Typography>
                {stageProgressStatus[stage.id] && (<Tooltip title="Connection Successful" arrow><CheckCircleIcon className="checkmark" /></Tooltip>)}
                <Box className="connection-attr-box">
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Host</span> 
                      <span className="connection-attr-value">{connectionArgs.host}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">FTP Port</span> 
                      <span className="connection-attr-value">{connectionArgs.port}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Username</span> 
                      <span className="connection-attr-value">{connectionArgs.user}</span>
                    </Typography>
                  </Box>
                  <Box className="connection-attr">
                    <Typography>
                      <span className="connection-attr-label">Password</span> 
                      <span className="connection-attr-value">*****</span>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            {stage.id !== 0 && stage.id < 4 && (
              <div>
                <Box className="review-component-box">
                  <Typography className="review-component-text" onClick={() => updateActiveStep(stage.id, false)}>{stage.label}</Typography>
                  {stageProgressStatus[stage.id] && (<Tooltip title={`${stage.label} Successful`} arrow><CheckCircleIcon className="checkmark" /></Tooltip>)}
                  {!stageProgressStatus[stage.id] && (<Tooltip title={`${stage.label} Pending`} arrow><WarningIcon className="warningIcon"/></Tooltip>)}
                </Box>
                
                <Box className="substages">
                  { stage.subStages && (<div className="vertical-line"></div>)}
                  <div>
                    {stage.subStages && stage.subStages.map(subStage => (
                      <Box key={subStage.id} className="review-component-box-nested">
                        <Typography className="review-component-text" onClick={() => updateActiveStep(stage.id, true, subStage.id)}>{subStage.label}</Typography>
                        {subStageProgressStatus[subStage.id] && (<Tooltip title={`${subStage.label} Successful`} arrow><CheckCircleIcon className="checkmark" /></Tooltip>)}
                        {!subStageProgressStatus[subStage.id] && (<Tooltip title={`${subStage.label} Pending`} arrow><WarningIcon className="warningIcon"/></Tooltip>)}
                      </Box>
                      )
                    )}
                  </div>
                </Box>
              </div>
            )}
          </React.Fragment>
        ))}
      </Box>
    </ContainerCard>
    </div>
  );
};

export default ReviewInstallation;
