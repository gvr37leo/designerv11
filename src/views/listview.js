

class ListView{

    data = []
    metaAttributes = []

    init(){

    }

    async load(filter,sort){
        this.data = await query(filter,sort)
    }

    render(){
        cr('table',{style:'white-space:nowrap;'})
            cr('tr')
                for(var attribute of this.metaAttributes){
                    let datatype = deref(attribute.datatype)
                    if(datatype.name == 'json'){
                        continue
                    }
                    cr('th')
                        text(attribute.name)
                    end()
                }
            end()
    

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
        end()
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