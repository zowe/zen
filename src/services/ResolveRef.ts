import { IResponse } from "../types/interfaces";

export const updateSchemaReferences = (readPaxYamlAndSchema: any, schema: any): void => {

  const schemaArray = Object.keys(readPaxYamlAndSchema);
  const schemaMap: {[key: string]: any} = {};

  schemaArray.forEach(key => {
    const value = readPaxYamlAndSchema[key];
    try {
      const schemaObject = JSON.parse(value);
      const id = schemaObject?.$id;
      if(id) {
        schemaMap[id] = schemaObject;
      }
    } catch(error: any) {
      console.error(`Error parsing schema for key ${key}:`, error.message);
    }
  });

  traverseAndUpdate(schema, schemaMap);
}

const traverseAndUpdate = (node: any, schemaMap: any) => {
  if (node !== null && typeof node === "object") {
    for (const key in node) {
      if (key === "$ref" && typeof node[key] === "string") {
        try {
          const refValue = resolveRef(node[key], schemaMap);
          Object.assign(node, refValue);
          delete node['$ref'];
        } catch(error){
          console.error("Error resolving reference:", error.message);
        }
      } else {
        traverseAndUpdate(node[key], schemaMap);
      }
    }
  }
}

const resolveRef = (ref: string, schemaMap: any) => {
  const [refPath, anchor] = ref.split('#');
  const refSchemaKey = Object.keys(schemaMap).find((id: string) => id.endsWith(refPath));

  if(!refSchemaKey) {
    throw new Error(`Schema for reference path ${refPath} not found`);
  }

  const refSchema = schemaMap[refSchemaKey];
  const refObject = Object.values(refSchema.$defs).find((obj:any) => obj.$anchor === anchor);

  if (!refObject) {
    throw new Error(`Reference ${ref} not found in schema ${refSchema.$id}`);
  }

  return refObject;
}