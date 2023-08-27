import React, { useState, useEffect } from 'react';
import { flatten, unflatten } from 'flat';

export const setConfiguration = (section: string, data: any) => {
  if(!data) {
    return;
  }
  const flattenedConfig = flatten(data);
  localStorage.setItem(section+ 'Config', JSON.stringify(flattenedConfig));
}

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