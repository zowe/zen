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
import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const customStyles = `
  .custom-dropdown-list {
    background-color: yellow;
    position: absolute;
    color: red;
    top: 100%;
    width: 100%;
    z-index: 1000;
  }
`;

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
        },
      },
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
          marginTop: '15px',
          marginBottom: '-20px',
          paddingLeft: '16px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingLeft: '20px',
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
  },
});

// REVIEW: Flatten the schema UI or find out how to keep structure

const makeUISchema = (schema: any, base: string): any => {
  const properties = Object.keys(schema.properties);
  const elements = properties.map((p: any) => {
    if (schema.properties[p].type === 'object') {
      const subSchema = schema.properties[p];
      const subProperties = Object.keys(subSchema.properties);

      const subElements = subProperties.map((sp: any) => ({
        type: 'Control',
        scope: `#/properties${base}${p}/properties/${sp}`,
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
        label: `\n${p}:`,
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
        "scope": `#/properties${base}${p}`
      }
    }
  });
  return { 
    "type": "VerticalLayout",
    "elements": elements
  };
}

export default function JsonForm(props: any) {
  const {schema, initialdata, onChange} = props;
  // const [data, setData] = useState(initialdata);
  return (
    <ThemeProvider theme={customTheme}>
    <JsonForms
      schema={schema}
      uischema={makeUISchema(schema, '/')}
      data={initialdata}
      renderers={materialRenderers}
      cells={materialCells}
      config={{showUnfocusedDescription: true}}
      onChange={({ data, errors }) => {
        // console.log(data);
        // setData(data);
        onChange(data);
      }}
    />
    </ThemeProvider>
  );
}