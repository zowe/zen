export const updateSchemaReferences = (schema: any, serverCommon: any): void => {

  const traverseAndUpdate = (node: any) => {
    if (node !== null && typeof node === "object") {
      for (const key in node) {
        if (key === "$ref" && typeof node[key] === "string") {
          try {
            const refValue = resolveRef(node[key]);
            Object.assign(node, refValue); 
            delete node['$ref'];
          } catch(error){
            console.error("Error resolving reference:", error.message);
          }
        } else {
          traverseAndUpdate(node[key]);
        }
      }
    }
  }

  const resolveRef = (ref: string) => {
    const refPath = ref.split('#')[1];
    let result = serverCommon.$defs;
    const refObject = Object.values(result).find((obj:any) => obj.$anchor === refPath);
    return refObject;
  }

  traverseAndUpdate(schema.properties.zowe.properties.setup.properties);
}