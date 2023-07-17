/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          paddingBottom: "18px",
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
        },
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          paddingBottom: "0px",
        },
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          minWidth: "40ch",
          maxWidth: "40ch",
        },
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: '4ch',
        },
      },
    },
  },
});

export default theme;