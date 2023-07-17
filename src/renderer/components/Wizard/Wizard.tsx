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
import Configuration from "../stages/Configuration";
import Certificates from "../stages/Certificates";
import Initialization from "../stages/Initialization";
import spock from '../../assets/spock.svg'
import { selectLoading } from './wizardSlice';
import { useAppSelector } from '../../hooks';

const stages = [
  {id: 0, label: 'Connection', component: <Connection/>, nextButton: 'Continue'},
  {id: 1, label: 'Planning', component: <Planning/>, nextButton: 'Continue to components installation'}, // Describe prereqs, address requirements
  {id: 2, label: 'Installation', component: <Installation/>, nextButton: 'Continue to system configuration'}, // Get download location, fill in zowe.setup.dataset
  {id: 3, label: 'Configuration', component: <Configuration/>, nextButton: 'Continue to certificates setup'},
  {id: 4, label: 'Certificates', component: <Certificates/>, nextButton: 'Continue to instance setup'},
  {id: 6, label: 'Initialization', component: <Initialization/>, nextButton: <div style={{display: 'flex', alignItems: 'center'}}><img style={{width: '18px', height: '18px', paddingRight: '12px'}} src={spock}/>Live long and prosper</div>},
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