async function createMany(data){
    return fetch('/api/create',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify(data)
    }).then(res => res.json())
}

async function createOne(data){
    return createMany([data])
}

async function query(query,sort){
    return fetch('/api/query',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify({filter:query,sort:sort})
    }).then(res => res.json())
}

async function queryOne(querydata){
    var res = await query(querydata,{})
    return res[0]
}

async function update(data){
    return fetch('/api/update',{
        method:'PUT',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify(data)
    }).then(res => res.json())
}

async function remove(query){
    return fetch('/api/delete',{
        method:'DELETE',
        headers:{
            'Content-Type': 'application/json',
            'sessionid':getSessionId(),
        },
        body:JSON.stringify(query)
    }).then(res => res.json())
}

async function removeID(_id){
    return remove({_id})
}

function getSessionId(){
    return parseInt(localStorage.getItem('sessionid'))
}


