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
import ReviewInstallation from '../stages/ReviewInstallation';
import spock from '../../assets/spock.svg'
import InstallationType from '../stages/installation/InstallTypeSelection';
import { selectLoading } from './wizardSlice';
import { useAppSelector } from '../../hooks';
import InitApfAuth from '../stages/InitApfAuth';
import Networking from '../stages/Networking';
import LaunchConfig from '../stages/LaunchConfig';
import { initProgress } from '../stages/progress/progressStore';

export const stages = [
  {id: 0, label: 'Connection', component: <Connection/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: false, steps: 1, nextButton: 'Continue'},
  {id: 1, label: 'Planning', component: <Planning/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: true, steps: 3, nextButton: 'Continue to Installation Options'},
  {id: 2, label: 'InstallationType', component: <InstallationType/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: false, steps: 1, nextButton: 'Continue to Components Installation'},
  {id: 3, label: 'Initialization', component: <Initialization/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, subStages: [
    {id: 0, label: 'Installation', component: <Installation/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Network Setup'},
    {id: 5, label: 'Networking', component: <Networking/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to APF Auth Setup'},
    {id: 1, label: 'APF Auth', component: <InitApfAuth/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Security Setup'},
    {id: 2, label: 'Security', component: <Security/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Certificates Setup'},
    {id: 3, label: 'Certificates', component: <Certificates/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Launch Setup'},
    {id: 6, label: 'Launch Config', component: <LaunchConfig/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Instance Setup'},
  ], nextButton: 'Review'},
  {id: 4, label: 'Review Installation', component: <ReviewInstallation/>, hasJCL: false, isSkippable: false, hasOutput: false, steps: 1, nextButton: 'Finish Installation'},
]

const Wizard = ({initialization}: {initialization: boolean}) => {
  initProgress();
  return (
      <div className="wizard-container" >
        {useAppSelector(selectLoading) ? <Overlay/> : null}
        <HorizontalLinearStepper stages={stages} initialization={initialization}/>
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