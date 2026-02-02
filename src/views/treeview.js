class Treeview{
    collapsemap = {}
    treemap = {}

    constructor(){
        try {
            this.collapsemap = JSON.parse(localStorage.getItem('collapsemap') ?? '')
        } catch (error) {
            this.collapsemap = {}            
        }
    }

    render(){
            
        var roots = entities.filter(e => e.parent == null)
        roots.sort((a,b) => a.order - b.order)

    
        cr('div',{style:'background:#c8c8c8; border-radius:3px; margin-left: 10px; padding:5px;'})
            for(var item of roots){
                let treennode2 = new Treenode(item,this.collapsemap,this.treemap,[])
                this.treemap[item._id] = treennode2
                treennode2.render()
            }
        end()
    
        if(current){
            let path = getancestorpath(current._id)
            for(var item of path){
                this.treemap[item._id].open()
            }
        }
    }
}

class Treenode{
    
    arrowspan
    childrencontainer
    collapsemap
    item
    treemap
    iconright = '<i class="bi bi-arrow-right-square" ></i>'
    icondown = '<i class="bi bi-arrow-down-right-square"></i>'
    allowedRoles = []

    constructor(item,collapsemap,treemap,allowedRoles){
        this.item = item
        this.collapsemap = collapsemap
        this.treemap = treemap
        this.allowedRoles = allowedRoles.slice()
        this.allowedRoles.push(...getChildrenOfType(item._id,'right').map(r => deref(r?.role)?.name)) 
        
    }

    
    open(){
        try {
            let children = getchildren(this.item._id)
            if(children.length > 0){
                this.arrowspan.innerHTML = this.icondown
            }
            this.childrencontainer.style.display = 'block'
            this.collapsemap[this.item._id] = 'open'
            localStorage.setItem('collapsemap',JSON.stringify(this.collapsemap))
        } catch (error) {
            
        }
    }

    collapse(){
        try {
            let children = getchildren(this.item._id)
            if(children.length > 0){
                this.arrowspan.innerHTML = this.iconright
            }
            this.childrencontainer.style.display = 'none'
            this.collapsemap[this.item._id] = 'collapsed'
            localStorage.setItem('collapsemap',JSON.stringify(this.collapsemap))
        } catch (error) {
            
        }
    }

    toggle(){
        if(this.childrencontainer.style.display == 'none'){
            this.open()
        }else{
            this.collapse()
        }
    }

