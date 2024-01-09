/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import HorizontalLinearStepper from '../common/Stepper';
import Connection from "../stages/connection/Connection";
import Planning from "../stages/Planning";
import Installation from "../stages/installation/Installation";
import Security from "../stages/Security";
import Certificates from "../stages/Certificates";
import Initialization from "../stages/Initialization";
import spock from '../../assets/spock.svg'
import InstallationType from '../stages/installation/InstallTypeSelection';
import { selectLoading } from './wizardSlice';
import { useAppSelector } from '../../hooks';
import InitApfAuth from '../stages/InitApfAuth';

const stages = [
  {id: 0, label: 'Connection', component: <Connection/>, hasJCL: false, isSkippable: false, hasOutput: false, steps: 1, nextButton: 'Continue'},
  {id: 1, label: 'Planning', component: <Planning/>, hasJCL: false, isSkippable: false, hasOutput: true, steps: 3, nextButton: 'Continue to Installation Options'},
  {id: 2, label: 'Installation Type', component: <InstallationType/>, hasJCL: false, isSkippable: false, hasOutput: false, steps: 1, nextButton: 'Continue to Components Installation'},
  {id: 3, label: 'Initialization', component: <Initialization/>, hasJCL: true, isSkippable: true, hasYaml: true, hasOutput: true, steps: 1, subStages: [
    {id: 0, label: 'Installation', component: <Installation/>, hasJCL: true, isSkippable: true, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Security Setup'},
    {id: 1, label: 'Security', component: <Security/>, hasJCL: true, isSkippable: true, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Certificates Setup'},
    {id: 2, label: 'Certificates', component: <Certificates/>, hasJCL: true, isSkippable: true, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Instance Setup'},
  ], nextButton: <div style={{display: 'flex', alignItems: 'center'}}><img style={{width: '18px', height: '18px', paddingRight: '12px'}} src={spock}/>Live long and prosper</div>},
]

const Wizard = () => {
  return (
      <div className="wizard-container" >
        {useAppSelector(selectLoading) ? <Overlay/> : null}
        <HorizontalLinearStepper stages={stages}/>
      </div>
  );
};

const Overlay = () => {
  return (
    <div className="overlay">
        <div className="overlay__inner">
            <div className="overlay__content"><span className="spinner"></span></div>
        </div>
    </div>
  )
}

export default Wizard;