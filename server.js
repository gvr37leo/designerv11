
let mongodb = require('mongodb')
var fs = require('fs')
const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
let bodyParser = require("body-parser")
let path = require("path")
var express = require('express')
var app = express()
var emailsender = require('./emailsender')
var lastedittimestamp = Date.now()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Specify the folder where the file will be saved
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Specify the file name format (we use original filename)
      cb(null, Math.floor(Math.random() * 1000000000).toString()+ path.extname(file.originalname));      
    }
});
const upload = multer({ storage: storage });

// app.use(express.raw({ type: 'image/*', limit: '10mb' }));
app.use(bodyParser.json());//for json encoded http body's
app.use(bodyParser.urlencoded({ extended: false }));//for route parameters
app.use(express.static('./'))

let url = process.env.MONGO_URL || 'mongodb://localhost:27017';
// https://cloud.mongodb.com/v2/5f63b72f634422449781b510#/metrics/replicaSet/661f9cbfaae012631f280233/explorer/testdb/firstcollection/find
let databasename = 'testdb'
let port = 8000
app.listen(port, () => {
    console.log(`listening on ${8000}`)
})

start()

async function start(){
    const client = new mongodb.MongoClient(url);
    let sessionmap = {}

    try {
        await client.connect()
        console.log('connected to mongo');
        let db = client.db(databasename)
        let collection = db.collection('firstcollection')

        var collectionsize = await collection.count()
        if(collectionsize == 0){
            try {
                const data = fs.readFileSync('./init.json', 'utf8')
                const jsonData = JSON.parse(data)
                const result = await collection.insertMany(jsonData)
                res.send(result)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        }

        async function getUserWithSessionId(sessionid){
            return await collection.findOne({sessionid:sessionid})
        }

        app.post('/api/upload',upload.single('file'),async (req,res) => {
            res.send(req.file)
        })

        app.get('/api/download/:filename',(req,res) => {
            res.sendFile(path.resolve(__dirname, `./uploads/${req.params.filename}`))
        })

        app.delete('/api/deletefile/:filename',(req,res) => {
            const uploadsDir = path.resolve(__dirname, 'uploads');
            const filePath = path.resolve(__dirname, 'uploads', req.params.filename);
            if (!filePath.startsWith(uploadsDir + path.sep) && filePath !== uploadsDir) {
                res.status(400).send({error: "Invalid file path"})
                return
            }
            
            fs.unlinkSync(filePath)
            res.send({message:"deleted"})
        })

        app.post('/api/login',async (req,res) => {
            
            // get users
            // check if user exists

            var usertype = await collection.findOne({name:'user'})
            var user = await collection.findOne({type:usertype._id,name:req.body.username})
            if(user == null){
                res.status(404).send({
                    succesfull:false,
                })
                return
            }
            if(user.password == req.body.password){
                let sessionid = Math.floor(Math.random() * 1000000000)
                var x = await collection.findOneAndUpdate({_id:user._id},{$set:{sessionid:sessionid}})
                res.send({
                    succesfull:true,
                    sessionid:sessionid,
                })
            }else{
                res.send({
                    succesfull:false,
                })
            }
            
        })

        

        // app.post('/api/registerlogin',async (req,res) => {
        //     //see if email is already in the database
        //     //if not, create user and send login email
        //     //if yes, just send login email

        //     var usertype = await collection.findOne({name:'user'})
        //     var user = await collection.findOne({type:usertype._id,email:req.body.email})
        //     var logintoken = 123456789
        //     if(user == null){
        //         user = await collection.insertOne({
        //             name:req.body.email,
        //             email:req.body.email,
        //             type:usertype._id,
        //             logintoken:logintoken,
        //             extends:0,
        //         })
        //     }

        //     sendemail(req.body.email,'login link',`click on this <a href="localhost:8000/login?logintoken=${logintoken}">link</a> to login`)
        //     res.send()
        // })

        // app.post('/api/verifylogin',async (req,res) => {

        //     var founduser = await collection.findOne({logintoken:req.body.logintoken})
        //     if(founduser == null){
        //         res.status(403).send()
        //     }
            
        //     var sessiontoken = 123456789
        //     res.cookie('sessiontoken',sessiontoken,{maxAge:0}).send()

        // })




        // ,includeself = true
        async function getancestors(id){
            let res = []
            var current = await deref(id)
            while(current != null){
                res.push(current)
                current = await deref(current.parent)
            }
            // if(includeself == false){
            //     res.shift()
            // }
            return res
        }

        async function getdescendants(id){


            const result = await collection.aggregate([
                {
                    $match: { _id: id }
                },
                {
                    $graphLookup: {
                        from: 'firstcollection',
                        startWith: '$_id',
                        connectFromField: '_id',
                        connectToField: 'parent',
                        as: 'descendants',
                        maxDepth: 20 - 1,
                        depthField: "level",
                        restrictSearchWithMatch: {}
                    }
                }
            ]).toArray()
            var data = result[0]
            return data.descendants

            // let children = await getchildren(id)
            // for(var child of children){
            //     let descs = await getdescendants(child._id)
            //     children.push(...descs)
            // }

            // return children
        }

        async function deref(id){
            return await collection.findOne({_id:id})
        }

        async function getchildren(id,derefpointers = false){
            let children = await collection.find({parent:id}).toArray()



            if(derefpointers){
                let proxynode = await collection.findOne({name:'proxy'})
                children = children.map(async child => {
                    if(child.type == proxynode._id){
                        return await deref(child.ref)
                    }else{
                        return child
                    }
                })
            }

            return children
        }

        async function getUserRoles(userid){

        }

        async function authorization(id,req,crudop){
            var entity = await deref(id)
            var sessionid = parseInt(req.get('sessionid'))
            var user = await getUserWithSessionId(sessionid)
            if(user == null){
                return false
            }
            var role = await deref(user.role)
            if(role.name == 'admin'){
                return true
            }
            

            
            // //part 1, check role of user, see what objdefs are allowed, check if entity is in there
            // //part 2 get all rights, filter all the rights with the correct user or role and crudop, for all those rights filter for if their parentid is in the ancestor array
            // //if length > 0 the success
            // //if part1 && part2 then success
            // var objproxys = await getChildrenOfType(role._id,'proxy')
            // var hasobjaccess = objproxys.map(p => p.ref).includes(entity.type)
            // let rightobjdef = await collection.findOne({name:'right'})
            // let rights = await collection.find({type:rightobjdef._id}).toArray()
            // rights = rights.filter(r => (r.rightrole == user.role || r.user == user._id) && r[crudop] == true)//also check crudop
            // rights = rights.filter(r => entity.ancestors.includes(r.parent))
            // var hasrightaccess = rights.length > 0
            // return hasobjaccess && hasrightaccess

            var listtocheck = entity['allowedroles' + crudop]            
            return listtocheck.includes(user.role) || listtocheck.includes(user._id)
        }

        async function generateAllowedRoles(entities){
            //get all roles and their allowedobjdefs
            //get all rights and check entities ancestors

            
            var roles = await collection.find({type:(await getByCodeId('roledef'))._id}).toArray()
            for(var role of roles){
                var objproxys = await getChildrenOfType(role._id,'proxy')
                role.allowedobjdefs = objproxys.map(p => p.ref)
            }
            var users = await collection.find({type:(await getByCodeId('userdef'))._id}).toArray()
            for(var user of users){
                user.allowedobjdefs = roles.find(r => r._id == user.role).allowedobjdefs
            }

            var rights = await collection.find({type:(await getByCodeId('rightdef'))._id}).toArray()

            // var crudops = ['read','create','update','delete']
            for(var entity of entities){
                if(entity._id == 774560801){
                    var x = 12
                }
                var userswithobjaccess = users.filter(u => u.allowedobjdefs.includes(entity.type))
                var userswithobjaccessSet = new Set(userswithobjaccess.map(u => u._id))

                var roleswithobjaccess = roles.filter(r => r.allowedobjdefs.includes(entity.type))
                var roleidswithObjAccessSet = new Set(roleswithobjaccess.map(r => r._id))
                // var combinedEntityAccessSet = userswithobjaccessSet.union(roleidswithObjAccessSet)

                

                var rightswithaccess = rights.filter(r => entity.ancestors.includes(r.parent))

                var rightswithreadaccess = rightswithaccess.filter(r => r.read == true)
                var rightswithupdateaccess = rightswithaccess.filter(r => r.update == true)
                var rightswithdeleteaccess = rightswithaccess.filter(r => r.delete == true)
                var rightswithcreateaccess = rightswithaccess.filter(r => r.create == true)

                

                entity.allowedrolesread = Array.from(new Set(rightswithreadaccess.map(r => r.rightrole)).intersection(roleidswithObjAccessSet))
                entity.allowedrolesupdate = Array.from(new Set(rightswithupdateaccess.map(r => r.rightrole)).intersection(roleidswithObjAccessSet))
                entity.allowedrolesdelete = Array.from(new Set(rightswithdeleteaccess.map(r => r.rightrole)).intersection(roleidswithObjAccessSet))
                entity.allowedrolescreate = Array.from(new Set(rightswithcreateaccess.map(r => r.rightrole)).intersection(roleidswithObjAccessSet))

                entity.allowedrolesread = entity.allowedrolesread.concat(Array.from(new Set(rightswithreadaccess.map(r => r.user)).intersection(userswithobjaccessSet)))
                entity.allowedrolesupdate = entity.allowedrolesupdate.concat(Array.from(new Set(rightswithupdateaccess.map(r => r.user)).intersection(userswithobjaccessSet)))
                entity.allowedrolesdelete = entity.allowedrolesdelete.concat(Array.from(new Set(rightswithdeleteaccess.map(r => r.user)).intersection(userswithobjaccessSet)))
                entity.allowedrolescreate = entity.allowedrolescreate.concat(Array.from(new Set(rightswithcreateaccess.map(r => r.user)).intersection(userswithobjaccessSet)))

                // entity.allowedrolesread = Array.from(new Set(rightswithreadaccess.flatMap(r => [r.rightrole,r.user])).intersection(combinedEntityAccessSet)
            }

            //get all users their role and their allowedobjdefs
            //for an entity
            //get the relevant rights for that entity
            //get the closest right with his userid

            var bulkWriteresult = await collection.bulkWrite(entities.map(e => {
                return {
                    updateOne:{
                        filter:{_id:e._id},
                        update:{$set:e}
                    }
                }
            }))
            return bulkWriteresult
        }

        async function getByName(name){
            return collection.findOne({name:name})
        }

        async function getByCodeId(codeid){
            return collection.findOne({codeid:codeid})
        }

        async function getChildrenOfType(id,typestr){
            var objdef = await collection.findOne({name:'objdef'})
            var type = await collection.findOne({name:typestr,type:objdef._id})
            let children = await collection.find({parent:id,type:type._id}).toArray()
            return children
        }

        app.post('/api/touch',async function(req,res){
            var segments = req.body.path.split('/')
            var current = null
            for(var segment of segments){
                var found = await collection.findOne({
                    name:segment,
                    parent:current?._id
                })
                if(found == null){
                    var result = await collection.insertOne({
                        _id:Math.floor(Math.random() * 1000000000),
                        name:segment,
                        createdAt:Date.now(),
                        updatedAt:Date.now(),
                    })
                    current = result
                }else{
                    current = found
                }
            }
            res.send(current)
        })
    
        app.post('/api/query',async function(req, res){
            //find user with sessionid
            // if(req.body._id){
            //     req.body._id = new mongodb.ObjectId(req.body._id)
            // }
            var result = await collection.find(req.body.filter).sort(req.body.sort).toArray()

            if(req.body.derefs){
                for(var item of result){
                    for(var deref of req.body.derefs){
                        var derefpath = deref.split('.')
                        var current = item
                        for(var seg of derefpath){
                            current = current[seg]
                        }
                        if(current != null){
                            var dereffedobj = await collection.findOne({_id:current})
                            item[deref + 'deref'] = dereffedobj
                        }
                    }
                }
            }

            //loop over all
            //generate allowedroles
            //filter based on that
            //keep in mind all roles need to see typeinformation

            for(var item of result){


                item.allowedrolesdelete = []
                item.allowedrolesupdate = []
                item.allowedrolescreate = []
                item.allowedrolesread = []
            }

            res.send(result)
        })

        app.post('/api/frontload',async function(req,res){

            //todo if the user sends an timestamp of when they last retrieved data, the server can check if anyhting has changed since then
            //if not it can send a message to the client to use the old data
            
            if(req.body.lastretrievedtimestamp > lastedittimestamp){
                res.status(304).send([])//not modified
            }

            var result = {}
            //use session id
            //get current user and role
            //get necessary tree data
            //get table listview data
            var sessionid = parseInt(req.get('sessionid'))
            var user = await getUserWithSessionId(sessionid)
            user.rolederef = await collection.findOne({_id:user.role})
            result.user = user
            result.tree = await collection.find({}).toArray()
            //filter this tree so only allowed data is sent
            res.send(result)
        })

        app.post('/api/pathsearch',async function(req,res){
            try{
                let path = req.body.path || ''
                let segments = path.split('/').filter(s => s.length > 0)

                let currentnode = null
                let nodes = []

                for(let seg of segments){
                    if(seg.startsWith('[') && seg.endsWith(']')){
                        // explicit id like [123456]
                        let id = parseInt(seg.slice(1, -1))
                        let node = await collection.findOne({_id: id})
                        currentnode = node
                        // nodes.push(node)
                    } else if(seg === '*'){
                        // wildcard: get all children of the current node
                        var arr = await collection.find({ parent: currentnode._id }).toArray()
                        nodes = arr;
                        break
                    } else {
                        // named segment: find node with this name
                        var query = {name: seg}
                        if(currentnode != null){
                            query.parent = currentnode._id
                        }
                        let node = await collection.findOne(query)
                        currentnode = node
                        nodes = [node]
                    }
                }
                res.send(nodes)
            }catch(e){
                console.error('pathsearch error', e)
                res.status(500).send({ error: e.message })
            }
        })

        app.post('/api/resetpassword', async function(req,res){
            
            var user = await deref(req.body.userid)
            user.password = '123'//generate random password for user
            await collection.findOneAndUpdate({_id:user._id}, {$set:user})
            await emailsender.sendmail(user.email,'supra login credentials',`<p>Hello ${user.name} this is your login ${user.password}</p>`)
            res.send({message:'email sent'})
        })

        app.post('/api/gettree',async function(req,res){
            const { id, depth } = req.body

            try {
                const result = await collection.aggregate([
                    {
                        $match: { _id: id }
                    },
                    {
                        $graphLookup: {
                            from: 'firstcollection',
                            startWith: '$_id',
                            connectFromField: '_id',
                            connectToField: 'parent',
                            as: 'descendants',
                            maxDepth: depth - 1,
                            depthField: "level",
                            restrictSearchWithMatch: {}
                        }
                    }
                ]).toArray()

                if (result.length === 0) {
                    res.status(404).send({ error: 'Node not found' })
                } else {
                    var data = result[0]
                    var tree = buildTree([data,...data.descendants],id)
                    delete tree.descendants
                    res.send(tree)
                }
            } catch (e) {
                console.error('gettree error', e)
                res.status(500).send({ error: e.message })
            }
        })


        //make create work with 1 entity
        //have import work with a seperate apicall
        app.post('/api/create',async function(req, res){
            var entity = req.body
            let authresult = await authorization(entity.parent,req,'create')
            if(authresult == false){
                res.status(403).send({error:'not allowed to create new entities here'})
                return
            }
            if(entity._id == null){
                entity._id = Math.floor(Math.random() * 1000000000)
            }
            if(typeof entity.type == 'string'){
                var objdef = await collection.findOne({name:'objdef'})
                var typeobj = await collection.findOne({name:entity.type,type:objdef._id})
                entity.type = typeobj._id ?? null
            }
            entity.order = entity.order ?? 1
            entity.createdAt = Date.now()
            entity.updatedAt = Date.now()
            entity.children = []
            entity.ancestors = []
            //add yourself to parents children
            //calc your ancestors
            var parent = await deref(entity.parent)
            parent.children.push(entity._id)
            await updateancestors(parent,entity)
            await collection.findOneAndUpdate({_id:parent._id},{$set:parent})

            
            
            var result = await collection.insertOne(entity)
            await generateAllowedRoles([entity])//generates only for the new entities
            await checkForRightUpdates([entity])//generates globally for all if any of the enities are rights
            res.send(result)
        })
    
        app.put('/api/update',async function(req, res){
            
            

            //find user with sessionid
            if(await authorization(req.body._id,req,'update') == false){
                res.status(403).send({error:'not allowed to update this entity'})
                return
            }
            //todo updating the parent field should have extra strict authorization checking because you could move nodes to where you don't have authority

            var current = await collection.findOne({_id:req.body._id})
            if(req.body.updatedAt && (req.body.updatedAt != current.updatedAt)){
                
                res.status(500).send({error:'a newer version already exists on the server'})
                return 'error'
            }

            delete req.body.createdAt
            delete req.body.updatedAt
            delete req.body.allowedrolesread
            delete req.body.allowedrolesupdate
            delete req.body.allowedrolesdelete
            delete req.body.allowedrolescreate
            delete req.body.ancestors//ancestors and children are handled by server
            delete req.body.children
            req.body.updatedAt = Date.now()

            

            //check if parent was changed
            if(req.body.parent != current.parent){
                
                //remove ref from parent children
                //add ref to new parent children
                var newparent = await deref(req.body.parent)
                newparent.children.push(current._id)
                await collection.findOneAndUpdate({_id:newparent._id}, {$set:newparent})

                var oldparent = await deref(current.parent)
                oldparent.children.splice(oldparent.children.findIndex(cid => cid == current._id),1)
                await collection.findOneAndUpdate({_id:oldparent._id}, {$set:oldparent})
                
                
                await updateancestors(newparent,req.body)
                //update ancestors, of yourself and your children

                //get yourself and all your descendants in a list and bean em through this function to update the allowedroles
                var descendants = await getdescendants(current._id)
                await generateAllowedRoles([current,...descendants])
                //when a right/objdef is moved/deleted/created/updated, run a full tree recalculation
            }
            var result = await collection.findOneAndUpdate({_id:req.body._id}, {$set:req.body})
            await checkForRightUpdates([current])

            res.send(result)
        })
    
        app.delete('/api/delete',async function(req, res){
            if(await authorization(req.body._id,req,'delete') == false){
                res.status(403).send({error:'not allowed to delete this entity'})
                return
            }

            //remove yourself from parents children list
            try{
                var entity = await deref(req.body._id)
                var parent = await deref(entity.parent)
                parent.children.splice(parent.children.findIndex(cid => cid == req.body._id),1)
                await collection.findOneAndUpdate({_id:parent._id},{$set:parent})
            }catch(e){
                console.error(e)
            }
            var descendants = await getdescendants(req.body._id)

            var result2 = await collection.deleteMany({_id:{$in:descendants.map(d => d._id)}})
            var result = await collection.findOneAndDelete({_id:req.body._id})

            await checkForRightUpdates([entity])

            res.send({message:"success",result,result2})
        })

        app.get('/*', function(req, res) {
            res.sendFile(path.resolve('index.html'));
        });

        app.post('/api/updatedata', async function(req,res){
            //set the children and ancestors array of every entity in the database to the correct value
            let allEntities = await collection.find({}).toArray();
            let entityMap = new Map();
            allEntities.forEach(e => entityMap.set(e._id, e));

            // Reset children
            allEntities.forEach(e => e.children = []);

            // Build children
            allEntities.forEach(e => {
                if (e.parent && entityMap.has(e.parent)) {
                    entityMap.get(e.parent).children.push(e._id);
                }
            });

            // Build ancestors
            async function buildAncestors(entity) {
                if (!entity.parent) {
                    entity.ancestors = [];
                    return;
                }
                let parent = entityMap.get(entity.parent);
                if (!parent) {
                    entity.ancestors = [];
                    return;
                }
                if (!parent.ancestors) {
                    await buildAncestors(parent);
                }
                entity.ancestors = [...parent.ancestors, parent._id];
            }

            for (let entity of allEntities) {
                await buildAncestors(entity);
            }

            // Update all
            for (let entity of allEntities) {
                await collection.findOneAndUpdate({_id: entity._id}, {$set:{children: entity.children, ancestors: entity.ancestors}});
            }

            res.send({message: "success"});
        })

        app.post('/api/import',async function(req,res){
            //doesnt go well with a cold start
            var sessionid = parseInt(req.get('sessionid'))
            var user = await getUserWithSessionId(sessionid)
            if(user.role != 'admin'){
                res.send()
                return
            }
            
            var insertresult = await collection.insertMany(req.data)
            res.send(insertresult)
        })

        async function updateancestors(parent,entity){
            entity.ancestors = [...parent.ancestors,parent._id]
            await collection.findOneAndUpdate({_id:entity._id},{$set:entity})

            var children = await getchildren(entity._id)
            for(var child of children){
                await updateancestors(entity,child)//todo can be done in parralel
            }
        }

        //rolesallowedtosee
        //rolesallowedtocreate
        //rolesallowedtodelete
        //rolesallowedtoupdate
        //could also determine this from the ancestors array at runtime
        //an items allowedroles should be updated everytime it is moved or when it's created
        //but when a right is changed,moved,created or deleted or when a role or it's allowed objdefs pointers are created or changed
        //then every entity needs to get updated
        async function checkForRightUpdates(entities){
            var needsupdate = false
            var rightdef = await getByCodeId('rightdef')
            for(var entity of entities){
                if(entity.type == rightdef._id){//todo also need to check for objdef pointers below roles 
                    needsupdate = true
                    break;
                }
            }

            if(needsupdate){
                let all = await collection.find({}).toArray()//this could be a stream maybe
                await generateAllowedRoles(all)
            }
        }

    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!\n retryng in 5 sec', error);
        setTimeout(() => {
            start()
        }, 5000);
    }
}

async function scanUploads(){
    //scan the uploads folder and check if there are any files that dont have an entity referencing them in the database
    //if not create a fileobjdef entity for them
    //every file should have a fileobjdef entity in the database under the files entity
}


/**
 * Converts a flat array of nodes into a nested tree.
 * @param {Array} list - The flat array from MongoDB ($graphLookup results).
 * @param {String|null} rootId - The ID of the top-level node to start from.
 * @returns {Object|null} - The nested tree structure.
 */
function buildTree(list, rootId) {
  const map = {};
  let root = null;

  // 1. Create a mapping of all items by their ID
  // We also initialize a 'children' array for each node
  list.forEach((node) => {
    map[node._id] = { ...node, children: [] };
  });

  // 2. Link children to their parents
  list.forEach((node) => {
    const currentNode = map[node._id];
    const parentId = node.parent;

    if (node._id === rootId) {
      // This is our starting "head" node
      root = currentNode;
    } else if (parentId && map[parentId]) {
      // Push this node into its parent's children array
      map[parentId].children.push(currentNode);
    }
  });

  return root;
}


var protectednames = ['objdef']