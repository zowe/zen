import { createTheme } from '@mui/material/styles';

const jsonFormTheme = createTheme({
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
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          display: 'flex',
          justifyContent: 'center',
        },
        container: {
          background: 'whiteSmoke',
          height: '50%',
          width: '30%',
          marginTop: '10%',
          border: '2px solid grey',
          borderRadius: '20px'
        }
      }
    },

  },
});

export default jsonFormTheme;