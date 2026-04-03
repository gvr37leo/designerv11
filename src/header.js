async function drawHeader(){

    // var currentuser = await getcurrentuser()
    //expects currentuser to have already been retrieved by caller

    cr('div',{style:'display:flex; justify-content:space-between; background:white; padding:10px; align-items:center;'})
        cr('div',{style:'display:flex; align-items:flex-start; gap:10px;'})

            crend('button','export',{class:'btn btn-primary'}).on('click',async () => {
                var res = await query({})
                download('export.json',JSON.stringify(res,null,2))
            })

            crend('button','import',{class:'btn btn-primary'}).on('click',async () => {
                const fileInput = document.createElement('input')
                fileInput.type = 'file'
                fileInput.accept = 'application/json'
                fileInput.onchange = async (e) => {
                    const file = e.target.files[0]
                    if(file){
                        const text = await file.text()
                        const data = JSON.parse(text)
                        //todo, use import api instead
                        // const res = await createMany(data)
                    }
                }
                fileInput.click()
            })
        end()

        cr('div',{style:'display:flex;align-items:flex-start;gap:10px; align-items:center;'})
            
            crend('a','listview',{href:`/listview/${namemap['entity']._id}`})

            // crend('button','delete orphans',{}).on('click',async () => {
            //     //get every entity
            //     var allIds = new Set(entities.map(e => e._id))
                
            //     //save their id's in a set
            //     var danglingIds = []
                
            //     //if an entity has a parent id that doesnt reference an existing entity
            //     //that means it's a dangling child
            //     //note that having null as a parent value is fine since that means it's a root node
            //     for(var entity of entities){
            //         if(entity.parent != null && !allIds.has(entity.parent)){
            //             danglingIds.push(entity._id)
            //         }
            //     }
                
            //     if(danglingIds.length > 0){
            //         await remove({_id: danglingIds})
            //         await refreshrerender()
            //     }
            // })

            if(isLoggedIn()){
                crend('div',`logged in as ${currentuser.name} : ${currentuser.rolederef.name}`)
                crend('button','logout',{class:'btn btn-primary'}).on('click', async () => {
                    logout()
                    await refreshrerender()
                })
            }
        end()
    end()
    crend('br')
}


async function drawSupraHeader(){
    var currentuser = await getcurrentuser()
    cr('div',{style:'display:flex; justify-content:space-between; background:white; padding:10px; align-items:center;'})
        cr('div',{style:'display:flex; align-items:flex-start; gap:10px;'})

            crend('h1','Supra Solutions')
            
        end()

        cr('div',{style:'display:flex;align-items:flex-start;gap:10px; align-items:center;'})
            if(isLoggedIn()){
                crend('div',`logged in as ${currentuser.name} : ${currentuser.rolederef.name}`)
                crend('button','logout',{class:'btn btn-primary'}).on('click', async () => {
                    logout()
                    await refreshrerender()
                })
            }
        end()
    end()
}

//errors because idmap is only available on detailview
async function getcurrentuser(){
    // await query({},{},['role'])

    var user = (await query({_id:parseInt(localStorage.getItem('currentuserid'))},{},['role']))[0]

    // var user = await getById(parseInt(localStorage.getItem('currentuserid')))
    // var role = await getById(user.role)
    // user.rolederef = role
    return user
}
