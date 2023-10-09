/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { flatten, unflatten } from 'flat';

export const setConfiguration = (section: string, data: any) => {
  if(!data) {
    return;
  }
  const flattenedConfig = flatten(data);
  localStorage.setItem(section+ 'Config', JSON.stringify(flattenedConfig));
}

export const getConfiguration = (section: string,) => {
  let flattenedStoredConfig;
  let config;
  const storedConfig = localStorage.getItem(section+ 'Config');
  if(storedConfig) {
    flattenedStoredConfig = storedConfig ? JSON.parse(storedConfig) : {};
    config = unflatten(flattenedStoredConfig);
  } else {
    config = {};
  }
  return config;
}
