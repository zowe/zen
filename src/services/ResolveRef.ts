let mainSchema: any;
let schemaMap: { [key: string]: any } = {};

export const updateSchemaReferences = (yamlAndSchema: any, schemaObject: any): void => {
  mainSchema = schemaObject;
  const schemaArray = Object.keys(yamlAndSchema);
  schemaMap = {};

  schemaArray.forEach(key => {
    const value = yamlAndSchema[key];
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

  traverseAndResolveReferences(schemaObject);
}

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

const resolveRef = (ref: string) => {
  let [refPath, anchorPart] = ref.split('#');
  const isRefPathEmpty = !refPath;

  let refSchema = isRefPathEmpty ? mainSchema : schemaMap[Object.keys(schemaMap).find((id) => id.endsWith(refPath))];

  if (!refSchema) {
    throw new Error(`Schema for reference path ${refPath} not found`);
  }

  const anchor = anchorPart?.split("/").pop();
  const refObject = isRefPathEmpty ? refSchema.$defs[anchor] :  Object.values(refSchema.$defs).find((obj:any) => obj.$anchor === anchor);

  if (!refObject) {
    throw new Error(`Reference ${ref} not found in schemaObject ${refSchema.$id}`);
  }

  return refObject;
}