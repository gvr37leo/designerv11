
//todo
//image type
//give objdefs an icon to show in the treeview
//avadent case study
//clone tree
//roles in containers zodat je de extra functionaliteit krijgt van admins/beheerders
//UI/toasts for denied permissions
//rich text
//find/cleanup orphans
//list type/attribute?

cr('div',{style:'display:flex; justify-content:space-between; background:white; padding:10px;'})
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

    cr('div',{style:'display:flex;align-items:flex-start;gap:10px;'})
        crend('button','delete orphans',{}).on('click',() => {
            var allset = new Set(entities.map(e => e._id))
            
            
            var roots = entities.filter(e => e.parent == null)
            var ids = []
            //weird bug where ids list is really long and keeps growing after every call
            for(var root of roots){
                ids.push(root,...getDescendants(root._id).map(e => e._id))
            }
            var crawledset = new Set(ids)

            var orphanset = allset.difference(crawledset)
            var orphanids = Array.from(orphanset)
            // remove({_id:orphanids})
        })
        let sessioniddiv = crend('div','',{style:'white-space:nowrap;'})
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
    end()
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
var appcontainer = crend('div',{})
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
    // var loggedinuser = search(entities,{sessionid:getSessionId()})[0]
    // sessioniddiv.innerText = `current sessionid ${getSessionId()} : ${loggedinuser.name} : ${loggedinuser.role}`

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

    this.router.listen(/./,async () => {
        startContext(appcontainer)
        appcontainer.innerHTML = ''
        let containter = cr('div',{style:'display:flex; align-items:flex-start;'})
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

