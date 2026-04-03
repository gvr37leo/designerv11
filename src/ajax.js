// async function createMany(data){
//     return fetch('/api/create',{
//         method:'POST',
//         headers:{
//             'Content-Type': 'application/json',
//             'sessionid':getSessionId(),
//         },
//         body:JSON.stringify(data)
//     }).then(async res => {
//         if(res.ok){
//             return true
//         }else{
//             var data = await res.json()
//             throw new Error(data.error)
//         }
//     }).catch((reason) => {
//         toastr.error('Error', reason)
//     })
// }

async function createOne(data){
    return fetch('/api/create',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify(data)
    }).then(async res => {
        if(res.ok){
            return true
        }else{
            var data = await res.json()
            throw new Error(data.error)
        }
    }).catch((reason) => {
        toastr.error('Error', reason)
    })
}

async function query(query,sort,derefs = []){
    return fetch('/api/query',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify({filter:query,sort:sort,derefs:derefs})
    }).then(res => res.json()).catch((reason) => {
        toastr.error('Error', reason)
    })
}

async function getById(id){
    return await queryOne({_id:id})
}

async function pathsearch(path){
    return fetch('/api/pathsearch',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify({path:path})
    }).then(res => res.json()).catch((reason) => {
        toastr.error('Error', reason)
    })
}

async function gettree(nodeid,depth){
    return fetch('/api/gettree',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify({id:nodeid,depth:depth})
    }).then(res => res.json()).catch((reason) => {
        toastr.error('Error', reason)
    })
}

async function queryOne(querydata){
    var res = await query(querydata,{})
    return res[0]
}

async function touch(path){
    return fetch('/api/touch',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify({path:path})
    }).then(res => res.json()).catch((reason) => {
        toastr.error('Error', reason)
    })
}

async function update(data){
    return fetch('/api/update',{
        method:'PUT',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify(data)
    }).then(async res => {
        if(res.ok){
            return true
        }else{
            var data = await res.json()
            throw new Error(data.error)
        }
    }).catch((reason) => {
        toastr.error(reason)
        return false
    })
}

async function remove(query){
    return fetch('/api/delete',{
        method:'DELETE',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify(query)
    }).then(async res => {
        if(res.ok){
            return true
        }else{
            var data = await res.json()
            throw new Error(data.error)
        }
    }).catch((reason) => {
        toastr.error('Error', reason)
        return false
    })
}

async function removeID(_id){
    return remove({_id})
}

function getSessionId(){
    return parseInt(localStorage.getItem('sessionid'))
}


