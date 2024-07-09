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
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectNextStepEnabled, setLoading, setYaml } from '../configuration-wizard/wizardSlice';
import { selectActiveStepIndex, selectActiveSubStepIndex } from '../stages/progress/activeStepSlice';
import { alertEmitter } from '../Header';
import EditorDialog from "./EditorDialog";
import savedInstall from '../../assets/saved-install-green.png';
import eventDispatcher from '../../../services/eventDispatcher';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { TYPE_YAML, TYPE_OUTPUT, TYPE_JCL, INIT_STAGE_LABEL, REVIEW_INSTALL_STAGE_LABEL, UNPAX_STAGE_LABEL } from '../common/Utils';
import { getProgress, getCompleteProgress, mapAndSetSkipStatus, mapAndGetSkipStatus } from '../stages/progress/StageProgressStatus';

import '../../styles/Stepper.css';
import { StepIcon } from '@mui/material';
import { getStageDetails } from '../../../services/StageDetails';
import { IResponse } from '../../../types/interfaces';
import { selectConnectionArgs, setPassword } from '../stages/connection/connectionSlice';
import { selectInstallationArgs } from '../stages/installation/installationSlice';
// TODO: define props, stages, stage interfaces
// TODO: One rule in the store to enable/disable button

export default function HorizontalLinearStepper({stages, initialization}:{stages: any, initialization?:boolean}) {

  const connectionStatus = useSelector(selectConnectionStatus);

  const INIT_STAGE_ID = getStageDetails(INIT_STAGE_LABEL).id;
  const REVIEW_STAGE_ID = getStageDetails(REVIEW_INSTALL_STAGE_LABEL).id;

  const completeProgress = getCompleteProgress();

  const stageProgressStatus = [
    useSelector(selectConnectionStatus),
    completeProgress.planningStatus,
    completeProgress.installationTypeStatus,
    completeProgress.downloadUnpaxStatus,
    completeProgress.initializationStatus,
    completeProgress.reviewStatus
  ];

  const [subStageProgressStatus, setProgressStatus] = useState([
    completeProgress.datasetInstallationStatus,
    completeProgress.networkingStatus,
    completeProgress.apfAuthStatus,
    completeProgress.securityStatus,
    completeProgress.stcsStatus,
    completeProgress.certificateStatus,
    completeProgress.launchConfigStatus
  ])
  


  const [activeStep, setActiveStep] =  initialization ? useState(0) : useState(useAppSelector(selectActiveStepIndex));
  const [activeSubStep, setActiveSubStep] = initialization ? useState(0) : useState(useAppSelector(selectActiveSubStepIndex));
  const [nextText, setNextText] = useState("Continue");
  const [contentType, setContentType] = useState('output');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const installationArgs = useAppSelector(selectInstallationArgs);
  const connectionArgs = useAppSelector(selectConnectionArgs);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const mvsCompleteListener = (completed: boolean) => {
      setProgressStatus([true, completeProgress.networkingStatus,
        completeProgress.apfAuthStatus,
        completeProgress.securityStatus,
        completeProgress.certificateStatus,
        completeProgress.launchConfigStatus])
    };
    eventDispatcher.on('updateActiveStep', updateActiveStepListener);
    eventDispatcher.on('initMvsComplete', mvsCompleteListener);
    return () => {
      eventDispatcher.off('updateActiveStep', updateActiveStepListener);
      eventDispatcher.off('initMvsComplete', mvsCompleteListener);
    };
  }, []); 

  const updateActiveStepListener = (newActiveStep: number, isSubStep: boolean, subStepIndex?: number) => {
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

  const handleSkip = async () => {
    stages[activeStep].isSkipped = true;
    if(stages[activeStep].subStages){
      stages[activeStep].subStages[activeSubStep].isSkipped = true;
      mapAndSetSkipStatus(activeSubStep, true);
    }
    if(stages[activeStep].label === UNPAX_STAGE_LABEL && installationArgs.installationType != "smpe"){
      alertEmitter.emit('showAlert', 'Retrieving example-zowe.yaml and latest schemas from Zowe runtime files...', 'info');
      dispatch(setLoading(true));
      await window.electron.ipcRenderer.fetchExampleYamlBtnOnClick(connectionArgs, installationArgs).then((res: IResponse) => {
        if(!res.status){ //errors during runInstallation()
          alertEmitter.emit('showAlert', res.details.message ? res.details.message : res.details, 'error');
          console.log("failed to retrieve schemas: ", res.details.message ? res.details.message : res.details);
        }
        if(res.details?.mergedYaml != undefined){
          dispatch(setYaml(res.details.mergedYaml));
          window.electron.ipcRenderer.setConfig(res.details.mergedYaml);
          alertEmitter.emit('showAlert', "Successfully fetched example-zowe.yaml and latest schemas", 'success');
          console.log("Successfully fetched example-zowe.yaml and latest schemas");
        }
      }).catch((e: any) => {
        alertEmitter.emit('showAlert', e.message, 'error');
        console.log("failed to retrieve schemas", e.message);
      });
    }
    dispatch(setLoading(false));
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

    setActiveStep(newActiveStep);
    const newSubStep = isSubStep ? subStepIndex : 0;
    if((subStepIndex > 0 && completeProgress.datasetInstallationStatus === true) || subStepIndex === 0){ //only allow substages after installation to be navigated to if init mvs has been completed
      setActiveSubStep(newSubStep);
    }
  }

  const getStepIcon = (error: any, stageId: number, isSubStep?: boolean, subStepId?: number) => {
    
    if (!error || (isSubStep && getProgress(stages[stageId].subStages[subStepId].statusKey)) || (!isSubStep && getProgress(stages[stageId].statusKey))) {
      return <StepIcon icon={<CheckCircle sx={{ color: 'green', fontSize: '1.2rem' }} />} />;
    }

    if ((isSubStep && mapAndGetSkipStatus(subStepId)) || (error && activeStep>stageId && !isSubStep) || (error && isSubStep && stages[stageId].subStages[subStepId].isSkipped)) {
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
    dispatch(setPassword(''));
    window.location.reload();
  }

  const isNextStepEnabled = useAppSelector(selectNextStepEnabled);

  const skipButtonDisabled = (stages: any, activeStep: number, activeSubStep: number) => {
    if(stages[activeStep]) {
      if(stages[activeStep].isSkippable && !stages[activeStep].subStages) {
        if(getProgress(stages[activeStep].statusKey)) {
          return true;
        } else {
          return false;
        }
      } else if(stages[activeStep].subStages) {
        if(stages[activeStep].subStages[activeSubStep].label === ("Installation")) {
          return true;
        } else if(getProgress(stages[activeStep].subStages[activeSubStep].statusKey)) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return true;
    }
  }

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
                marginBottom: '-30px', 
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
                disabled={skipButtonDisabled(stages, activeStep, activeSubStep)}
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