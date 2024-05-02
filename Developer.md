# ZEN - Zowe Enterprise Necessity

### Introduction

This document serves as a guide for developers contributing to the project. It outlines the use of local storage for storing the state of each stage in the application.


### Local Storage Usage

We utilize local storage to maintain the state of various stages within the application. This allows us to persist user progress across sessions.

### Storage Keys

The following keys are used to store the progress of each stage:
`progressStateKey`: Stores the progress state.
`activeStateKey`: Stores the active state.
`planningStateKey`: Stores the planning stage.
`installationTypeKey`: Stores the installation type.
`datasetInstallationKey`: Stores the dataset installation.
`apfAuthKey`: Stores the APF authentication state.
`securityKey`: Stores the security initialization.
`certificateKey`: Stores the certificate initialization.

### Key Naming Convention

To ensure uniqueness and traceability, we append both the machine ID and the user ID to each key. For example:
`stage_progress_rs28_ts3800`: Represents the progress state for machine rs28 and user ts3800.