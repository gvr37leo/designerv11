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
        await this.listview.load({parent:{"$eq":id}},{updatedAt:-1})
        this.entity = deref(id)
        if(this.entity == null){
            return
        }

        
        this.objdef = deref(this.entity.type)

        
        if(this.objdef == null){
            this.attributes = []
        }else{

            //backref attributes
            //find all pointer attributes that have a pointertype the same as your type
            //get the name of that attribute
            //find all entitys that have your id in that field
            //also check all proxy's to see if their ref field references you
            //can be made a lot faster if you make maps of all pointer fields
            var backrefattributes = entities.filter(e => e.datatype == namemap['pointer']._id && e.pointertype == this.entity.type)
            this.backrefentities = []
            for(var backrefattribute of backrefattributes){
                this.backrefentities.push(...entities.filter(e => e[backrefattribute.name] ==  this.entity._id)) 
            }
            

            this.attributes = getAttributes(this.objdef._id)
            this.attributes.sort((a,b) => a.order - b.order)
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
        if(this.entity == null){
            return
        }

        

        

        cr('div', {style:'background:#c8c8c8; border-radius:3px; padding:5px; min-width:500px;'})
            cr('div')
    
                // Define a function to handle saving logic
                async function saveObject() {
                    let res = {}
                    for (let valueretriever of valueretrievers){
                        let data = valueretriever()
                        res[data[0]] = data[1]
                    }
                    await update(res)
                    await refreshrerender()
                    toastr.success('Saved')
                }

                // Update the button click handler to use the saveObject function
                crend('button','Save',{class:'btn btn-primary'}).on('click', saveObject)
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
                        }else if(datatype.name == 'icon'){
                            cr('div',{style:'display:flex;align-items:center;'})
                                crend('i','',{class:`iconoir-${this.entity[attribute.name]}`,style:'font-size:32px'})
                                crend('button','pick icon',{}).on('click',() => {
                                    openDialog(() => {
                                        let page = 0
                                        let filterediconnames = iconnoirnames
                                        crend('button','prev',{}).on('click',() => {
                                            page--
                                            rendericons()
                                        })
                                        crend('button','next',{}).on('click',() => {
                                            page++
                                            rendericons()
                                        })

                                        crend('input','',{placeholder:"search icons..."}).on('input',(e) => {
                                            filterediconnames = iconnoirnames.filter(n => n.includes(e.target.value))
                                            page = 0
                                            rendericons()
                                        })
                                        var iconscontainer = crend('div','',{id:'iconscontainer',style:"display:flex; flex-wrap:wrap;"})
                                        rendericons()
                                        function rendericons(){
                                            iconscontainer.innerHTML = ''
                                            startContext(iconscontainer)
                                            let start = page * 100
                                            let end2 = start + 100
                                            for(let icon of filterediconnames.slice(start,end2)){
                                                cr('span',{style:"border:1px solid black; border-radius:3px; padding:5px; margin:5px; display:flex; align-items:center; cursor:pointer;",}).on('click',() => {
                                                    iconinput.value = icon
                                                    closeDialog()
                                                })
                                                    crend('i','',{class:`iconoir-${icon}`,style:'font-size:32px'})
                                                    crend('span',icon)
                                                end()
                                            }
                                            endContext()
                                        }
                                    })
                                })
                                let iconinput = crend('input','',{value:this.entity[attribute.name]})
                            end()
                            valueretrievers.push(() => {
                                return [attribute.name,iconinput.value]
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
                                    crend('button','select',{'data-bs-toggle':'dropdown',style:"border-top-right-radius:0px;border-bottom-right-radius:0px;",type:'button',class:'btn btn-secondary dropdown-toggle'})
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
                                let input = crend('input','',{value:value ?? '',class:'form-control',name:attribute.name})
                            end()


                            
                            valueretrievers.push(() => {
                                let value = input.value
                                if(value == 'null' || value == ''){
                                    value = null
                                }
                                return [attribute.name,parseInt(value)]
                            })
                        }else if(datatype.name == 'number'){
                            let input = crend('input','',{type:'number',name:attribute.name,value:value,class:'form-control'})
                            valueretrievers.push(() => {
                                return [attribute.name,input.valueAsNumber]
                            })
                        }else if(datatype.name == 'text'){
                            let input = crend('input','',{value:value,name:attribute.name,class:'form-control'})
                            valueretrievers.push(() => {
                                return [attribute.name,input.value]
                            })
                        }else if(datatype.name == 'date'){
                            let input = crend('input','type',{type:'datetime-local',name:attribute.name,class:'form-control'})
                            input.valueAsNumber = value
                            valueretrievers.push(() => {
                                return [attribute.name,input.valueAsNumber]
                            })
                        }else if(datatype.name == 'boolean'){
                            let input = crend('input','',{type:'checkbox',name:attribute.name,class:'form-check-input'})
                            input.checked = value
                            valueretrievers.push(() => {
                                return [attribute.name,input.checked]
                            })
                        }else if(datatype.name == 'json'){
                            let input = crend('textarea',JSON.stringify(value,null,2),{class:'form-control',name:attribute.name})
                            valueretrievers.push(() => {
                                try {
                                    return [attribute.name,JSON.parse(input.value)]
                                } catch (error) {
                                    return [attribute.name,value]
                                }
                                
                            })
                        }else if(datatype.name == 'file'){
                            cr('div')
                                let filenameinput = crend('input','',{value:value,name:attribute.name,style:"display:block;"})
                                var fileobject = deref(value)
                                var filename = fileobject?.name
                                if(filename){
                                    if(['png','jpeg','jpg'].some(s => s == last(filename?.split('.')))){
                                        crend('img','',{src:`/api/download/${fileobject?.nameondisk}`,style:"max-width:300px;max-height:300px;display:block;"})
                                    }
                                    cr('div')
                                        crend('div',filename)
                                        crend('a','Download',{href:`/api/download/${fileobject?.nameondisk}`,download:true})
                                    end()
                                }else{
                                    crend('div',"file not found")
                                }
                                let uploadinput = crend('input','',{type:'file'})
                                uploadinput.on('change',() => {
                                    var formdata = new FormData()
                                    formdata.append("file",uploadinput.files[0])
                                    fetch('/api/upload',{
                                        method:"POST",
                                        headers:{},
                                        body:formdata,
                                    }).then(res => res.json())
                                    .then(async data => {
                                        var files = await touch('files')
                                        var response = await createOne({
                                            _id:parseInt(data.filename),
                                            parent:files._id,
                                            name:data.originalname,
                                            nameondisk:data.filename,
                                            mimetype:data.mimetype,
                                            size:data.size,
                                            type:(await queryOne({name:"fileobjdef"}))._id
                                        })
                                        filenameinput.value = response.insertedIds[0]
                                        await update({
                                            _id:this.entity._id,
                                            [attribute.name]:response.insertedIds[0],
                                        })
                                        refreshrerender()
                                        
                                    })
                                })
                                // crend('a','download',{download:value,href:`/api/download/${fileobject.nameondisk}`})
                            end()
                            valueretrievers.push(() => {
                                return [attribute.name,filenameinput.value]
                            })
                        }else if(datatype.name == 'array'){
                            let input = crend('input','',{})
                            input.value = value ?? ''
                            valueretrievers.push(() => {
                                return [attribute.name,input.value.split(',')]
                            })
                        }else if(datatype.name == 'multiplechoice'){
                            let input = cr('select')
                                crend('option','',{})
                                for(var option of attribute?.options ?? []){
                                    crend('option',option,{})
                                }
                            end()
                            input.value = value
                            valueretrievers.push(() => {
                                return [attribute.name,input.value]
                            })
                        }else if(datatype.name == 'color'){
                            let input = crend('input','',{type:'color'})
                            input.value = value
                            valueretrievers.push(() => {
                                return [attribute.name,input.value]
                            })
                        }else if(datatype.name == 'fileself'){
                            crend('button','delete self and file on disk').on('click',() => {
                                fetch(`/api/deletefile/${this.entity.nameondisk}`,{
                                    method:"DELETE",
                                    headers:{},
                                }).then(res => res.text()).then(async data => {
                                    await removeID(this.entity._id)
                                    router.navigateID(this.entity.parent)
                                    refreshrerender()
                                })
                            })
                            crend('img','',{src:`/api/download/${this.entity.nameondisk}`,style:"max-width:300px;max-height:300px;display:block;"})
                        }else{
                            crend('div','datatype not found')
                        }
                    end()
                }
                crend('br')
                let textarea = crend('textarea',JSON.stringify(this.entity,null,2),{rows:10,class:'form-control',name:"raw json data"})
                crend('br')
                crend('button','save textarea',{class:'btn btn-primary'}).on('click',async () => {
                    let data = JSON.parse(textarea.value)
                    await update(data)
                    await refreshrerender()
                })

                cr('div')
                    crend('h2','backrefs')
                    for(var backref of this.backrefentities){
                        cr('div')
                        crend('a',backref.name,{href:`/detail/${backref._id}`})
                        end()
                    }
                end()
                
            end()
        end()

        // Add a keyboard shortcut for saving the object
        // document.addEventListener('keydown', async (event) => {
        //     if (event.ctrlKey && event.key === 's') { // Ctrl+S shortcut
        //         event.preventDefault(); // Prevent the default browser save action
        //         await saveObject();
        //     }
        // });

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
        cr('div',{style:'background:white; border-radius:3px; padding:5px;'})
            // cr('div',{style:'display:flex;gap:10px;'})
            //     for(let name of names){
            //         crend('button',name,{class:'btn btn-primary'}).on('click',async () => {
            //             let query = {[name]:this.entity._id}
            //             listviewcontainer.innerHTML = ''
            //             await this.listview.load(query,{updatedAt:-1})
            //             startContext(listviewcontainer)
            //             this.listview.render()
            //             endContext()
            //         })
            //     }
            // end()
            let listviewcontainer = cr('div')
                this.listview.render()
                
                // listview({parent:entity._id},{updatedAt:'desc'})
            end()
        end()
        //now that we have the names of all the fields that could point towards us we can make a query for each of them
        // like this {<nameofattribute>:entity._id}
        
    }
}

