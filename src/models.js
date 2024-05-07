class Entity{
    _id
    name
    order
    parent
    type
    // isProxy, don't do this until there is a good reason to do it, it's featuritis atm
    // proxyPointer

    createdAt
    updatedAt
    createdBy
    updatedBy
    changeHistory

    constructor(obj){
        this.type = 'entity'
        Object.assign(this,obj)
    }

}

class Appdef extends Entity{
    typedef

    constructor(obj){
        super(obj)
        Object.assign(this,obj)
        this.type = 'appdef'
    }
}

class Objdef extends Entity{
    extends

    constructor(obj){
        super(obj)
        Object.assign(this,obj)
        this.type = 'objdef'
    }
}

class Attribute extends Entity{
    datatype
    pointertype

    constructor(obj){
        super(obj)
        Object.assign(this,obj)
        this.type = 'attribute'
    }
}


//id,pointer,text,number,date,boolean
class Datatype extends Entity{
    constructor(obj){
        super(obj)
        Object.assign(this,obj)
        this.type = 'datatype'  
    }
}

class User{
    // role
    sessionid
}

//rights are placed on nodes
//and they show a certain user or role is allowed to do
//maybe access is a better name

//roles are assigned by a role node with a list of references to users under it
//roleassignment

class Role{
    //has roleassignment children
}

class RoleAssignment{//could just be a proxy
    user
}

class Right{
    read
    create
    update
    delete
    role//either role or user is set
    user
}
//ideally rights would be stored as a list directly on the object
//but for now try saving it as children direcly under that node or under a specially named subnode
//could also add a attribute that references the container node with children rights
//i like trying direct children first

//for create this means, that below this node this user or role is allowed to create new entity's
//for delete this means that this node and below the user or role is allowed to delete any node
//for update this means that this node and below the user or role is allowed to update
//fore read this means that this ndoe and below the user can see it
//create update delete rights imply read rights