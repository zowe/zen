/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Check from '@mui/icons-material/Check';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { selectConnectionStatus } from '../stages/connection/connectionSlice';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { alertEmitter } from '../Header';
import { StepIconProps } from '@mui/material/StepIcon';

// TODO: define props, stages, stage interfaces
// TODO: One rule in the store to enable/disable button

const CustomStepIconRoot = styled('div')<{ ownerState: { active?: boolean, progress?: string } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
      color: theme.palette.primary.main,
    }),
    '& .CustomStepIcon-container': {
      minWidth: 36,
      minHeight: 36,
    },
    '& .CustomStepIcon-flex-container': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    '& .CustomStepIcon-completedIcon': {
      color: theme.palette.primary.main,
      zIndex: 1,
      fontSize: 24,
    },
    '& .CustomStepIcon-active': {
      width: 24,
      height: 24,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
    '& .CustomStepIcon-active-inner': {
      zIndex: 2,
    },
    '& .CustomStepIcon-progress-bar': {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      marginLeft: '-30px',
      background: `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(${theme.palette.primary.main} ${ownerState.progress}%, #c6e3ff 0)`,  
    },
    // '& .CustomStepIcon-active-inner::before': {
    //   content: `"${ownerState.progress}%"`,
    // },
  }),
);

export default function HorizontalLinearStepper(props: any) {

  const {stages} = props;
  const [activeStep, setActiveStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  const handleNext = () => {
    alertEmitter.emit('hideAlert');
    if(stages[activeStep].subStages && activeSubStep + 1 < stages[activeStep].subStages.length){
      setActiveSubStep((prevActiveSubStep) => prevActiveSubStep + 1)
    } else {
      if(activeStep + 1 === stages.length) {
        console.log('Start Zowe');
        // window.electron.ipcRenderer.startZowe();
        return;
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    alertEmitter.emit('hideAlert');
    stages[activeStep].subStages && activeSubStep > 0 ? setActiveSubStep((prevActiveSubStep) => prevActiveSubStep - 1) : setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    alertEmitter.emit('hideAlert');
    setActiveStep(0);
  };

  function CustomStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    const substeps = active && stages[activeStep].subStages?.length;
    const progress = substeps ? (activeSubStep / stages[activeStep].subStages.length * 100).toFixed(0) : '0';

    return (
      <CustomStepIconRoot ownerState={{ active, progress }} className={className}>
        <div className='CustomStepIcon-container CustomStepIcon-flex-container'>
          {completed ? (
            <Check className="CustomStepIcon-completedIcon" />
          ) : (
            substeps ? 
            <div className='CustomStepIcon-flex-container'>
              <div className="CustomStepIcon-active CustomStepIcon-active-inner"/>
              <div className="CustomStepIcon-progress-bar"/>
            </div> :
            <div className="CustomStepIcon-active"/>
          )}
        </div>
      </CustomStepIconRoot>
    );
  }

  return (
    <Box className="stepper-container">
      <Stepper className="stepper" activeStep={activeStep}>
        {stages.map((stage: any, index: number) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={stage.id} {...stepProps}>
                <StepLabel StepIconComponent={CustomStepIcon} {...labelProps}>
                    {stages[activeStep].subStages&&activeStep === index  ? 
                      <div>
                        <p style={{margin: 0}}>{stage.label}</p>
                        <p style={{margin: 0, fontSize: '13px', fontStyle: 'italic'}}>{stages[activeStep].subStages[activeSubStep].label}</p>
                      </div> : 
                      stage.label}
                </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === stages.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1, color: 'black' }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{flexGrow: 1, display: 'flex', overflow: 'auto', height: stages[activeStep].subStages ? 'calc(100vh - 250px)' : 'calc(100vh - 200px)'}}>
            {stages[activeStep].subStages ? stages[activeStep].subStages[activeSubStep].component : stages[activeStep].component}
          </div>
          <Box sx={{ display: 'flex', flexDirection: 'row', p: 2, borderTop: 'solid 1px lightgray' }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 4 }}
            >
              Step back
            </Button>
            <Link style={{margin: 0}} to="/">
              <Button // TODO: Not implemented
                variant="text" sx={{ mr: 1 }}
                onClick={() => alertEmitter.emit('hideAlert')}>
                Save and close
              </Button>
            </Link>
            <Link style={{margin: 0}} to="/">
              <Button 
                variant="text" sx={{ mr: 1 }} 
                onClick={() => alertEmitter.emit('hideAlert')}>
                Discard
              </Button>
            </Link>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button 
              disabled={!useAppSelector(selectNextStepEnabled)} 
              variant="contained" 
              onClick={() => handleNext()}
            >
              {stages[activeStep].subStages ? stages[activeStep].subStages[activeSubStep].nextButton : stages[activeStep].nextButton}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}