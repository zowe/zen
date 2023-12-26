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

const stages = [
  {id: 0, label: 'Connection', component: <Connection/>, nextButton: 'Continue'},
  {id: 1, label: 'Planning', component: <Planning/>, nextButton: 'Continue to installation options'},
  {id: 2, label: 'Installation Type', component: <InstallationType/>, nextButton: 'Continue to components installation'},
  // {id: 3, label: 'Installation', component: <Installation/>, nextButton: 'Continue to zowe Security'},
  // {id: 4, label: 'Security', component: <Security/>, nextButton: 'Continue to certificates setup'},
  // {id: 5, label: 'Certificates', component: <Certificates/>, nextButton: 'Continue to instance setup'},
  {id: 6, label: 'Initialization', component: <Initialization/>, subStages: [
    {id: 0, label: 'Installation', component: <Installation/>, nextButton: 'Continue to security setup'},
    {id: 1, label: 'Security', component: <Security/>, nextButton: 'Continue to certificates setup'},
    {id: 2, label: 'Certificates', component: <Certificates/>, nextButton: 'Continue to instance setup'},
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