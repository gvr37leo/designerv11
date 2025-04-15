

//filter
//gt,lt,equals,gte,lte,like
//sort

class ListView{

    data = []
    metaAttributes = []
    filtermap = {}
    opmap = {}
    sortmap = {}
    anchor
    filterset

    async load(filter,sort){
        this.data = await query(filter,sort)
        this.filterset = {filter,sort}
    }

    async reload(){
        var {filter,sort} = this.exportfilter()
        await this.load(filter,sort)
        this.renderbody()
    }

    //call this after load
    importfilter(filter){//put filter into html inputs
        for(var attribute of this.metaAttributes){
            if(this.opmap[attribute.name] == undefined){
                continue
            }
            if(filter.filter[attribute.name] != undefined){
                //op and val should be key and value
                // parent : {eq: 35434766}
                for(var key in filter.filter){
                    var value = filter.filter[key]
                    var op = Object.keys(value)[0]
                    var filterval = value[op]
                    this.opmap[attribute.name].value = op;
                    this.filtermap[attribute.name].value = filterval;
                }
            }

            if(filter.sort[attribute.name] != undefined){
                this.sortmap[attribute.name].value = filter.sort[attribute.name];
            }
        }
    }

    //call this after an input has changed, or when you click apply filter
    exportfilter(){
        var res = {
            filter:{},
            sort:{},
        }

        for(var attribute of this.metaAttributes){
            if(isEmpty(this.opmap[attribute.name]?.value)){
                continue
            }
            res.filter[attribute.name] = {
                [this.opmap[attribute.name].value]:tryparsefloat(this.filtermap[attribute.name].value)
            }
        }

        for(var attribute of this.metaAttributes){
            if(isEmpty(this.sortmap[attribute.name]?.value)){
                continue
            }
            res.sort[attribute.name] = tryparsefloat(this.sortmap[attribute.name].value)
        }

        //filter away empty fields
        for(var key in res.filter){
            for(var op in res.filter[key]){
                if(op == '' || res.filter[key][op] == ''){
                    delete res.filter[key]
                }
            }
        }


        let urlparam = encodeURIComponent(JSON.stringify(res)) 
        let original = JSON.parse(decodeURIComponent(urlparam))
        console.log(original)

        return res
    }

    

    render(){

        //after filter change, rerender body
        //after node change rerender all

        // crend('button','exportfilter').on('click',() => {
        //     let out = this.exportfilter()
        //     console.log(out)
        // })

        // crend('button','importfilter').on('click',() => {
        //     this.importfilter({
        //         filter:{
        //             _id:{
        //                 op:'$gt',
        //                 val:'12',
        //             }
        //         },
        //         order:{
        //             _id:'asc'
        //         },
        //     })
        // })

        cr('table',{style:'white-space:nowrap;'})
            //should create 2 containers to render into
            this.headcontainer = cr('thead')
                this.renderhead()
            end()
            this.bodycontainer = cr('tbody')
                this.renderbody()
            end()
        end()
        this.importfilter(this.filterset)
    }


    renderhead(){
        this.filtermap = {}
        this.opmap = {}
        this.sortmap = {}
        cr('tr')
            for(var attribute of this.metaAttributes){
                let datatype = deref(attribute.datatype)
                if(datatype.name == 'json'){
                    continue
                }
                cr('th',{style:""})
                    text(attribute.name)

                    let orderselect = cr('select',{})
                        crend('option','',{value:''})
                        crend('option','asc',{value:'1'})
                        crend('option','desc',{value:'-1'})
                    end()
                    this.sortmap[attribute.name] = orderselect
                    orderselect.on('change',() => {
                        this.reload()
                    })
                end()
            }
        end()
        
        
        cr('tr')
            for(var attribute of this.metaAttributes){
                let datatype = deref(attribute.datatype)
                if(datatype.name == 'json'){
                    continue
                }
                cr('th')
                    let opselect = cr('select',{})
                    opselect.on('change',() => {
                        this.reload()
                    })
                    this.opmap[attribute.name] = opselect
                        crend('option','',{value:''})
                        crend('option','>',{value:'$gt'})
                        crend('option','<',{value:'$lt'})
                        crend('option','==',{value:'$eq'})
                        crend('option','!=',{value:'$neq'})
                        crend('option','>=',{value:'$gte'})
                        crend('option','<=',{value:'$lte'})
                        crend('option','regex',{value:'$regex'})
                    end()
                    crend('br')
                    let textinput = crend('input','',{})
                    textinput.on('change',() => {
                        this.reload()
                    })
                    this.filtermap[attribute.name] = textinput
                end()
            }
        end()
    }

    renderbody(){
        this.bodycontainer.innerHTML = ''
        startContext(this.bodycontainer)
        for(let entity of this.data){
            cr('tr',{style:'height:21px;'})
                for(let attribute of this.metaAttributes){
                    let datatype = deref(attribute.datatype)
                    if(datatype == null){
                        continue   
                    }
                    cr('td')
                        let value = entity[attribute.name]

                        if(datatype.name == 'id'){
                            crend('a',entity[attribute.name],{href:`/detail/${value}`})
                            // crend('div').on('click',() => {
                            //     window.location.href = `/detail/${value}`
                            //     // router.navigate(`/detail/${value}`)
                            // })
                        }else if(datatype.name == 'pointer'){
                            // deref to the name
                            let dereffedobj = idmap[value]
                            crend('a',dereffedobj?.name ?? 'null',{href:`/detail/${value}`})
                        }else if(datatype.name == 'number'){
                            crend('div',value)
                        }else if(datatype.name == 'text'){
                            crend('div',value)
                        }else if(datatype.name == 'date'){
                            crend('div',new Date(value).toLocaleString())
                        }else if(datatype.name == 'boolean'){
                            crend('div',value)
                        }else if(datatype.name == 'json'){
                            //nothing
                        }
                    end()
                }
            end()
        }
        endContext()
    }

}
//filter?
function listview(filter,order){
    //filter
    //order

    // list



}

function search(arr,query){
    return arr.filter(e => {
        for(var key in query){
            if(e[key] != query[key]){
                return false
            }
        }
        return true
    })
}

function mapify(arr,key){
    var res = {}
    for(var item of arr){
        res[item[key]] = item
    }
    return res
}

function tryparsefloat(val){
    let res = parseFloat(val)
    if(isNaN(res)){
        return val
    }else{
        return res
    }
}

function groupby(arr,key){
    var res = {}
    for(var item of arr){
        if(res[item[key]] == null){
            res[item[key]] = [item]
        }else{
            res[item[key]].push(item)
        }
    }
    return res
}

function isEmpty(val){
    return val == null || val == undefined || val == ''
}