

class DetailView{

    entity
    listview
    objdef
    attributes

    constructor(){
        this.listview = new ListView()
    }
    
    init(){

    }

    async load(id){
        this.listview.metaAttributes = getchildren(namemap['entity']._id)
        await this.listview.load({parent:id},{updatedAt:-1})
        this.entity = deref(id)

        
        this.objdef = deref(this.entity.type)

        if(this.objdef == null){
            this.attributes = []
        }else{
            this.attributes = getchildren(this.objdef._id).slice()
            if(this.objdef.extends){
                let parentobjdef = idmap[this.objdef.extends]
                let parentattributes = groupparent[parentobjdef._id]
                this.attributes.push(...parentattributes)
            }

            let copylist = []
            for(var attribute of this.attributes){
                copylist.push(attribute)
                if(attribute.datatype != namemap['pointer']._id){
                    continue
                }

                let value = this.entity[attribute.name]
                let item = deref(value)
                if(item == null){
                    continue
                }

                if(item.type == namemap['datatypeobjdef']._id){
                    let children = getchildren(item._id)
                    copylist.push(...children)
                }
            }
            this.attributes = copylist
            //if the value of a pointer field points towards something with attribute children and the thing is of type datatype
            // than add this attribute
            // duplication in the metameta attributes where parent also points towards the thing
        }
    }

    render(){
        cr('div')
            cr('div')
    
                crend('button','update',{class:'btn btn-primary'}).on('click',async () => {
                    let res = {}
                    for(let valueretriever of valueretrievers){
                        let data = valueretriever()
                        res[data[0]] = data[1]
                    }
                    await update(res)
                    await refreshrerender()
                })
            end()
            
    
            let valueretrievers = []
            cr('div')
                for(let attribute of this.attributes){
                    let datatype = idmap[attribute.datatype]
                    if(datatype == null){
                        continue
                    }

                    let value = this.entity[attribute.name]
                    cr('div')
                        crend('div',attribute.name,{style:'font-weight:bold;'})
                        if(datatype.name == 'id'){
                            crend('div',value)
                            valueretrievers.push(() => {
                                return [attribute.name,value]
                            })
                        }else if(datatype.name == 'pointer'){
                            // deref to the name
                            let dereffedobj = idmap[value]
                            let link = crend('a',dereffedobj?.name,{href:`/detail/${value}`})
                            cr('div',{class:'input-group'})
                                let options = []
                                if(deref(attribute.tree) != null){
                                    options = getchildren(attribute.tree)
                                }else{
                                    options = search(entities,{type:attribute.pointertype})
                                }
                                cr('div',{class:'dropdown'})
                                    crend('button','select',{'data-bs-toggle':'dropdown',type:'button',class:'btn btn-secondary dropdown-toggle'})
                                    cr('lu',{class:'dropdown-menu'})
                                        for(let option of options){
                                            cr('li')
                                                crend('a',option.name,{class:'dropdown-item'}).on('click',() => {
                                                    input.value = option._id
                                                    link.innerText = option.name
                                                    link.href = `/detail/${option._id}`
                                                })
                                            end()
                                        }
                                    end()
                                end()
                                let input = crend('input','',{value:value,class:'form-control'})
                            end()


                            
                            valueretrievers.push(() => {
                                let value = input.value
                                if(value == 'null' || value == ''){
                                    value = null
                                }
                                return [attribute.name,parseInt(value)]
                            })
                        }else if(datatype.name == 'number'){
                            let input = crend('input','',{type:'number',value:value,class:'form-control'})
                            valueretrievers.push(() => {
                                return [attribute.name,input.valueAsNumber]
                            })
                        }else if(datatype.name == 'text'){
                            let input = crend('input','',{value:value,class:'form-control'})
                            valueretrievers.push(() => {
                                return [attribute.name,input.value]
                            })
                        }else if(datatype.name == 'date'){
                            let input = crend('input','type',{type:'datetime-local',class:'form-control'})
                            input.valueAsNumber = value
                            valueretrievers.push(() => {
                                return [attribute.name,input.valueAsNumber]
                            })
                        }else if(datatype.name == 'boolean'){
                            let input = crend('input','',{type:'checkbox',class:'form-check-input'})
                            input.checked = value
                            valueretrievers.push(() => {
                                return [attribute.name,input.checked]
                            })
                        }else if(datatype.name == 'json'){
                            let input = crend('textarea',JSON.stringify(value,null,2),{class:'form-control'})
                            valueretrievers.push(() => {
                                try {
                                    return [attribute.name,JSON.parse(input.value)]
                                } catch (error) {
                                    return [attribute.name,value]
                                }
                                
                            })
                        }
                    end()
                }
                crend('br')
                let textarea = crend('textarea',JSON.stringify(this.entity,null,2),{style:'width:250px;height:200px;',class:'form-control'})
                crend('br')
                crend('button','update textarea',{class:'btn btn-primary'}).on('click',async () => {
                    let data = JSON.parse(textarea.value)
                    await update(data)
                })
            end()
        end()
        // listview
    
        //find all the objects that point towards me
        //the fields that can point towards me can be identified by the pointertype field
    
        
        let pointernode = namemap['pointer']
        let entityobjdef = namemap['entity']
        let allattributes = typegroups[namemap['attribute']._id]
    
        //find the attribute nodes that have a datatype of pointer and a pointertype that points towards this entity's objdef or to the entity objdef

        let attributes = []
        if(this.objdef != null){
            attributes = allattributes.filter((e) => {
                return e.datatype == pointernode._id && (e.pointertype == this.objdef._id || e.pointertype == entityobjdef._id)
            })
        }
        let names = attributes.map(a => a.name)
        cr('div')
            cr('div',{style:'display:flex;gap:10px;'})
                for(let name of names){
                    crend('button',name,{class:'btn btn-primary'}).on('click',async () => {
                        let query = {[name]:this.entity._id}
                        listviewcontainer.innerHTML = ''
                        await this.listview.load(query,{updatedAt:-1})
                        startContext(listviewcontainer)
                        this.listview.render()
                        endContext()
                    })
                }
            end()
            let listviewcontainer = cr('div')
                this.listview.render()
                // listview({parent:entity._id},{updatedAt:'desc'})
            end()
        end()
        //now that we have the names of all the fields that could point towards us we can make a query for each of them
        // like this {<nameofattribute>:entity._id}
        
    }
}

function deref(id){
    return idmap[id]
}

function getchildren(id){
    if(groupparent[id]){
        return groupparent[id]
    }else{
        return []
    }
}

function getancestorpath(id){
    let result = []
    let current = deref(id)
    while(current != null){
        result.push(current)
        current = deref(current.parent)
    }
    return result
}


