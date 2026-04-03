
//todo
//users and authorization 

//roles in containers zodat je de extra functionaliteit krijgt van admins/beheerders
//UI/toasts for denied permissions
//rich text
//find/cleanup orphans

//container met bepaald type toestaan onder objdef? generic typing
// generic for containers and or for pointers




//maybe cache the meta trees but not the main data tree
//sessions?
//focus on filestorage
//maybe replace icons with emojis https://emojicopy.com/    https://www.freecodecamp.org/news/all-emojis-emoji-list-for-copy-and-paste/    https://unicode.org/emoji/charts/full-emoji-list.html
//instead of deleting objects move them to the archive first,save the original parent in case you want to recover it
//save a phase on objects, design->exists->archived

//listview for each type
//listview for back refs

//for long lists, dont show them in the tree, only show the table view, select item there, only show selected item in the tree path and maybe ... for the others, or chrome style arrayview
//make a function that scans the uploads folder and checks if they all have a referencing entity, if not create an entity


//optimizations
//thin tree
//only load visible tree nodes
//304 no changes response from server


//maybe get a call to get all the type info and stuff like that first real quick
//have tree loading done only on pages that have the tree view
//custom pages should not have to load the tree
//role based access still needs flushing out

//wat moet elke rol kunnen
//super admin = alles
//admin = mag heel supra zien en zijn definites en rollen rechten onder hem aanpassen
//supramedewerker = mag alle data in de data sectie zien en aanpassen
//praktijkeigenaar = mag alles in onder zijn praktijk zien, mag geen rollen rechten aanpassen

//er moet iets komen zodat je je eigen rollen rechten niet kan ophogen
//idealiter kun je wel je eigen account zien/ maar misschien ook niet
//users onder een sectie zetten die alleen hogere users kunnen editen is een manier om te voorkomen dat ze aan hun rol zitten
//maar dan kunnen ze niet zomaar hun account editen om bijvoorbeeld naam, email of wat dan ook aan te passen


//you can still navigate and edit to entities you're not allowed to edit or see
//pre-calculate ancestors,children,and the roles that are allowed to see,update,delete,create on a node

//an allowedroles array would be nice/generated runtime on serverside?
//update and delete are secured
//search and createmany still need attention
//typeinfo still needs to be read by all regardless of role

//todo docker container opzetten en automatic github sync
//specialized import call

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
        
        //todo this is very risky for name collisions
        var founduser = await queryOne({name:username})// && e.type == findbyname('user')._id
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
var lastretrievedtimestamp = null


async function refresh(){
    // var data = await query({},{})
    // entities = data

    // idmap = mapify(entities,'_id')
    // namemap = mapify(entities,'name')
    // groupparent = groupby(entities,'parent')//quickly find your children
    // typegroups = groupby(entities,'type')
    // objdefmap = mapify(search(entities,{type:namemap['objdef']._id}),'name')
    
}

async function refreshrerender(){
    // await refresh()
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
    router.listen('/home',async (match) => {
        appcontainer.innerHTML = ''
        // homepage()
    })

    router.listen('/login', async (match) => {
        startContext(appcontainer)
        appcontainer.innerHTML = ''
        loginPage()
        endContext()
    })

    router.listen('/practice/[id]', async (match) => {
        
        practicePage(parseInt(match.id))
    })



    router.listen('/patient/[id]', async (match) => {
        
        patientPage(parseInt(match.id))
    })

    router.listen('/order/[id]', async (match) => {
        orderPage(parseInt(match.id))
    })

    router.listen('/practiceselect', async (match) => {
        practiceselect()
    })

    router.listen('/detail/[id]',async (match) => {// main admin page
        await detailPage(match.id)
    })

    router.listen('/listview/[id]',async (match) => {
        await listviewpage(match.id)
    })

    this.router.listen('/',async () => {
        var root = await queryOne({name:'superroot'})
        detailPage(root._id)
    })


    router.locationListen()
    router.trigger(window.location.pathname)
})


function findbyname(name){
    return namemap[name]
}

function findbycodeid(codeid){
    return codeidmap[codeid]
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
