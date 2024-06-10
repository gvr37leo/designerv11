
let mongodb = require('mongodb')
let bodyParser = require("body-parser")
let path = require("path")
var express = require('express')
var app = express()

app.use(bodyParser.json());//for json encoded http body's
app.use(bodyParser.urlencoded({ extended: false }));//for route parameters
app.use(express.static('./'))

let url = 'mongodb+srv://paul:$RF5tg^YH@designerv10.bai64.mongodb.net/testdb?retryWrites=true&w=majority';
// https://cloud.mongodb.com/v2/5f63b72f634422449781b510#/metrics/replicaSet/661f9cbfaae012631f280233/explorer/testdb/firstcollection/find
let databasename = 'testdb'
let port = 8000
app.listen(port, () => {
    console.log(`listening on ${8000}`)
})

start()

async function start(){
    const client = new mongodb.MongoClient(url);//{useNewUrlParser: true, useUnifiedTopology: true}
    let sessionmap = {}

    try {
        await client.connect()
        console.log('connected to mongo');
        let db = client.db(databasename)
        let collection = db.collection('firstcollection')

        async function getUserWithSessionId(sessionid){
            return await collection.findOne({sessionid:sessionid})
        }

        app.post('/api/login',async (req,res) => {
            
            // get users
            // check if user exists

            var usertype = await collection.findOne({name:'backenduser'})
            var user = await collection.findOne({type:usertype._id,name:req.body.username})
            if(user == null){
                res.status(404).send()
            }
            let sessionid = Math.floor(Math.random() * 1000000000)
            var x = await collection.findOneAndUpdate({_id:user._id},{$set:{sessionid:sessionid}})
            res.send({
                sessionid:sessionid,
            })
        })



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
                let asdjk = await getdescendants(child._id)
                children.push(...asdjk)
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
            // return true
            var sessionid = parseInt(req.get('sessionid'))
            var sessionuser = await getUserWithSessionId(sessionid)
            // let roles = await getUserRoles(sessionuser._id)
            // do something with the parentnode to check for crud rights
            
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
    
        app.put('/api/update',async function(req, res){
            //find user with sessionid
            if(await authorization(req.body._id,req,'update') == false){
                res.status(403).send()
                return
            }
            
            var current = await collection.findOne({_id:req.body._id})
            if(req.body.updatedAt && (req.body.updatedAt != current.updatedAt)){
                
                res.status(500).send({})
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
            res.send(result)
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