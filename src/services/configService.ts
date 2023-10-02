import { flatten, unflatten } from 'flat';

// To set the subsection of the configuration
export const setConfiguration = (section: string, data: any) => {
  if(!data) {
    return;
  }
  const flattenedConfig = flatten(data);
  localStorage.setItem(section+ 'Config', JSON.stringify(flattenedConfig));

  // Updating zowe.yaml
  const zoweSection = 'zowe';
  let storedZoweConfig = localStorage.getItem(zoweSection + 'Config');
  if (!storedZoweConfig) {
    return;
  }

  // Parse the stored configuration from JSON
  storedZoweConfig = JSON.parse(storedZoweConfig);
  const zoweConfig: any = unflatten(storedZoweConfig)
  
  if (zoweConfig && zoweConfig.zowe && zoweConfig.zowe.setup) {
    zoweConfig.zowe.setup[section] = data;
    const flattenedZoweConfig = flatten(zoweConfig);
    localStorage.setItem('zoweConfig', JSON.stringify(flattenedZoweConfig));
  }
}

// To get the subsection of the configuration
export const getConfiguration = (section: string,) => {
  let flattenedStoredConfig;
  let config;
  const storedConfig = localStorage.getItem(section+ 'Config');
  if(storedConfig) {
    flattenedStoredConfig = storedConfig ? JSON.parse(storedConfig) : {};
    config = unflatten(flattenedStoredConfig);
  } else {
    config = {};
  }
  return config;
}

// To set the entire zowe configuration
export const setZoweConfig = (data: any) => {
  const section = 'zowe';
  if(!data) {
    return;
  }
  const flattenedConfig = flatten(data);
  localStorage.setItem(section+ 'Config', JSON.stringify(flattenedConfig));
}

// To get the entire zowe configuration
export const getZoweConfig = () => {
  const section = 'zowe';
  let flattenedStoredConfig;
  let config;
  const storedConfig = localStorage.getItem(section+ 'Config');
  if(storedConfig) {
    flattenedStoredConfig = storedConfig ? JSON.parse(storedConfig) : {};
    config = unflatten(flattenedStoredConfig);
  }
  return config;
}