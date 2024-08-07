export const updateSchemaReferences = (schema: any, serverCommon: any): void => {

  const traverseAndUpdate = (node: any) => {
    if (node !== null && typeof node === "object") {
      for (const key in node) {
        console.log("-------------key: ", key);
        if (key === "$ref" && typeof node[key] === "string") {
          try {
            const refValue = resolveRef(node[key]);
            console.log("---------refValue: ", refValue);
            Object.assign(node, refValue); 
            delete node['$ref'];
          } catch(error){
            console.error("Error resolving reference:", error.message);
          }
        } else {
          traverseAndUpdate(node[key]); // Pass down the node[key] for recursive traversal
        }
      }
    }
  }
  
  const resolveRef = (ref: string) => {
    const refPath = ref.replace('#/$defs/', '').split('/');
    let result = serverCommon.$defs;
    for (const part of refPath) {
      console.log('---------------resolve[part]: ', result[part]);
      if (result[part] !== undefined) {
        result = result[part];
      } else {
        console.log('-------------error: not found: ', result[part]);
        throw new Error(`Reference ${ref} not found in serverCommon`);
      }
    }
    return result; 
  }
    
  traverseAndUpdate(schema);
}
  