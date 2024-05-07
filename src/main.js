
//todo


//export db
//avadent case study
//give objdefs an icon to show in the treeview
//roles in containers zodat je de extra functionaliteit krijgt van admins/beheerders
//UI/toasts for denied permissions
//create objects of type
//image type
//rich text
//find/cleanup orphans
//container type/attribute?


//crud rights are given a certain node scope
//backend
//admin mag admins,beheerders en gebruikers inviten/verwijderen, mag alle crud
//beheerder,mag gebruikers inviten/verwijderen, crud tot een bepaalde scope
//gebruiker,mag niks, behalve crud tot een bepaalde scope

//frontend gebruiker
//zeer beperkte crud mogelijkheden
//profiel, comments, bepaalde dingen wel of niet zien

//crud rechten vloeien naarbeneden
//wanneer je iets create update of delete, volg de parent chain en kijk of je jezelf tegenkomt in de rechten, anders mag het niet
//met read, filter uit nodes die je niet mag zien

//stap1, maak user entity
//stap2, maak login scherm (sign up gaat via inv)
//sign up, stuur email
//stuur verificatie mee met crud requests

// kan alvast prototype maken zonder wachtwoord

cr('div',{style:'display:flex; align-items:flex-start; gap:10px;'})
    crend('button','get',{class:'btn btn-primary'}).on('click',async () => {
        var data = await query({},{})
        console.log(data)
    })

    crend('button','init',{class:'btn btn-primary'}).on('click',async () => {
        var data = generateSelfdef()
        await createMany(data)
        console.log('created')
    })

    crend('button','delete',{class:'btn btn-primary'}).on('click',async () => {
        var res = await remove({})
        console.log(res)
    })

    var mytextarea = crend('textarea','',{})

    crend('button','export',{class:'btn btn-primary'}).on('click',async () => {
        var res = await query({})
        mytextarea.value = JSON.stringify(res,null,2)
    })

    crend('button','import',{class:'btn btn-primary'}).on('click',async () => {
        var data = JSON.parse(mytextarea.value) 
        var res = await createMany(data)
    })
end()
crend('br')
cr('div',{style:'display:flex;align-items:flex-start;gap:10px;'})
    var usernameinput = crend('input')
    crend('button','login',{class:'btn btn-primary'}).on('click',async () => {
        var res = await fetch('/api/login',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({username:usernameinput.value})
        }).then(res => res.json())
        localStorage.setItem('sessionid',res.sessionid)
        console.log(res)
    })
    let sessioniddiv = crend('div','',{style:'white-space:nowrap;'})
end()
crend('br')

var router = new Router()
var entities = []
var idmap = {}
var namemap = {}
var groupparent = {}
var typegroups = {}
var objdefmap = {}
var current = {}
var appcontainer = crend('div')
var detailview = new DetailView()
var listview = new ListView();
var treeview = new Treeview();



async function refresh(){
    var data = await query({},{})
    entities = data

    idmap = mapify(entities,'_id')
    namemap = mapify(entities,'name')
    groupparent = groupby(entities,'parent')//quicky find your children
    typegroups = groupby(entities,'type')
    objdefmap = mapify(search(entities,{type:namemap['objdef']._id}),'name')
    
}

async function refreshrerender(){
    await refresh()
    router.trigger(window.location.pathname)
}

refresh().then(() => {
    var loggedinuser = search(entities,{sessionid:getSessionId()})[0]
    sessioniddiv.innerText = `current sessionid ${getSessionId()} : ${loggedinuser.name} : ${loggedinuser.role}`

    router.listen(/detail\/(?<id>.*)/,async (match) => {
        startContext(appcontainer)
        current = idmap[match.groups.id]
        appcontainer.innerHTML = ''
        let containter = cr('div',{style:'display:flex; gap:10px;'})
            treeview.render()
            
            await detailview.load(parseInt(match.groups.id))
            startContext(containter)
                detailview.render()
            endContext()
        end()
        endContext()
    })

    this.router.listen(/./,async () => {
        startContext(appcontainer)
        appcontainer.innerHTML = ''
        let containter = cr('div',{style:'display:flex;'})
            treeview.render()
            
            await listview.load({},{})
            startContext(containter)
                listview.metaAttributes = getchildren(objdefmap['entity']._id)
                listview.render()
            endContext()
        end()
        endContext()
    })


    router.locationListen()
    router.trigger(window.location.pathname)
})