function getAttributes(objdefid){
    let objdef = deref(objdefid)
    let result = getChildrenOfType(objdefid,'attribute').slice()
    if(objdef.extends){
        result.push(...getChildrenOfType(objdef.extends,'attribute'))
    }
    result.sort((a,b) => a.order - b.order)
    return result
}

function deref(id){
    // var obj = idmap[id]
    // if(obj.autoderef == true){
    //     return deref(obj.ref)
    // }
    // return obj
    return idmap[id]
}

function getchildren(id){
    if(groupparent[id]){
        return groupparent[id].slice()
    }else{
        return []
    }
}

function getChildrenOfType(id,type){
    var children = getchildren(id)
    return children.filter(c => c.type == namemap[type]._id)
}

function isType(item,type){
    if(item.type){
        return getType(item) == type
    }
    return false
}

function getType(item){
    return deref(item.type).name
}

function getDescendants(id){
    let children = getchildren(id)
    for(var child of children){
        let descs = getDescendants(child._id)
        children.push(...descs)
    }
    return children
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

function updateOrder(nodeid){
    //all children below a node should have an increasing order number
    //this should work recursively and update the entire tree below the ndoe
    let children = getchildren(nodeid)
    
    // Sort children by current order to preserve relative ordering
    children.sort((a, b) => (a.order || 0) - (b.order || 0))
    
    let start = Math.floor(children[0].order)
    // Assign sequential order numbers
    for (let i = 0; i < children.length; i++) {
        let x = start + i
        children[i].order = x
        update(children[i])
    }
    
    // Recursively update order for each child's descendants
    // for (let child of children) {
    //     updateOrder(child._id)
    // }
}

