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
import { ajv } from './Utils';


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

  const properties = schema?.properties ? Object.keys(schema.properties) : [];

  // Map each property in the JSON schema to an appropriate UI element based on its type and structure.
  const elements = properties.map((prop: any) => {
    if (schema.properties[prop]?.type && schema.properties[prop].type === 'object') {
      // Create a group with a hide rule if patternProperties are present or conditional hiding is required
      if (schema.properties[prop].patternProperties || (schema.if && conditionalSchema(schema, formData, prop))) {
        return createGroup(prop, [], {
          effect: "HIDE",
          condition: {}
        });
      }

      // For objects, iterate through their properties to create controls and group them if needed
      const subSchema = schema.properties[prop];
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

// Function to filter form data based on the schema
const filterFormData = (data: { [key: string]: any }, schema: any) => {
  const filteredData: { [key: string]: any } = {};
  const schemaProperties = schema.properties || {};

  Object.keys(data).forEach(key => {
    if (key in schemaProperties) {
      filteredData[key] = data[key];
    }
  });

  return filteredData;
};

// Function to find the matching schema for the form data
const findMatchingSchemaIndex = (formData: any, oneOfSchemas: any) => {
  for (let i = 0; i < oneOfSchemas.length; i++) {
    const subSchema = oneOfSchemas[i];
    const filteredData = filterFormData(formData, subSchema);
    if (JSON.stringify(filteredData) === JSON.stringify(formData)) {
      return i;
    }
  }
  return 0; // Default to the first schema if no match is found
};

const TabPanel = (props: { children?: React.ReactNode; index: number; value: number; }) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{padding: '25px'}}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default function JsonForm(props: any) {
  const {schema, onChange, formData} = props;
  const [tabIndex, setTabIndex] = useState(0);
  const [schemaUpdatedOnClick, setSchemaUpdatedOnClick] = useState(false);
  const [validateSchema, setValidate] = useState(()=> ajv.compile(schema))

  const isFormDataEmpty = formData === null || formData === undefined;

  useEffect(() => {
    if (isFormDataEmpty) {
      const defaultFormData = getDefaultFormData(schema, formData);
      onChange(defaultFormData);
    }
  }, [isFormDataEmpty, schema, onChange]);

  useEffect(() => {
    if (schema.oneOf) {
      const matchingIndex = findMatchingSchemaIndex(formData, schema.oneOf);
      setTabIndex(matchingIndex);
      setValidate(() => ajv.compile(schema.oneOf[tabIndex]));
    }
  }, [])

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSchemaUpdatedOnClick(true);
    setTabIndex(newValue);
    const selectedSchema = schema.oneOf[newValue];
    const filteredData = filterFormData(formData, selectedSchema);
    setValidate(() => ajv.compile(schema.oneOf[tabIndex]));
    onChange(filteredData, newValue);
  };

  const renderTabs = () => {
    if (schema.oneOf) {
      return (
        <>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="schema tabs">
            {schema.oneOf.map((subSchema: any, index: number) => (
              <Tab key={index} label={`Schema ${index + 1}`} />
            ))}
          </Tabs>
          {schema.oneOf.map((subSchema: any, index: number) => (
            <TabPanel key={index} value={tabIndex} index={index}>
              <JsonForms
                schema={subSchema}
                uischema={makeUISchema(subSchema, '/', formData)}
                data={formData}
                renderers={materialRenderers}
                cells={materialCells}
                config={{showUnfocusedDescription: true}}
                onChange={({ data, errors }) => { onChange(data) }}
              />
            </TabPanel>
          ))}
        </>
      );
    } else {
      return (
        <JsonForms
          schema={schema}
          uischema={makeUISchema(schema, '/', formData)}
          data={formData}
          renderers={materialRenderers}
          cells={materialCells}
          config={{showUnfocusedDescription: true}}
          onChange={({ data, errors }) => { onChange(data) }}
        />
      );
    }
  };

  return (
    <ThemeProvider theme={jsonFormTheme}>
      {renderTabs()}
    </ThemeProvider>
  );
}