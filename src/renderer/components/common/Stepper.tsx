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
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { selectConnectionStatus } from '../stages/connection/connectionSlice';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectNextStepEnabled } from '../configuration-wizard/wizardSlice';
import { alertEmitter } from '../Header';
import EditorDialog from "./EditorDialog";
import { useTheme, createTheme } from '@mui/material/styles';


// TODO: define props, stages, stage interfaces
// TODO: One rule in the store to enable/disable button

export default function HorizontalLinearStepper(props: any) {

  const theme = createTheme();
  
  const TYPE_YAML = "yaml";
  const TYPE_JCL = "jcl";
  const TYPE_OUTPUT = "output";

  const {stages} = props;
  const [activeStep, setActiveStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [nextText, setNextText] = useState("Continue");
  const [contentType, setContentType] = useState('output');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [currStep, setCurrStep] = useState(1);

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

  const handleSubmit = () => {
     //here:
    // submit -> open editor with result -> mark skip button as continue button
    stages[activeStep].successful = true;
    toggleEditorVisibility(TYPE_OUTPUT);
  };

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

  const isNextStepEnabled = useAppSelector(selectNextStepEnabled);

  return (
    <Box className="stepper-container">
      <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility}/>
      <Stepper className="stepper" activeStep={activeStep}>
        {stages.map((stage: any, index: number) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={stage.id} {...stepProps}>
              <div style={activeStep === index && stages[activeStep].subStages ? {backgroundColor: '#E0E0E0', padding: '5px 5px 20px 5px', marginBottom: '-18px', borderTopRightRadius: '3px', borderTopLeftRadius: '3px'} : {}}>
                <StepLabel {...labelProps}>
                    {stage.label}
                </StepLabel>
              </div>
            </Step>
          );
        })}
      </Stepper>
      {stages[activeStep].subStages &&  <Stepper className="substepper" activeStep={activeSubStep}>
        {stages[activeStep].subStages.map((stage: any, index: number) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={stage.id} {...stepProps}>
                <StepLabel {...labelProps}>
                    {stage.label}
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
          <div style={{flexGrow: 1, display: 'flex', overflow: 'auto', height: stages[activeStep].subStages ? 'calc(100vh - 250px)' : 'calc(100vh - 200px)'}}>
            {stages[activeStep].subStages ? stages[activeStep].subStages[activeSubStep].component : stages[activeStep].component}
          </div>
          <Box sx={{ display: 'flex', flexDirection: 'row', p: 1, borderTop: 'solid 1px lightgray', justifyContent: 'flex-end'}}>
            <Box sx={{ flex: '1 1 auto' }} >
              {stages[activeStep].label === 'Planning' ? (
                <Button variant="outlined" sx={{ marginRight: '3px', textTransform: 'none' }} onClick={() => handlePreview({})}>
                  Submit Job
                </Button>
              ) : null}
            </Box>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ textTransform: 'none', mr: 1 }}>
              Previous Step
            </Button>
            <Link style={{margin: 0}} to="/">
              <Button // TODO: Not implemented
                variant="outlined"
                sx={{ textTransform: 'none', mr: 1 }}
                onClick={() => alertEmitter.emit('hideAlert')}>
                Save and close
              </Button>
            </Link>
            <Link style={{margin: 0}} to="/">
              <Button 
                variant="outlined"
                sx={{ textTransform: 'none', mr: 1 }}
                onClick={() => alertEmitter.emit('hideAlert')}>
                Discard Setup
              </Button>
            </Link>
            {stages[activeStep].isSkippable &&
              <Button 
                disabled={isNextStepEnabled}
                variant="contained" 
                sx={{ textTransform: 'none', mr: 1 }} 
                onClick={() => handleNext()}
              >
                Skip {stages[activeStep].subStages ? stages[activeStep].subStages[activeSubStep].label : stages[activeStep].label}
              </Button>
            }
            <Button 
              disabled={!isNextStepEnabled}
              variant="contained" 
              sx={{ textTransform: 'none', mr: 1 }}
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