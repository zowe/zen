/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { selectConnectionStatus } from '../stages/progress/progressSlice';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { selectPlanningStatus, selectInitializationStatus, selectDatasetInstallationStatus, selectNetworkingStatus, selectApfAuthStatus, selectSecurityStatus, selectCertificateStatus, selectLaunchConfigStatus, selectReviewStatus } from '../stages/progress/progressSlice';
import { selectInstallationTypeStatus } from '../stages/progress/progressSlice';
import { selectActiveStepIndex, selectActiveSubStepIndex } from '../stages/progress/activeStepSlice';
import { alertEmitter } from '../Header';
import EditorDialog from "./EditorDialog";
import savedInstall from '../../assets/saved-install-green.png';
import eventDispatcher from '../../../utils/eventDispatcher';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Home from '../Home';
import { getProgress, getCompleteProgress, setWizardStages } from '../stages/progress/StageProgressStatus';

import '../../styles/Stepper.css';
import { StepIcon } from '@mui/material';
import { stages } from '../configuration-wizard/Wizard';
// TODO: define props, stages, stage interfaces
// TODO: One rule in the store to enable/disable button

export default function HorizontalLinearStepper({stages, initialization}:{stages: any, initialization?:boolean}) {

  const connectionStatus = useSelector(selectConnectionStatus);

  const INIT_STAGE_ID = 3;
  const REVIEW_STAGE_ID = 4;

  const completeProgress = getCompleteProgress();

  const stageProgressStatus = [
    useSelector(selectConnectionStatus),
    completeProgress.planningStatus,
    completeProgress.installationTypeStatus,
    completeProgress.initializationStatus,
    completeProgress.reviewStatus
  ];

  const subStageProgressStatus = [
    completeProgress.datasetInstallationStatus,
    completeProgress.networkingStatus,
    completeProgress.apfAuthStatus,
    completeProgress.securityStatus,
    completeProgress.certificateStatus,
    completeProgress.launchConfigStatus
  ]
  
  const TYPE_YAML = "yaml";
  const TYPE_JCL = "jcl";
  const TYPE_OUTPUT = "output";

  const [activeStep, setActiveStep] =  initialization ? useState(0) : useState(useAppSelector(selectActiveStepIndex));
  const [activeSubStep, setActiveSubStep] = initialization ? useState(0) : useState(useAppSelector(selectActiveSubStepIndex));
  const [nextText, setNextText] = useState("Continue");
  const [contentType, setContentType] = useState('output');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    eventDispatcher.on('updateActiveStep', updateActiveStepListener);
    return () => {
      eventDispatcher.off('updateActiveStep', updateActiveStepListener);
    };
  }, []); 

  const updateActiveStepListener = (newActiveStep: number, isSubStep: boolean, subStepIndex?: number) => {
    console.log("INSIDE UPDATE ACTIVE STEP LISTENER");
    setActiveStep(newActiveStep);
    const newSubStep = isSubStep ? subStepIndex : 0;
    setActiveSubStep(newSubStep);
  };

  const toggleEditorVisibility = (type?: any) => {
    if (type) {
      setContentType(type);
    }
    setEditorVisible(!editorVisible);
  };

  const getContinueText = () => {
    return 'Continue to next step';//'+stages[activeStep+1].label;
  };

  const getSkipText = () => {
    return 'Skip step';//+stages[activeStep+1].label;
  };

  const handleYAML = () => {
    toggleEditorVisibility(TYPE_YAML);
  }

  const handleSubmit = () => {
     //here:
    // submit -> open editor with result -> mark skip button as continue button
    stages[activeStep].successful = true;
    toggleEditorVisibility(TYPE_OUTPUT);
  };

  const handleSkip = () => {
    stages[activeStep].isSkipped = true;
    stages[activeStep].subStages[activeSubStep].isSkipped = true;
    handleNext();
  }

  const handleNext = () => {
    alertEmitter.emit('hideAlert');
    
    if(stages[activeStep].subStages && activeSubStep + 1 < stages[activeStep].subStages.length){
      setActiveSubStep((prevActiveSubStep) => prevActiveSubStep + 1);
    } else {
      if(activeStep + 1 === stages.length) {
        console.log('Start Zowe');
        // window.electron.ipcRenderer.startZowe();
        return;
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setNextText(getContinueText());
    }
  };

  const handleBack = () => {
    alertEmitter.emit('hideAlert');
    stages[activeStep].subStages && activeSubStep > 0 ? setActiveSubStep((prevActiveSubStep) => prevActiveSubStep - 1) : setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setNextText(getContinueText());
  };

  const handleReset = () => {
    alertEmitter.emit('hideAlert');
    setActiveStep(0);
  };

  const handlePreview = (test_jcl: any) => {
    toggleEditorVisibility(TYPE_JCL);    
    setEditorContent(test_jcl);
  };

  const handleStepperClick = (newActiveStep: number, isSubStep: boolean, subStepIndex?: number) => {
    if(!connectionStatus) {
      return;
    }

    // To not access the stage if any previous stage is not completed
    for (let i = 0; i < newActiveStep; i++) {
      const statusAtIndex = stageProgressStatus[i];
      // We can access 'Review Installation' if Initialization in not completed since it can be skipped
      if (!statusAtIndex && !(newActiveStep == REVIEW_STAGE_ID && i == INIT_STAGE_ID)) {
        return;
      }
    }

    setActiveStep(newActiveStep);
    const newSubStep = isSubStep ? subStepIndex : 0;
    setActiveSubStep(newSubStep);
  }

  const getStepIcon = (error: any, stageId: number, isSubStep?: boolean, subStepId?: number) => {
    
    if (!error || (isSubStep && getProgress(stages[stageId].subStages[subStepId].statusKey)) || (!isSubStep && getProgress(stages[stageId].statusKey))) {
      return <StepIcon icon={<CheckCircle sx={{ color: 'green', fontSize: '1.2rem' }} />} />;
    }

    if ((error && activeStep>stageId && !isSubStep) || (error && isSubStep && stages[stageId].subStages[subStepId].isSkipped)) {
      return <StepIcon icon={<Warning sx={{ color: 'orange', fontSize: '1.2rem' }} />} />;
    }

    else {
      return (
        <StepIcon
          icon={
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'grey',
                color: 'white',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSubStep ? subStepId : stageId}
            </div>
          }
        />
      );
    }
  };

  const onSaveAndClose = () => {
    alertEmitter.emit('hideAlert');
    eventDispatcher.emit('saveAndCloseEvent');
    setWizardStages(stages);
  }

  const isNextStepEnabled = useAppSelector(selectNextStepEnabled);

  return (
    <Box className="stepper-container">
      <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility}/>
      <Stepper className="stepper" activeStep={activeStep}>
        {stages.map((stage: any, index: number) => {
          const stepProps = {};
          const labelProps: {error?: boolean;} = {};

          labelProps.error = stageProgressStatus[index] ? false : true;

          // To exclude the "Finish Installation" stage from the stepper
          if(index == stages.length-1) {
            return;
          }

          return (
            // This adds shadow to the "filing cabinet" top-slip UI
            <Step key={stage.id} {...stepProps}>
              <div style={activeStep === index && stages[activeStep].subStages ? 
                {backgroundColor: '#E0E0E0', 
                padding: '10px 20px 25px', 
                position: 'relative', 
                marginBottom: '-27px', 
                borderTopRightRadius: '7px', 
                borderTopLeftRadius: '7px',
                boxShadow: 'rgb(0 0 0 / 15%) 0px 6px 4px -1px inset'} : {}}>
                <StepLabel {...labelProps} 
                  error={labelProps.error} 
                  // icon={labelProps.error ? <Warning sx={{ color: 'orange', fontSize: '1.2rem' }} /> : <CheckCircle sx={{ color: 'green', fontSize: '1.2rem' }} />}>
                  icon={getStepIcon(labelProps.error, stage.id)}>
                  <span className="navigator" onClick={() => handleStepperClick(stage.id, !!stage.subStage)}>{stage.label}</span>
                </StepLabel>
              </div>
            </Step>
          );
        })}
      </Stepper>
      {stages[activeStep] && stages[activeStep].subStages &&  <Stepper className="substepper" activeStep={activeSubStep}>
        {stages[activeStep].subStages.map((stage: any, index: number) => {
          const stepProps = {};
          const labelProps: {error?: boolean;} = {};
          labelProps.error = subStageProgressStatus[index] ? false : true;

          return (
            <Step key={stage.id} {...stepProps}>
                <StepLabel {...labelProps}
                  error={labelProps.error} 
                  // icon={labelProps.error ? <Warning sx={{ color: 'orange', fontSize: '1.2rem' }} /> : <CheckCircle sx={{ color: 'green', fontSize: '1.2rem' }} />}>
                  icon={getStepIcon(labelProps.error, activeStep, true, index)}>
                <span className="navigator" onClick={() => handleStepperClick(activeStep, true, stage.id )}>{stage.label}</span>
                </StepLabel>
            </Step>
          );
        })}
      </Stepper>}
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
          {stages[activeStep] && <div style={{flexGrow: 1, display: 'flex', overflow: 'auto', height: stages[activeStep].subStages ? 'calc(100vh - 250px)' : 'calc(100vh - 200px)'}}>
            { stages[activeStep].subStages ? stages[activeStep].subStages[activeSubStep].component : stages[activeStep].component}
          </div> }
          <Box sx={{ display: 'flex', flexDirection: 'row', p: "8px 8px 0 8px", borderTop: 'solid 1px lightgray', justifyContent: 'flex-end'}}>
            {/* TODO: This needs a confirmation modal */}
            <Link style={{margin: 0}} to="/">
              { stages[activeStep] && stages[activeStep].nextButton && 
                <Button // TODO: Not implemented
                  color="success"
                  variant="outlined"
                  sx={{ textTransform: 'none', mr: 1 }}
                  onClick={onSaveAndClose}>
                  <img style={{width: '16px', height: '20px', paddingRight: '8px'}} src={savedInstall} alt="save and close"/>
                  Save & close
                </Button>
              }
            </Link>
            {stages[activeStep] && stages[activeStep].nextButton && 
              <Button
                variant="outlined"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ textTransform: 'none', mr: 1 }}>
                Previous step
              </Button>
            }
            {stages[activeStep] && stages[activeStep].isSkippable &&
              <Button 
                disabled={isNextStepEnabled}
                variant="contained" 
                sx={{ textTransform: 'none', mr: 1 }} 
                onClick={() => handleSkip()}
              >
                Skip {stages[activeStep] && stages[activeStep].subStages ? stages[activeStep].subStages[activeSubStep].label : stages[activeStep]? stages[activeStep].label: ''}
              </Button>
            }
            {stages[activeStep] && stages[activeStep].nextButton &&
              <Button 
              disabled={!isNextStepEnabled}
              variant="contained" 
              sx={{ textTransform: 'none', mr: 1 }}
              onClick={() => handleNext()}
            >
              {(stages[activeStep] && stages[activeStep].subStages && activeSubStep < stages[activeStep].subStages.length - 1) ? stages[activeStep].subStages[activeSubStep].nextButton : stages[activeStep] ? stages[activeStep].nextButton : ''}
            </Button>}
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}