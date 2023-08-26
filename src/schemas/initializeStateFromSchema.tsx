import React, { useState } from 'react';
import { zoweSchema } from './zoweYamlSchema';


export const initializeStateFromSchema = (section: string) => {
  const initialState: any = {};
  const propertySchema = zoweSchema.properties.zowe.properties.setup.properties;
  const properties = Object.keys(propertySchema);
  if(!(properties.includes(section))) {
    return initialState;
  }
  
  return traverseSchema(propertySchema);
}
  
const traverseSchema = (propertySchema: any) => {
  const initialState: any = {};
  for (const key in propertySchema) {
    const property = propertySchema[key];

    if (property.type === 'object') {
      initialState[key] = traverseSchema(property);
    } else {
      initialState[key] = property.default || '';
    }
  }
  return initialState;
}