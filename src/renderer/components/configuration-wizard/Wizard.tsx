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
import FinishInstallation from '../stages/FinishInstallation';
import spock from '../../assets/spock.svg'
import InstallationType from '../stages/installation/InstallTypeSelection';
import { selectLoading } from './wizardSlice';
import { useAppSelector } from '../../hooks';
import InitApfAuth from '../stages/InitApfAuth';
import Networking from '../stages/Networking';
import LaunchConfig from '../stages/LaunchConfig';
import { getWizardStages } from '../stages/progress/StageProgressStatus';

let stages = [
  {id: 0, label: 'Connection', component: <Connection/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: false, steps: 1, nextButton: 'Continue', statusKey: 'connectionStatus'},
  {id: 1, label: 'Planning', component: <Planning/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: true, steps: 3, nextButton: 'Continue to Installation Options', statusKey: 'planningStatus'},
  {id: 2, label: 'Installation Type', component: <InstallationType/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: false, steps: 1, nextButton: 'Continue to Components Installation', statusKey: 'installationTypeStatus'},
  {id: 3, label: 'Initialization', component: <Initialization/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, subStages: [
    {id: 0, label: 'Installation', component: <Installation/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Network Setup',  statusKey: 'datasetInstallationStatus'},
    {id: 1, label: 'Networking', component: <Networking/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to APF Auth Setup', statusKey: 'networkingStatus'},
    {id: 2, label: 'APF Auth', component: <InitApfAuth/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Security Setup', statusKey: 'apfAuthStatus'},
    {id: 3, label: 'Security', component: <Security/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Certificates Setup', statusKey: 'securityStatus'},
    {id: 4, label: 'Certificates', component: <Certificates/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Launch Setup', statusKey: 'certificateStatus'},
    {id: 5, label: 'Launch Config', component: <LaunchConfig/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Instance Setup', statusKey: 'launchConfigStatus'},
  ], nextButton: 'Review', statusKey: 'initializationStatus'},
  {id: 4, label: 'Review Installation', component: <ReviewInstallation/>, hasJCL: false, isSkippable: false, hasOutput: false, steps: 1, nextButton: 'Finish Installation', statusKey: 'reviewStatus'},
  {id: 5, label: 'Finish Installation', component: <FinishInstallation/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: false, steps: 1, statusKey: 'finishStatus'},
]

const tempStages = getWizardStages();
stages = tempStages ? tempStages : stages;

export {stages};

const Wizard = ({initialization}: {initialization: boolean}) => {
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