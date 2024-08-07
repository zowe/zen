/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

export const validateDatasetIterator = (schema: any) : { isValid: boolean, key: string } => {
  for (const key of Object.keys(schema)) {
    let value = schema[key];
    if (typeof value === 'object' && value !== null) {
      const result = validateDatasetIterator(value);
      if(!result.isValid) {
        return {isValid: false, key: key};
      }
    } else if(!isDatasetValid(value)) {
      return {isValid: false, key: key};
    }
  }
  return {isValid: true, key: ''};
}

export const isDatasetValid = (dsName: string) : boolean => {
  const DsNamePattern = "^[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,21}$";
  const regEx = new RegExp(DsNamePattern);
  return regEx.test(dsName);
}