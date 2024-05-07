
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

    
        cr('div')
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

    constructor(item,collapsemap,treemap){
        this.item = item
        this.collapsemap = collapsemap
        this.treemap = treemap
    }

    open(){
        let children = getchildren(this.item._id)
        if(children.length > 0){
            this.arrowspan.innerHTML = '▼'
        }
        this.childrencontainer.style.display = 'block'
        this.collapsemap[this.item._id] = 'open'

        
        localStorage.setItem('collapsemap',JSON.stringify(this.collapsemap))
    }

    collapse(){
        let children = getchildren(this.item._id)
        if(children.length > 0){
            this.arrowspan.innerHTML = '▶'
        }
        this.childrencontainer.style.display = 'none'
        this.collapsemap[this.item._id] = 'collapsed'
        localStorage.setItem('collapsemap',JSON.stringify(this.collapsemap))
    }

    toggle(){
        if(this.arrowspan.innerHTML == '▶'){
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

                this.arrowspan = crend('span','',{style:'display:inline-block;width:16px; height:16px;'})
                this.arrowspan.on('click',() => {
                    this.toggle()
                })
                
                
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


//text,callback
function dropdownMenu(cbs){

    cr('span',{style:'position:relative;',class:'hover'})
        crend('button','...',{style:''}).on('click',() => {
            if(container.style.display == 'none'){
                container.style.display = 'flex'
            }else{
                container.style.display = 'none'
            }
        })
        let container = cr('div',{style:'display:none; position:absolute; z-index:1; flex-direction:column;left:0px;'})
            for(let cb of cbs){
                cb()
            }
        end()
    end()
}