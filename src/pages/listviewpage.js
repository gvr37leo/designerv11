async function listviewpage(id){
    current = idmap[id]
    let objdef = current
    let attributes = getAttributes(objdef._id)
    startContext(appcontainer)
    appcontainer.innerHTML = ''
    let containter = cr('div',{style:'display:flex; align-items:flex-start;'})
        let listviewcontainer = crend('div','',{style:"background:white; margin:0px 10px; padding:5px;border-radius:3px;"})
        
        listview.metaAttributes = attributes
        await listview.load({"type":{"$eq":objdef._id}},{updatedAt:-1})
        startContext(listviewcontainer)
            let objdefs = Object.values(objdefmap)
            let selectel = cr('select').on('change',(e) => {
                router.navigate(`/listview/${objdefs[e.target.selectedIndex]._id}`)
            })
                for(let def of objdefs){
                    crend('option',def.name).on('click',() => {
                        console.log(def)
                    })
                }
            end()
            selectel.selectedIndex = objdefs.findIndex(o => o._id == id)
            
            crend('br')
            crend('br')

            listview.render()
        endContext()
    end()
    endContext()
}