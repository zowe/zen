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

// Create a Tabbed Layout for `oneOf` schemas
const createTabbedLayout = (schemas: any[], formData: any) => {
  const tabElements = schemas.map((schema: any, index: number) => {
    const title = schema.title || `Schema ${index + 1}`; // Use schema title if available, else default
    const uiSchema = makeUISchema(schema, '/', formData); // Generate UI schema for each schema
    return (
      <TabPanel key={index} value={index}>
        <JsonForms
          schema={schema}
          uischema={uiSchema}
          data={formData}
          renderers={materialRenderers}
          cells={materialCells}
          config={{ showUnfocusedDescription: true }}
          onChange={({ data, errors }) => { onChange(data) }}
        />
      </TabPanel>
    );
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={0} aria-label="schema tabs">
        {schemas.map((schema, index) => (
          <Tab key={index} label={schema.title || `Schema ${index + 1}`} />
        ))}
      </Tabs>
      {tabElements}
    </Box>
  );
};

// Create a TabPanel component to display tab contents
const TabPanel = (props: { value: number, index: number, children: React.ReactNode }) => {
  const { value, index, children } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};
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

const makeUISchema = (schema: any, base: string, formData: any): any => {
  if (!schema || !formData) {
    return "";
  }

  // Handle `oneOf` schemas by generating a tabbed layout
  if (schema.oneOf) {
    return createTabbedLayout(schema.oneOf, formData);
  }

  const properties = schema?.properties ? Object.keys(schema.properties) : [];

  // Map each property in the JSON schema to an appropriate UI element based on its type and structure.
  const elements = properties.map((prop: any) => {
    if (schema.properties[prop]?.type && schema.properties[prop].type === 'object') {
      // Create a group with a hide rule if patternProperties are present or conditional hiding is required.
      if (schema.properties[prop].patternProperties || (schema.if && conditionalSchema(schema, formData, prop))) {
        return createGroup(prop, [], {
          effect: "HIDE",
          condition: {}
        });
      }

      // For objects, iterate through their properties to create controls and group them if needed.
      const subSchema = schema.properties[prop];
      const groupedControls: any = [];
      let row: any = [];

      if (subSchema && subSchema.properties) { // If the object has its own properties, create controls for them and organize into layouts.
        const subProperties = Object.keys(subSchema?.properties);
        subProperties.forEach((subProp, index) => {
          row.push(createControl(`#/properties${base}${prop}/properties/${subProp}`)); // Create a control for each sub-property.

          // Group controls into horizontal layouts for visual arrangement, resetting the row after adding.
          if (row.length === 2 || (row.length === 1 && index === subProperties.length - 1)) {
            groupedControls.push(createHorizontalLayout(row));
            row = [];
          }
        });
      }

      return createGroup(prop, [ // Return a group containing a vertical layout of the organized controls for the object.
        createVerticalLayout(groupedControls)
      ]);
    } else { // For simple properties, create a basic control.
      return createControl(`#/properties${base}${prop}`);
    }
  });

  return createVerticalLayout(elements); // Return whole structure
}

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

export default function JsonForm(props: any) {
  const {schema, onChange, formData} = props;

  const isFormDataEmpty = formData === null || formData === undefined;

  useEffect(() => {
    if (isFormDataEmpty) {
      const defaultFormData = getDefaultFormData(schema, formData);
      onChange(defaultFormData);
    }
  }, [isFormDataEmpty, schema, onChange]);

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