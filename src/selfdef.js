

function generateSelfdef(){
    var selfdefobjects = []

    selfdefobjects.push(new Appdef({
        parent:null,
        name:'metametaroot',
        extends:'entity',
        typedef:null
    }))

        selfdefobjects.push(new Objdef({
            parent:'metametaroot',
            name:'backenduser',
            extends:'entity'
        }))
            selfdefobjects.push(new Attribute({
                parent:'backenduser',
                name:'role',
                extends:'entity',
                datatype:'text',
            }))

            selfdefobjects.push(new Attribute({
                parent:'backenduser',
                name:'sessionid',
                extends:'entity',
                datatype:'text',
            }))

        selfdefobjects.push(new Objdef({
            parent:'metametaroot',
            name:'appdef',
            extends:'entity'
        }))
            selfdefobjects.push(new Attribute({
                parent:'appdef',
                name:'typedef',
                extends:'entity',
                datatype:'pointer',
                pointertype:'appdef',
            }))

        selfdefobjects.push(new Objdef({
            parent:'metametaroot',
            name:'entity',
            extends:null
        }))

        // id
        // name
        // order
        // parent
        // type
        // // isProxy
        // // proxyPointer

        // createdAt
        // updatedAt
            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'_id',
                extends:'entity',
                datatype:'id',
            }))

            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'name',
                extends:'entity',
                datatype:'text',
            }))

            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'order',
                extends:'entity',
                datatype:'number',
            }))

            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'parent',
                extends:'entity',
                datatype:'pointer',
                pointertype:'entity',
            }))

            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'type',
                extends:'entity',
                datatype:'pointer',
                pointertype:'datatype',
            }))

            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'createdAt',
                extends:'entity',
                datatype:'date',
            }))

            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'createdBy',
                extends:'entity',
                datatype:'backenduser',
            }))

            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'updatedBy',
                extends:'entity',
                datatype:'backenduser',
            }))

            selfdefobjects.push(new Attribute({
                parent:'entity',
                name:'changeHistory',
                extends:'entity',
                datatype:'json',
            }))






        selfdefobjects.push(new Objdef({
            parent:'metametaroot',
            name:'objdef',
            extends:'entity',
        }))

            selfdefobjects.push(new Attribute({
                parent:'objdef',
                name:'extends',
                extends:'entity',
                datatype:'pointer',
                pointertype:'entity'
            }))

        selfdefobjects.push(new Objdef({
            parent:'metametaroot',
            name:'attribute',
            extends:'entity',
        }))
            selfdefobjects.push(new Attribute({
                parent:'attribute',
                name:'datatype',
                extends:'entity',
                datatype:'pointer',
                pointertype:'datatype'
            }))

            selfdefobjects.push(new Attribute({
                parent:'attribute',
                name:'pointertype',
                extends:'entity',
                datatype:'pointer',
                pointertype:'objdef'
            }))


        selfdefobjects.push(new Objdef({
            parent:'metametaroot',
            name:'datatype',
            extends:'entity',
        }))

    

        selfdefobjects.push(new Datatype({
            parent:'metametaroot',
            name:'id',
            extends:'entity',
        }))

        selfdefobjects.push(new Datatype({
            parent:'metametaroot',
            name:'pointer',
            extends:'entity',
        }))

        selfdefobjects.push(new Datatype({
            parent:'metametaroot',
            name:'number',
            extends:'entity',
        }))

        selfdefobjects.push(new Datatype({
            parent:'metametaroot',
            name:'text',
            extends:'entity',
        }))

        selfdefobjects.push(new Datatype({
            parent:'metametaroot',
            name:'date',
            extends:'entity',
        }))

        selfdefobjects.push(new Datatype({
            parent:'metametaroot',
            name:'boolean',
            extends:'entity',
        }))

        selfdefobjects.push(new Datatype({
            parent:'metametaroot',
            name:'json',
            extends:'entity',
        }))




    //normal metadata

    selfdefobjects.push(new Appdef({
        parent:null,
        name:'metaroot',
        extends:'entity',
        typedef:'metametaroot'
    }))

        selfdefobjects.push(new Objdef({
            parent:'metaroot',
            name:'person',
            extends:'entity',
        }))

            //dateofbirth,bestfriend

        selfdefobjects.push(new Objdef({
            parent:'metaroot',
            name:'company',
            extends:'entity',
        }))
            // rating

        selfdefobjects.push(new Objdef({
            parent:'metaroot',
            name:'personworkatcompany',
            extends:'entity',
        }))
            // salary
    
    selfdefobjects.push(new Appdef({
        parent:null,
        name:'root',
        extends:'entity',
        typedef:'metaroot'
    }))


    idify(selfdefobjects)
    return selfdefobjects
}

function idify(objects){
    var namemap = {}
    for(var object of objects){
        object._id = Math.floor(Math.random() * 99999999)
        namemap[object.name] = object
    }

    
    var pointernames = objects.filter(o => o.type == 'attribute' && o.datatype == 'pointer').map(o => o.name)
    for(var object of objects){
        for(var pointername of pointernames){
            if(object[pointername]){
                object[pointername] = namemap[object[pointername]]._id
            }
        }
    }
}