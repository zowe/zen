/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new MonacoWebpackPlugin({
    languages: ['yaml'],
    customLanguages: [
      {
        label: 'yaml',
        entry: 'monaco-yaml',
        worker: {
          id: 'monaco-yaml/yamlWorker',
          entry: 'monaco-yaml/yaml.worker'
        }
      }
    ]
  })
];
