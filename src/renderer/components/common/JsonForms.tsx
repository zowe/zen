/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useEffect, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { ThemeProvider } from '@mui/material/styles';
import jsonFormTheme from '../../jsonFormsTheme';
import { Tabs, Tab, Box } from '@mui/material';

// Handle `oneOf` schemas
const getActiveSchema = (schemas: any[], data: any) => {
  for (const schema of schemas) {
    if (isValidSchema(schema, data)) {
      return schema;
    }
  }
  return null;
};

const isValidSchema = (schema: any, data: any): boolean => {
  // Check if the data matches the schema requirements
  const requiredFields = schema.required || [];
  return requiredFields.every((field: string) => data[field] !== undefined);
};

// To handle the "if", "else", and "then" in the schema
const conditionalSchema = (schema: any, formData: any, prop: any): boolean=> {
  if(schema.if && schema.then && schema.else){
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
  return false;
}

// Creates a basic input element in the UI schema
const createControl = (scope: string) => ({
  type: 'Control',
  scope, // Scope specifies the JSON path
});

// createGroup generates a group object, used to group together multiple form elements - can optionally include a rule (like visibility)
const createGroup = (label: string, elements: any[], rule?: any) => ({
  type: 'Group',
  label: `\n${label}`,
  elements: elements || [],
  ...(rule && {rule}),
});

// createVerticalLayout generates a layout object that arranges its child elements vertically.
const createVerticalLayout = (elements: any[]) => ({
  type: 'VerticalLayout',
  elements,
});

// Same as above, but arranges its child elements horizontally.
const createHorizontalLayout = (elements: any[]) => ({
  type: 'HorizontalLayout',
  elements,
});

const getDefaultFormData = (schema: any, formData: any) => {
  if (schema && schema.properties) {
    const defaultFormData = { ...formData };
    Object.keys(schema.properties).forEach((property) => {
      if (schema.properties[property].type && schema.properties[property].default !== undefined || schema.properties[property].type === 'object') {
        // If the property is an object, recursively set default values
        if (schema.properties[property].type === 'object') {
          defaultFormData[property] = getDefaultFormData(
            schema.properties[property],
            defaultFormData[property] || {}
          );
        } else {
          defaultFormData[property] = schema.properties[property].default;
        }
      }
    });
    return defaultFormData;
  }
  return null;
};

const makeUISchema = (schema: any, base: string, formData: any): any => {
  if (!schema || !formData) {
    return "";
  }

  const activeSchema = schema.oneOf ? getActiveSchema(schema.oneOf, formData) : schema;

  if (!activeSchema) {
    console.error('No valid schema found');
    return "";
  }

  const properties = activeSchema?.properties ? Object.keys(activeSchema.properties) : [];

  // Map each property in the JSON schema to an appropriate UI element based on its type and structure.
  const elements = properties.map((prop: any) => {
    if (activeSchema.properties[prop]?.type && activeSchema.properties[prop].type === 'object') {
      // Create a group with a hide rule if patternProperties are present or conditional hiding is required
      if (activeSchema.properties[prop].patternProperties || (activeSchema.if && conditionalSchema(activeSchema, formData, prop))) {
        return createGroup(prop, [], {
          effect: "HIDE",
          condition: {}
        });
      }

      // For objects, iterate through their properties to create controls and group them if needed
      const subSchema = activeSchema.properties[prop];
      const groupedControls: any = [];
      let row: any = [];

      if (subSchema && subSchema.properties) {
        const subProperties = Object.keys(subSchema.properties);
        subProperties.forEach((subProp, index) => {
          row.push(createControl(`#/properties${base}${prop}/properties/${subProp}`));

          if (row.length === 2 || (row.length === 1 && index === subProperties.length - 1)) {
            groupedControls.push(createHorizontalLayout(row));
            row = [];
          }
        });
      }

      return createGroup(prop, [
        createVerticalLayout(groupedControls)
      ]);
    } else {
      return createControl(`#/properties${base}${prop}`);
    }
  });

  return createVerticalLayout(elements); // Return whole structure
}

export default function JsonForm(props: any) {
  const {schema, onChange, formData} = props;

  const isFormDataEmpty = formData === null || formData === undefined;

  useEffect(() => {
    if (isFormDataEmpty) {
      const defaultFormData = getDefaultFormData(schema, formData);
      onChange(defaultFormData);
    }
  }, [isFormDataEmpty, schema, onChange]);

  // const [formState, setFormState] = useState(isFormDataEmpty ? getDefaultFormData(schema, {}) : formData);

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