    render(){
        let item = this.item
        var children = getchildren(item._id)

        //authorization
        //get current user role
        //get the rights for this node
        //go up ancestors until match found
        //if not then dont render

        //start at the root, at each step keep track of what roles and rights are active/necessary
        //at each node check if user hat that right

        //getloggedinuser
        //getrole
        var allowedToSee = false
        var currentrole = getcurrentRole()
        if(this.allowedRoles.includes(currentrole)){
            allowedToSee = true
        }



        children.sort((a,b) => a.order - b.order)
        cr('div')
            if(allowedToSee){
                let draggableel = cr('div',{style:'display:flex; height:21px; align-items:center;',draggable:true})
                    draggableel.on('dragstart',(e) => {
                        e.dataTransfer.setData('text/plain', e.target.id);
                        e.dataTransfer.dropEffect = 'move'
                        window.draggingelement = this
                    })
                    draggableel.on('dragover',(e) => {
                        if(window.draggingelement.item._id != this.item._id){
                            e.preventDefault()
                        }
                    })
                    draggableel.on('drop',async (e) => {
                        await update({
                            _id:window.draggingelement.item._id,
                            parent:this.item._id,
                        })
                        await refreshrerender()
                    })
                    //kan dit op een sjiekere manier?
                    // <i class="bi bi-car-front-fill"></i>
                    this.arrowspan = crend('span','',{style:'display:flex; align-items:center; width:16px; height:16px;'})
                    this.arrowspan.on('click',() => {
                        this.toggle()
                    })
                    if(item.type){
                        if(isType(item,'proxy')){
                            var {icon,iconcolor} = deref(deref(item?.ref)?.type)
                        }else{
                            var {icon,iconcolor} = deref(item.type)
                        }
                        crend('i','',{class:`iconoir-${icon}`,style:`color:${iconcolor};width:16px; height:16px; margin:0px 5px;`})
                    }
                    
                    var active = item._id == current?._id
                    if(item.type == namemap['proxy']._id){
                        var ref = deref(item.ref)
                        if(ref == null){
                            crend('a',item.name,{href:`/detail/${item._id}`,class:`${active ? 'highlight' : ''}`})
                        }else{
                            //make the * a unique link which you can click to select and highlight the referenced object
                            crend('a','*' + ref.name,{href:`/detail/${item._id}`,class:`${active ? 'highlight' : ''}`})
                        }
                    }else{
                        crend('a',item.name,{href:`/detail/${item._id}`,class:`${active ? 'highlight' : ''}`,style:"overflow:hidden; white-space: nowrap;"})
                    }
    
                    dropdownMenu([
                        () => {
                            crend('button','new entity').on('click',async () => {
                                await createOne({
                                    _id:null,
                                    name:'new entity',
                                    parent:item._id,
                                    type:objdefmap['entity']._id,
                                })
                                await refreshrerender()
                            })
                        },
                        () => {
                            var objdef = deref(item.type)
    
                            let allowedtypes = []
                            if(objdef.name == 'container'){
                                allowedtypes.push(deref(item.containertype))
                            }else{
                                var container = getchildren(objdef._id).find(obj => obj.name == 'allowedtypes')
                                if(container != null){
                                    allowedtypes = getchildren(container._id).map(obj => deref(obj.ref))
                                }
                            }
    
                            //if list is empty, just show the new button
                            //else only show this list
                            allowedtypes = allowedtypes.filter(type => type != null)
                            for(let type of allowedtypes){
                                crend('button',`new ${type.name}`).on('click',async () => {
                                    await createOne({
                                        _id:null,
                                        name:`new ${type.name}`,
                                        parent:item._id,
                                        type:type._id,
                                    })
                                    await refreshrerender()
                                })
                            }
                            
                        },
                        () => {
                            crend('button','delete').on('click',async () => {
                                if(confirm(`are you sure you want to delete ${item.name}`)){
                                    await remove({_id:item._id})
                                    await refresh()
                                    router.navigateID(item.parent)
                                }
                            })
                        },
                        () => {
                            crend('button','copy id').on('click',async () => {
                                navigator.clipboard.writeText(item._id)
                            })
                        },
                        () => {
                            crend('button','copy').on('click',async () => {
                                navigator.clipboard.writeText(JSON.stringify(item))
                            })
                        },
                        () => {
                            crend('button','paste').on('click',async () => {
                                var text = await navigator.clipboard.readText()
                                var object = JSON.parse(text)
                                object.parent = item._id
                                delete object._id
                                await createOne(object)
                                await refreshrerender()
                            })
                        },
                        () => {
                            crend('button','duplicate').on('click',async () => {
                                //duplicate the current item
                                var copy = {
                                    ...item
                                }
                                delete copy._id
                                await createOne(copy)
                                await refreshrerender()
                            })
                        },
                        () => {
                            crend('button','move').on('click',async () => {
                                // var text = await navigator.clipboard.readText()
                                await update({_id:item._id, parent:current._id})
                                await refreshrerender()
                            })
                        },
                        () => {
                            crend('button','create proxy').on('click',async () => {
                                // var text = await navigator.clipboard.readText()
                                await createOne({
                                    _id:null,
                                    name:'proxy' + item.name,//giving it the exact same name can give issues with the namemap
                                    parent:item.parent,
                                    type:objdefmap['proxy']._id,
                                    ref:item._id
                                })
                                await refreshrerender()
                            })
                        },
                        () => {
                            let proxy = deref(item._id)
                            if(proxy.ref == null){
                                return
                            }
                            var ref = deref(proxy.ref)
                            if(ref == null){
                                return
                            }
                            crend('button','break link').on('click',async () => {
                                //delete the proxy
                                //replace it with a new object with the same data as the referenced object
                                //but keep the parent and id of the proxy
                                await removeID(proxy._id)
                                await createOne({
                                    ...ref,
                                    _id:proxy._id,
                                    parent:proxy.parent,
                                })
                                await refreshrerender()
                            })
                        },
                        () => {
                            //list of buttons
                            //look at node's type, look at the objdef, look at the pointer objdefs below
                            //these are the allowed types
                            //foreach create a button that quickly generates an item with this type
                            if(item.type == null){
                                return
                            }
                            let objef = deref(item.type)
    
                            // let allowedtypes = getchildren(objef._id).filter(c => c.type == namemap['proxy']._id).map(p => deref(p.ref)).filter
                            let allowedtypes = getChildrenOfType(objef._id,'proxy').map(c => deref(c.ref)).filter(c => c.type == namemap['objdef']._id)
    
                            cr('div',{style:'display:flex; flex-direction:column;'})
                                for(let type of allowedtypes){
                                    crend('button','create ' + type.name).on('click',async () => {
                                        await createOne({
                                            _id:null,
                                            name:'new entity',
                                            parent:item._id,
                                            type:type._id,
                                        })
                                        await refreshrerender()
                                    })
                                }
                            end()
                        },
                        () => {
                            if(deref(item.type)?.name == 'fileobjdef'){
                                crend('button','delete file').on('click',async () => {
                                    await fetch('/api/deletefile',{
                                        method:'DELETE',
                                        headers:{
                                            'Content-Type': 'application/json',
                                            'sessionid':getSessionId(),
                                        },
                                        body:JSON.stringify({
                                            filename:item.nameondisk,
                                        })
                                    }).then(res => res.json())
                                    await removeID(item._id)
                                    
                                    await refreshrerender()
                                })
                            }
                        },
                        () => {
                            crend('button','update order').on('click',async () => {
                                await updateOrder(item._id)
                                
                                await refreshrerender()
                            })
                            
                        }
                    ])
                end()
            }
            

            this.childrencontainer = cr('div',{style:'padding-left:10px;'})
                for(var child of children){
                    let treennode2 = new Treenode(child,this.collapsemap,this.treemap,this.allowedRoles)
                    this.treemap[child._id] = treennode2
                    treennode2.render()

                }
            end()

            if(this.collapsemap[item._id] == 'open'){
                this.open()
            }else{
                this.collapse()
            }
        end()
    }

}





function dropdownMenu(cbs){
    // https://getbootstrap.com/docs/5.3/components/dropdowns/#overview
    cr('div',{style:'margin-left:5px;'})
        crend('button','...',{class:"hover"}).on('click',() => {
            toggle(dropcontent)
        })
        let dropcontent = cr('div',{class:'dropdown-content',style:"display:none;"})
            cr('div',{style:"background:white; display:flex; gap:10px; flex-direction:column; position:absolute;z-index:3; padding:10px; border:1px solid black; border-radius:5px;"})
                for(var cb of cbs){
                    cr('span',{class:''})
                        cb()
                    end()
                }
            end()
        end()

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!dropcontent.contains(event.target) && event.target !== dropcontent.previousSibling) {
                dropcontent.style.display = 'none';
            }
        })
    end()
}

function toggle(element){
    if(element.style.display == 'none'){
        element.style.display = 'block'
    }else{
        element.style.display = 'none'
    }
}