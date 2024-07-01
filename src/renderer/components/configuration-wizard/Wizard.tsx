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
import Stcs from "../stages/Stcs";
import Certificates from "../stages/Certificates";
import Initialization from "../stages/Initialization";
import ReviewInstallation from '../stages/ReviewInstallation';
import FinishInstallation from '../stages/FinishInstallation';
import InstallationType from '../stages/installation/InstallTypeSelection';
import { selectLoading } from './wizardSlice';
import { useAppSelector } from '../../hooks';
import InitApfAuth from '../stages/InitApfAuth';
import Networking from '../stages/Networking';
import Vsam from '../stages/Vsam';
import LaunchConfig from '../stages/LaunchConfig';
import { getProgress } from '../stages/progress/StageProgressStatus';
import Unpax from '../stages/Unpax';
import { APF_AUTH_STAGE_LABEL, CERTIFICATES_STAGE_LABEL, CONNECTION_STAGE_LABEL, FINISH_INSTALL_STAGE_LABEL, INIT_STAGE_LABEL, INSTALLATION_TYPE_STAGE_LABEL, INSTALL_STAGE_LABEL, LAUNCH_CONFIG_STAGE_LABEL, NETWORKING_STAGE_LABEL, PLANNING_STAGE_LABEL, REVIEW_INSTALL_STAGE_LABEL, SECURITY_STAGE_LABEL, UNPAX_STAGE_LABEL, VSAM_STAGE_LABEL } from '../common/Utils';

const mvsDatasetInitProgress = getProgress('datasetInstallationStatus');

export const stages = [
  {id: 0, label: CONNECTION_STAGE_LABEL, component: <Connection/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: false, steps: 1, nextButton: 'Continue', statusKey: 'connectionStatus'},
  {id: 1, label: PLANNING_STAGE_LABEL, component: <Planning/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: true, steps: 3, nextButton: 'Continue to Installation Options', statusKey: 'planningStatus'},
  {id: 2, label: INSTALLATION_TYPE_STAGE_LABEL, component: <InstallationType/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: false, steps: 1, nextButton: "Continue to Unpax", statusKey: 'installationTypeStatus'},
  {id: 3, label: UNPAX_STAGE_LABEL, component: <Unpax/>, hasJCL: false, isSkippable: true, isSkipped: false, hasOutput: false, steps: 1, nextButton: 'Continue to Components Installation', statusKey: 'downloadUnpaxStatus'},
  {id: 4, label: INIT_STAGE_LABEL, component: <Initialization/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, subStages: [
    {id: 0, label: INSTALL_STAGE_LABEL, component: <Installation/>, hasJCL: true, isSkippable: mvsDatasetInitProgress ?? false, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Network Setup',  statusKey: 'datasetInstallationStatus'},
    {id: 1, label: NETWORKING_STAGE_LABEL, component: <Networking/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to APF Auth Setup', statusKey: 'networkingStatus'},
    {id: 2, label: APF_AUTH_STAGE_LABEL, component: <InitApfAuth/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Security Setup', statusKey: 'apfAuthStatus'},
    {id: 3, label: SECURITY_STAGE_LABEL, component: <Security/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to STC Setup', statusKey: 'securityStatus'},
    {id: 4, label: 'Stcs', component: <Stcs/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Certificates Setup', statusKey: 'stcsStatus'},
    {id: 5, label: CERTIFICATES_STAGE_LABEL, component: <Certificates/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Vsam Setup', statusKey: 'certificateStatus'},
    {id: 6, label: VSAM_STAGE_LABEL, component: <Vsam/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Launch Setup', statusKey: 'vsamStatus'},
    {id: 7, label: LAUNCH_CONFIG_STAGE_LABEL, component: <LaunchConfig/>, hasJCL: true, isSkippable: true, isSkipped: false, hasYaml: true, hasOutput: true, steps: 1, nextButton: 'Continue to Instance Setup', statusKey: 'launchConfigStatus'},
  ], nextButton: 'Review', statusKey: 'initializationStatus'},
  {id: 5, label: REVIEW_INSTALL_STAGE_LABEL, component: <ReviewInstallation/>, hasJCL: false, isSkippable: false, hasOutput: false, steps: 1, nextButton: 'Finish Installation', statusKey: 'reviewStatus'},
  {id: 6, label: FINISH_INSTALL_STAGE_LABEL, component: <FinishInstallation/>, hasJCL: false, isSkippable: false, isSkipped: false, hasOutput: false, steps: 1, statusKey: 'finishStatus'},
]

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