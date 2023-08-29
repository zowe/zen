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
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import jsonFormTheme from '../../jsonFormsTheme';

const makeUISchema = (schema: any, base: string, formData: any): any => {
  const properties = Object.keys(schema.properties);

  const elements = properties.map((prop: any) => {
    if (schema.properties[prop].type === 'object') {

      if(schema.properties[prop].if) {
        console.log("We have if else");
      }

      if(formData && formData.type && ((formData.type != 'PKCS12' && prop == 'pkcs12') || (formData.type == 'PKCS12' && prop == 'keyring'))) {
        return {
          type: 'Group',
          label: `\n${prop}`,
          rule: {
            effect: "HIDE",
            condition: {}
          },
        };
      }

      const subSchema = schema.properties[prop];
      const subProperties = Object.keys(subSchema.properties);
      const schemaDescription = subSchema.description;

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
      const labelContent = getLabelContent(prop, schemaDescription);
      return {
        type: 'Group',
        label: `${prop}`,
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

const getLabelContent = (prop: string, propDescription: string) => {
  const style = (<Typography variant="subtitle1">
    <strong>{prop}</strong>
    {propDescription && (
      <>
        <br />
        <Typography variant="body2" component="span">
          {propDescription}
        </Typography>
      </>
    )}
  </Typography>)

  return style;
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
