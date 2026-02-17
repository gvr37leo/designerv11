
//todo
//users and authorization 

//roles in containers zodat je de extra functionaliteit krijgt van admins/beheerders
//UI/toasts for denied permissions
//rich text
//find/cleanup orphans

//container met bepaald type toestaan onder objdef? generic typing
// generic for containers and or for pointers

//top prios
//login, authentication, sessions
//filestorage
//flushing out the supra data structure



//maybe cache the meta trees but not the main data tree
//sessions?
//maybe leave login and authorization for later
//not necessary at the start
//focus on filestorage
//maybe replace icons with emojis https://emojicopy.com/    https://www.freecodecamp.org/news/all-emojis-emoji-list-for-copy-and-paste/    https://unicode.org/emoji/charts/full-emoji-list.html
//instead of deleting objects move them to the archive first,save the original parent in case you want to recover it
//save a phase on objects, design->exists->archived

//listview for each type
//listview for back refs

//for long lists, dont show them in the tree, only show the table view, select item there, only show selected item in the tree path and maybe ... for the others, or chrome style arrayview
//make a function that scans the uploads folder and checks if they all have a referencing entity, if not create an entity

//for rights, can't allow certain roles to make rights or roles
//each role should somehow have a list if which type of objects they're allowed to create and edit, this can combo well with the tree based rights
//admins should be able to do everything, creating roles and rights etc
//how to represent this?
//put role pointers beneath objdefs (or special obj)
//put objdef pointers beneath the roles, i kinda like this idea, keeps the objdefs clean
//this can also be used to shorten the super long combolist for the type dropdown

//optimizations
//thin tree
//only load visible tree nodes
//304 no changes response from server
//mongodb indices
//ancestor array

//maybe get a call to get all the type info and stuff like that first real quick
//have tree loading done only on pages that have the tree view
//custom pages should not have to load the tree
//role based access still needs flushing out

async function login(username,password){
    var res = await fetch('/api/login',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({username:username,password:password})
    }).then(res => res.json())

    if(res.succesfull == true){
        localStorage.setItem('sessionid',res.sessionid)
        var founduser = entities.find(e => e.name == username)// && e.type == findbyname('user')._id
        localStorage.setItem('currentuserid',founduser._id)
        return true
    }else{
        
        return false
    }
}

function logout(){
    localStorage.removeItem('currentuserid')
}

function isLoggedIn(){
    return localStorage.getItem('currentuserid') != null
}

function getcurrentuser(){
    return idmap[parseInt(localStorage.getItem('currentuserid'))] 
}

function getcurrentRole(){
    return deref(getcurrentuser()?.role)?.name
}

function hasReadAccess(nodeid,user){

    if(deref(getcurrentuser())?.role?.allowall == true){
        return true
    }

    var node = deref(nodeid)
    var objdefrights =  getChildrenOfType(deref(getcurrentuser().role),'objdefright') 
    var matchedobjrights = objdefrights.filter(r => r.objdefp == node.type)
    var hasobjreadaccess = matchedobjrights.find(r => r.read == true) != null


    var hastreereadaccess = false
    //get all rights that have your role or user
    //get ancestor path
    //check if any of these rights have a parent in the ancestor path
    //this is not a good idea cause you have to do it for every node in the tree
    //should make a tree in the refresh function and read from there


    return hasobjreadaccess && hastreereadaccess

}

function hasWriteAccess(node,user){

}



var router = new Router()
var entities = []
var idmap = {}
var namemap = {}
var groupparent = {}
var typegroups = {}
var objdefmap = {}
var current = {}
var header = document.querySelector('#header')
var appcontainer = document.querySelector('#appcontainer')
var dialogel = crend('dialog','',{closedby:"any"})
var detailview = new DetailView()
var listview = new ListView();
var treeview = new Treeview();



async function refresh(){
    var data = await query({},{})
    entities = data

    idmap = mapify(entities,'_id')
    namemap = mapify(entities,'name')
    groupparent = groupby(entities,'parent')//quickly find your children
    typegroups = groupby(entities,'type')
    objdefmap = mapify(search(entities,{type:namemap['objdef']._id}),'name')
    
}

async function refreshrerender(){
    await refresh()
    drawHeader()
    router.trigger(window.location.pathname)
}


router.preroutecb = function(route){


    if(route.includes('/login')){
        return true
    }

    if(isLoggedIn() == false){
        this.navigate('/login')
        return false
    }

    if(route.includes('/admin')){
        if(getcurrentRole() == 'admin'){
            return true
        }else{
            //only admin and beheerder are allowed, navigate to homepage or practicepage
            this.navigate('/')
            return false
        }
    }
    //check if loggedin
    //if not, cancel the route event and navigate to the login page (that one shouldnt need a login)
    //if yes, continue as normal
    //for the admin side, should also check if you have the admin role

    return true
}

refresh().then(() => {
    drawHeader()

    router.listen(/home/,async (match) => {
        appcontainer.innerHTML = ''
        // homepage()
    })

    router.listen(/login/, async (match) => {
        startContext(appcontainer)
        appcontainer.innerHTML = ''
        loginPage()
        endContext()
    })

    router.listen(/practice\/(?<id>.*)/, async (match) => {
        
        practicePage(parseInt(match.groups.id))
    })

    router.listen(/patient\/(?<id>.*)/, async (match) => {
        patientPage(parseInt(match.groups.id))
    })

    router.listen(/order\/(?<id>.*)/, async (match) => {
        orderPage(parseInt(match.groups.id))
    })

    router.listen(/practiceselect/, async (match) => {
        practiceselect()
    })

    router.listen(/detail\/(?<id>.*)/,async (match) => {
        startContext(appcontainer)
        current = idmap[match.groups.id]
        appcontainer.innerHTML = ''
        let containter = cr('div',{style:'display:flex; gap:10px; align-items:flex-start;'})
            treeview.render()
            
            await detailview.load(parseInt(match.groups.id))
            startContext(containter)
                detailview.render()
            endContext()
        end()
        endContext()
    })

    router.listen(/listview\/(?<id>.*)/,async (match) => {
        await listviewpage(match.groups.id)
    })

    this.router.listen(/./,async () => {
        startContext(appcontainer)
        appcontainer.innerHTML = ''
        let containter = cr('div',{style:'display:flex; align-items:flex-start;'})
            treeview.render()
            let listviewcontainer = crend('div','',{style:"background:white; margin:0px 10px; padding:5px;border-radius:3px;"})
            await listview.load({},{})
            startContext(listviewcontainer)
                listview.metaAttributes = getchildren(objdefmap['entity']._id)
                listview.render()
            endContext()
        end()
        endContext()
    })


    router.locationListen()
    router.trigger(window.location.pathname)
})


function findbyname(name){
    return namemap[name]
}

function testDialog(){
    openDialog(() => {
        crend('button','close').on('click',() => {
            closeDialog()
        })
        crend('p','hello there here is some aslkjakj dlaksjd  alksdjlaksdj qlkw el alsd lkqwejlkj  lqwkej askdj ql lqkjwel kqjwl kajdflkasdjlqkjwe la lsdkj  dialog')
    })
}

function openDialog(cb){
    dialogel.showModal()
    startContext(dialogel)
    cb()
    endContext()
}

function closeDialog(){
    dialogel.close()
    dialogel.innerHTML = ''
}
