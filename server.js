
let mongodb = require('mongodb')
var fs = require('fs')
const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
let bodyParser = require("body-parser")
let path = require("path")
var express = require('express')
var app = express()

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

let url = 'mongodb://localhost:27017';
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
        let filecollection = db.collection('firstcollection')

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
            let children = await getchildren(id)
            for(var child of children){
                let descs = await getdescendants(child._id)
                children.push(...descs)
            }

            return children
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
            return true
            var sessionid = parseInt(req.get('sessionid'))
            var sessionuser = await getUserWithSessionId(sessionid)
            // let roles = await getUserRoles(sessionuser._id)
            // do something with the parentnode to check for crud rights
            
            //get all rights that have this user or this users role
            //get the parents of those rights
            //check if that parent is in this node's ancestor path
            //if so allow

            //maybe add a setting to turn off and on authorization


            if(sessionuser == null){
                return false
            }

            let rightnode = await collection.findOne({name:'right'})

            var ancestors = await getancestors(id)
            for(var ancestor of ancestors){

                let children = await getchildren(ancestor._id)
                let rights = children.filter(c => c.type == rightnode._id)

                for(var right of rights){
                    if(right.exludeself && ancestor == ancestors[0]){
                        continue
                    }

                    
                    //get a list of roles the user is included in
                    //first get all the roles
                    //then get all the children, these children are probable pointers
                    if(right[crudop] == true && (sessionuser.role == right.role || sessionuser._id == right.user)){
                        return true
                    }
                }
            }
            return false

            //find ancestors
            //for each get the rights children
            //check the role/user of the right
            //check the crudtype of the right
            //as soon as you find a valid right -> allow
            //if none encountered -> deny

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

        app.post('/api/create',async function(req, res){
            let authresult = await authorization(req.body[0].parent,req,'create')
            if(authresult == false){
                res.status(403).send()
                return
            }

            for(var entity of req.body){
                if(entity._id == null){
                    entity._id = Math.floor(Math.random() * 1000000000)
                }
                entity.order = entity.order ?? 1
                entity.createdAt = Date.now()
                entity.updatedAt = Date.now()
            }

            var result = await collection.insertMany(req.body)
            

            res.send(result)
        })

        app.post('/api/read',async function(req,res){
            if(await authorization(req,res) == false,'read'){
                return
            }

            //read one read descendants?
            let oasd = await getdescendants(req.body._id)
            res.send(oasd) 

        })
    
        app.post('/api/query',async function(req, res){
            //find user with sessionid
            // if(req.body._id){
            //     req.body._id = new mongodb.ObjectId(req.body._id)
            // }
            var cursor = collection.find(req.body.filter).sort(req.body.sort)
            var result = await cursor.toArray()
            
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
                        nodes.push(...arr)
                        break
                    } else {
                        // named segment: find node with this name
                        let node = await collection.findOne({ name: seg })
                        currentnode = node
                        // nodes.push(node)
                    }
                }
                res.send(nodes)
            }catch(e){
                console.error('pathsearch error', e)
                res.status(500).send({ error: e.message })
            }
        })
    
        app.put('/api/update',async function(req, res){
            //find user with sessionid
            if(await authorization(req.body._id,req,'update') == false){
                res.status(403).send()
                return
            }
            //todo updating the parent field should have extra strict authorization checking because you could move nodes to where you don't have authority

            var current = await collection.findOne({_id:req.body._id})
            if(req.body.updatedAt && (req.body.updatedAt != current.updatedAt)){
                
                res.status(500).send({error:'a newer version already exists on the server'})
                return 'error'
            }

            req.body.updatedAt = Date.now()
            //update backrefs
            var result = await collection.findOneAndUpdate({_id:req.body._id}, {$set:req.body})
            res.send(result)
        })
    
        app.delete('/api/delete',async function(req, res){
            if(await authorization(req.body._id,req,'delete') == false){
                res.status(403).send()
                return
            }
            var descendants = await getdescendants(req.body._id)

            var result2 = await collection.deleteMany({_id:{$in:descendants.map(d => d._id)}})
            var result = await collection.findOneAndDelete({_id:req.body._id})
            res.send({message:"success",result,result2})
        })

        app.get('/*', function(req, res, next) {
            res.sendFile(path.resolve('index.html'));
        });

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

async function sendemail(to,title,contents){

}