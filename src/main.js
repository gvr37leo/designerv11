
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


refresh().then(() => {
    drawHeader()
    router.listen(/home/,async (match) => {
        appcontainer.innerHTML = ''
        homepage()
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
        current = idmap[match.groups.id]
        var objdef = current
        var attributes = getAttributes(objdef._id)
        startContext(appcontainer)
        appcontainer.innerHTML = ''
        let containter = cr('div',{style:'display:flex; align-items:flex-start;'})
            let listviewcontainer = crend('div','',{style:"background:white; margin:0px 10px; padding:5px;border-radius:3px;"})
            listview.metaAttributes = attributes
            await listview.load({"type":{"$eq":objdef._id}},{updatedAt:-1})
            startContext(listviewcontainer)
                listview.render()
            endContext()
        end()
        endContext()
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
