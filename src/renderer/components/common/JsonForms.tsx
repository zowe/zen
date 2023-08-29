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

const customTheme = createTheme({
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          display: 'inline-flex',
          alignItems: 'center',
        },
        fullWidth: {
          width: '70%',
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 0,
        }
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingLeft: 0,
          fontWeight: 'normal',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 0,
          marginLeft: '-20px',
          background: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          verticalAlign: 'middle'
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          fontFamily: 'Courier New, monospace',
          fontSize: '5px',
          marginTop: '5px',
          marginBottom: '-20px',
          paddingLeft: '16px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingLeft: '20px',
          paddingBottom: '0px',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: '100%',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          background: 'white',
          marginLeft: '15px',
          paddingLeft: '5px'
        }
      }
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBottom: '10px',
        }
      }
    }
  },
});

const makeUISchema = (schema: any, base: string, formData: any): any => {
  const properties = Object.keys(schema.properties);
  let ifProp: string, ifPropValue: string, thenProp: string, elseProp: string

  if(schema.if) {
    ifProp = Object.keys(schema.if.properties)[0];
    ifPropValue = schema.if.properties[ifProp].const.toLowerCase();
    thenProp = schema.then.required[0].toLowerCase();
    elseProp = schema.else.required[0].toLowerCase();
  }

  const elements = properties.map((prop: any) => {
    if (schema.properties[prop].type === 'object') {
      if(schema.if) {

        // Handling the conditions for the "if", "else" and "then" in the schema
        if(formData && Object.keys(formData).includes(ifProp)) {
          const formDataPropValue = formData[ifProp].toLowerCase();

          if( (formDataPropValue == ifPropValue && prop == elseProp) || (formDataPropValue != ifPropValue && prop == thenProp) ) {
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


export default function JsonForm(props: any) {
  const {schema, onChange, formData} = props;

  return (
    <ThemeProvider theme={customTheme}>
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
