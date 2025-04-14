
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

    
        cr('div',{style:'background:white; border-radius:3px; margin-left: 10px; padding:5px;'})
            for(var item of roots){
                let treennode2 = new Treenode(item,this.collapsemap,this.treemap)
                this.treemap[item._id] = treennode2
                treennode2.render()
            }
        end()
    
        let path = getancestorpath(current._id)
        for(var item of path){
            this.treemap[item._id].open()
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

    constructor(item,collapsemap,treemap){
        this.item = item
        this.collapsemap = collapsemap
        this.treemap = treemap

        
    }

    
    open(){
        let children = getchildren(this.item._id)
        if(children.length > 0){
            this.arrowspan.innerHTML = this.icondown
        }
        this.childrencontainer.style.display = 'block'
        this.collapsemap[this.item._id] = 'open'

        
        localStorage.setItem('collapsemap',JSON.stringify(this.collapsemap))
    }

    collapse(){
        let children = getchildren(this.item._id)
        if(children.length > 0){
            this.arrowspan.innerHTML = this.iconright
        }
        this.childrencontainer.style.display = 'none'
        this.collapsemap[this.item._id] = 'collapsed'
        localStorage.setItem('collapsemap',JSON.stringify(this.collapsemap))
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

        children.sort((a,b) => a.order - b.order)
        cr('div')
            cr('div',{style:'display:flex; height:21px;'})
                //kan dit op een sjiekere manier?
                // <i class="bi bi-car-front-fill"></i>
                this.arrowspan = crend('span','',{style:'display:inline-block; width:16px; height:16px;'})
                this.arrowspan.on('click',() => {
                    this.toggle()
                })
                var {icon,iconcolor} = deref(item.type)
                crend('i','',{class:`bi ${icon}`,style:`color:${iconcolor};width:16px; height:16px; margin:0px 5px;`})
                
                var active = item._id == current._id
                if(item.type == namemap['proxy']._id){
                    var ref = deref(item.ref)
                    if(ref == null){
                        crend('a',item.name,{href:`/detail/${item._id}`,class:`${active ? 'highlight' : ''}`})
                    }else{
                        crend('a','*' + ref.name,{href:`/detail/${item._id}`,class:`${active ? 'highlight' : ''}`})
                    }
                }else{
                    crend('a',item.name,{href:`/detail/${item._id}`,class:`${active ? 'highlight' : ''}`})
                }

                dropdownMenu([
                    () => {
                        crend('button','new').on('click',async () => {
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
                        crend('button','delete').on('click',async () => {
                            await remove({_id:item._id})
                            await refresh()
                            router.navigateID(item.parent)
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
                                name:item.name,
                                parent:item.parent,
                                type:objdefmap['proxy']._id,
                                ref:item._id
                            })
                            await refreshrerender()
                        })
                    },
                    () => {
                        //list of buttons
                        //look at node's type, look at the objdef, look at the pointer objdefs below
                        //these are the allowed types
                        //foreach create a button that quickly generates an item with this type
                        let objef = deref(item.type)

                        let allowedtypes = getchildren(objef._id).filter(c => c.type == namemap['proxy']._id).map(p => deref(p.ref))

                        cr('div',{style:'display:flex; flex-direction:column;'})
                            for(let type of allowedtypes){
                                crend('button',type.name).on('click',async () => {
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
                    }
                ])
            end()
            

            this.childrencontainer = cr('div',{style:'padding-left:10px;'})
                for(var child of children){
                    let treennode2 = new Treenode(child,this.collapsemap,this.treemap)
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

function treenode(item){

    
}




function dropdownMenu(cbs){
    // https://getbootstrap.com/docs/5.3/components/dropdowns/#overview


    cr('div',{class:'dropdown hover'})
        crend('button','...',{class:'btn btn-primary dropdown-toggle',type:'button',"data-bs-toggle":'dropdown'})
        cr('ul',{class:'dropdown-menu'})
            for(var cb of cbs){
                cr('li')
                    cr('a',{class:'dropdown-item'})
                        cb()
                    end()
                end()
            }
        end()
    end()

    // <div class="dropdown">
    //     <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    //         Dropdown button
    //     </button>
    //     <ul class="dropdown-menu">
    //         <li><a class="dropdown-item" href="#">Action</a></li>
    //         <li><a class="dropdown-item" href="#">Another action</a></li>
    //         <li><a class="dropdown-item" href="#">Something else here</a></li>
    //     </ul>
    // </div>
}

// function dropdownMenu(cbs){
//     // https://getbootstrap.com/docs/5.3/components/dropdowns/#overview

//     cr('span',{style:'position:relative;',class:'hover'})
//         crend('button','...',{style:''}).on('click',() => {
//             if(container.style.display == 'none'){
//                 container.style.display = 'flex'
//             }else{
//                 container.style.display = 'none'
//             }
//         })
//         let container = cr('div',{style:'display:none; position:absolute; z-index:1; flex-direction:column;left:0px;'})
//             for(let cb of cbs){
//                 cb()
//             }
//         end()
//     end()
// }