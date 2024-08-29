let mainSchema: any;
let schemaMap: { [key: string]: any } = {};

export const updateSchemaReferences = (schemas: { [key: string]: string }, schemaObject: any): void => {
  schemaMap = parseSchemas(schemas);

  // Traverse and resolve references in schemas other than zowe-yaml schema
  Object.values(schemaMap).forEach((schema: any) => {
    if(schema?.$id !== schemaObject?.$id) {
      mainSchema = schema;
      traverseAndResolveReferences(schema);
    }
  })

  // Traverse and resolve references for the zowe-yaml schema
  mainSchema = schemaObject;
  traverseAndResolveReferences(schemaObject);
}

// Parses all schemas and populates the schemaMap
const parseSchemas = (schemas: { [key: string]: string }): { [key: string]: any } => {
  const schemaMap: { [key: string]: any } = {};
  Object.entries(schemas).forEach(([key, value]) => {
    try {
      const schemaObject = JSON.parse(value);
      const id = schemaObject?.$id;
      if (id) {
        schemaMap[id] = schemaObject;
      }
    } catch (error: any) {
      console.error(`Unable to parse schema for key ${key}:`, error.message);
    }
  });
  return schemaMap;
};

// Recursively traverse and resolve $ref references in the schema object
const traverseAndResolveReferences = (schemaObj: any) => {
  if (schemaObj && typeof schemaObj === "object") {
    Object.keys(schemaObj).forEach((key) => {
      if (key === "$ref" && typeof schemaObj[key] === "string") {
        try {
          const refValue = resolveRef(schemaObj[key]);
          Object.assign(schemaObj, refValue);
          delete schemaObj['$ref'];
        } catch(error){
          console.error("Error resolving reference:", error.message);
        }
      } else {
        traverseAndResolveReferences(schemaObj[key]);
      }
    })
  }
}

// Resolve a $ref string to its referenced schema object
const resolveRef = (ref: string) => {
  let [refPath, anchorPart] = ref.split('#');
  const isRefPathEmpty = !refPath;

  let refSchema = isRefPathEmpty
    ? mainSchema
    : schemaMap[Object.keys(schemaMap).find((id) => id.endsWith(refPath))];

  if (!refSchema) {
    throw new Error(`Schema for reference path ${refPath} not found`);
  }

  if (!refSchema.$defs) {
    throw new Error(`No $defs found in schema ${refSchema.$id}`);
  }

  const anchor = anchorPart?.split("/").pop();
  const refObject = isRefPathEmpty
    ? refSchema.$defs[anchor]
    : Object.values(refSchema.$defs).find((obj:any) => obj.$anchor === anchor);

  if (!refObject) {
    throw new Error(`Reference ${ref} not found in schemaObject ${refSchema.$id}`);
  }

  // Ensure pattern is a string and remove backslashes for ajv compatibility
  if (refObject.pattern) {
    const pattern = typeof refObject.pattern === 'string' ? refObject.pattern : String(refObject.pattern);

    if (pattern.includes("\\")) {
      refObject.pattern = pattern.replace(/\\/g, '');
    }
  }

  return refObject;
}