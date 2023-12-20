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

// TODO: define props, stages, stage interfaces
// TODO: One rule in the store to enable/disable button

export default function HorizontalLinearStepper(props: any) {

  const TYPE_YAML = "yaml";
  const TYPE_JCL = "jcl";
  const TYPE_OUTPUT = "output";

  const {stages} = props;
  const [activeStep, setActiveStep] = useState(0);
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

  const handleYAML = () => {
    toggleEditorVisibility(TYPE_YAML);
  }

  const handlePreview = (test_jcl: any) => {
    toggleEditorVisibility(TYPE_JCL);    
    setEditorContent(test_jcl);
  };

  const handleSubmit = () => {
     //here:
    // submit -> open editor with result -> mark skip button as continue button
    stages[activeStep].successful = true;
    toggleEditorVisibility(TYPE_OUTPUT);
  };

  const handleNext = () => {
    alertEmitter.emit('hideAlert');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setNextText(getContinueText());
  };

  const handleBack = () => {
    alertEmitter.emit('hideAlert');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setNextText(getContinueText());
  };

  const handleReset = () => {
    alertEmitter.emit('hideAlert');
    setActiveStep(0);
  };

  return (
    <Box className="stepper-container">
      <EditorDialog contentType={contentType} isEditorVisible={editorVisible} toggleEditorVisibility={toggleEditorVisibility} content={editorContent}/>
      <Stepper className="stepper" activeStep={activeStep}>
        {stages.map((stage: any, index: number) => {
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
          <div style={{flexGrow: 1, display: 'flex', overflow: 'auto', height: 'calc(100vh - 200px)'}}>
            {stages[activeStep].component}
          </div>
          <Box sx={{ display: 'flex', flexDirection: 'row', p: 2, borderTop: 'solid 1px lightgray' }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 4 }}
            >
              Previous Step
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
                Discard Setup
              </Button>
            </Link>
            <Box sx={{ flex: '1 1 auto' }} />
            {stages[activeStep].hasYaml &&
              <Button variant="contained" onClick={() => handleYAML()}>View YAML</Button>
            }
            {stages[activeStep].hasJCL &&
              <Button disabled={!useAppSelector(selectNextStepEnabled)} variant="contained" onClick={() => handlePreview({})}>Preview Job</Button>
            }
            {stages[activeStep].hasOutput &&
              <Button variant="contained" onClick={() => handlePreview({})}>Submit Job</Button>
            }
            <Button 
              disabled={!useAppSelector(selectNextStepEnabled) && !stages[activeStep].isSkippable} 
              variant="contained" 
              onClick={() => handleNext()}
            >
              {nextText}
            </Button>
            {stages[activeStep].isSkippable &&
              <Button variant="contained" onClick={() => handleNext()}>Skip Step</Button>
            }
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}