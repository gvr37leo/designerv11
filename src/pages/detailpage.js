var currentuser
var currentrole

async function detailPage(id){

    var frontloaddata = await fetch('/api/frontload',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify({})
    }).then(res => res.json()).catch((reason) => {
        toastr.error('Error', reason)
    })

    frontloaddata.user
    frontloaddata.tree
    frontloaddata.listviewdata

    currentuser = frontloaddata.user//load 1
    currentrole = currentuser.rolederef

    data = frontloaddata.tree//load 2
    entities = data

    idmap = mapify(entities,'_id')
    namemap = mapify(entities,'name')
    codeidmap = mapify(entities,'codeid')
    groupparent = groupby(entities,'parent')//quickly find your children
    typegroups = groupby(entities,'type')
    objdefmap = mapify(search(entities,{type:namemap['objdef']._id}),'name')

    startContext(appcontainer)
    current = idmap[id]
    appcontainer.innerHTML = ''
    await drawHeader()
    let container = cr('div',{style:'display:flex; gap:10px; align-items:flex-start;'})
        treeview.render()
        
        await detailview.load(parseInt(id))//load 3
        startContext(container)
            detailview.render()
        endContext()
    end()
    endContext()
}