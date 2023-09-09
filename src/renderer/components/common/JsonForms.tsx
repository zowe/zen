/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import {materialRenderers, materialCells} from '@jsonforms/material-renderers';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import jsonFormTheme from '../../jsonFormsTheme';

const makeUISchema = (schema: any, base: string, formData: any): any => {
  const properties = Object.keys(schema.properties);

  const elements = properties.map((prop: any) => {
    if (schema.properties[prop].type === 'object') {

      if(schema.if) {
        const hideProperty = conditionalSchema(schema, formData, prop);
        if(hideProperty) {
          return {
            type: 'Group',
            label: `\n${prop}`,
            rule: {
              effect: "HIDE",
              condition: {}
            },
          };
        }
      }

      const subSchema = schema.properties[prop];
      const subProperties = Object.keys(subSchema.properties);

      const subElements = subProperties.map((subProp: any) => ({
        type: 'Control',
        scope: `#/properties${base}${prop}/properties/${subProp}`,
      }));

      const groupedControls = [];
      let row = [];

      for (let i = 0; i < subElements.length; i++) {
        row.push(subElements[i]);

        if (row.length === 2 || (row.length === 1 && i === subElements.length - 1)) {
          groupedControls.push({
            type: 'HorizontalLayout',
            elements: row,
          });
          row = [];
        }
      }

      return {
        type: 'Group',
        label: `\n${prop}`,
        elements: [
          {
            type: 'VerticalLayout',
            elements: groupedControls,
          },
        ],
      };
    } else {
      return {
        "type": "Control",
        "scope": `#/properties${base}${prop}`
      }
    }
  });
  return { 
    "type": "VerticalLayout",
    "elements": elements
  };
}

// To handle the "if", "else", and "then" in the schema
const conditionalSchema = (schema: any, formData: any, prop: any): boolean=> {
  const ifProp = Object.keys(schema.if.properties)[0];
  const ifPropValue = schema.if.properties[ifProp].const.toLowerCase();
  const thenProp = schema.then.required[0].toLowerCase();
  const elseProp = schema.else.required[0].toLowerCase();

  if(formData && formData[ifProp]) {
    const formDataPropValue = formData[ifProp].toLowerCase();
    if( (formDataPropValue == ifPropValue && prop == elseProp) || (formDataPropValue != ifPropValue && prop == thenProp) ) {
      return true;
    }
  }
  return false;
}

export default function JsonForm(props: any) {
  const {schema, onChange, formData} = props;

  return (
    <ThemeProvider theme={jsonFormTheme}>
    <JsonForms
      schema={schema}
      uischema={makeUISchema(schema, '/', formData)}
      data={formData}
      renderers={materialRenderers}
      cells={materialCells}
      config={{showUnfocusedDescription: true}}
      onChange={({ data, errors }) => { onChange(data) }}
    />
    </ThemeProvider>
  );
}