function last(arr){
    return arr[arr.length - 1]
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function duplicateTree(nodeid){
    //get root node
    //get its children and all it's descendants
    const root = deref(nodeid);
    const descendants = getDescendants(nodeid);
    const nodesToDuplicate = [root, ...descendants];
    
    //duplicate them all
    //keep track of the old and newids and put those in a map
    const idMap = {};
    const duplicatedNodes = [];
    
    // First pass: create copies with new IDs
    for (const node of nodesToDuplicate) {
        const newId = Math.floor(Math.random() * 1000000000);
        idMap[node._id] = newId;
        
        const newNode = JSON.parse(JSON.stringify(node)); // Deep copy
        newNode._id = newId;
        duplicatedNodes.push(newNode);
    }
    
    //check all the fields and references of every node
    //if you see and old id in there replace it with the new one
    //this will mainly happen with the parent references but any other field that referenced something in the old tree will also get updated
    for (const newNode of duplicatedNodes) {
        for (const key in newNode) {
            if (key !== '_id' && typeof newNode[key] === 'number') {
                if (idMap[newNode[key]] !== undefined) {
                    newNode[key] = idMap[newNode[key]];
                }
            }
        }
    }
    
    // Create all duplicated nodes
    return createMany(duplicatedNodes);
}