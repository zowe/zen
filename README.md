# ZEN - Zowe Server Install Wizard

Zowe Server Install Wizard is an Electron-based tool that provides a simpler UI to install and configure Zowe

The application is in the development stage and has limited functionality so far. It is able to connect to the mainframe using the [zos-node-accessor](https://github.com/IBM/zos-node-accessor) module, perform some basic environment validations, download the Zowe convenience build, and run `zwe install` command by submitting JES jobs. [Here](https://github.com/zowe/zen/issues/1) is a brief description with screenshots.

### Prerequisites

Node version 18.12 or higher is required.

### Developing

Note: `npm run start` may succeed without errors, but `npm run make` will not. It is always advised to run `npm run make` after writing new code, or using the build automation to view errors

Run `npm install` to install dependencies 

Run `npm run start` to run the application locally

Run `npm run make` to package and make platform-specific distributable

