/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React from "react";
import './global.css';
import { createRoot } from 'react-dom/client';
import { store } from './store'
import { Provider } from 'react-redux'
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/Home";
import Wizard from './components/wizard/Wizard';
import Header from './components/Header';
import theme from './theme';
import { ThemeProvider } from '@mui/material/styles';

// TODO:  Support of Zowe Configuration and Saved Installation actions.
//        - Add and use state saving
//        - Implement previos installtaion installation parts
//        BE validation of fields
//        Create help component
//        Add localization support
//        Get rid of routing

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Header/>}>
              <Route index element={<Home />} />
              <Route path="wizard" element={<Wizard/>}/>  
            </Route>
            <Route path="*" element={<Home />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

const container = document.getElementById('zen-root-container');
const root = createRoot(container!);

root.render(<React.StrictMode><App/></React.StrictMode>);
