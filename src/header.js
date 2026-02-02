function drawHeader(){
    header.innerHTML = ''
    startContext(header)
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
                        const res = await createMany(data)
                    }
                }
                fileInput.click()
            })
        end()

        cr('div',{style:'display:flex;align-items:flex-start;gap:10px; align-items:center;'})
            crend('button','delete orphans',{}).on('click',async () => {
                //get every entity
                var allIds = new Set(entities.map(e => e._id))
                
                //save their id's in a set
                var danglingIds = []
                
                //if an entity has a parent id that doesnt reference an existing entity
                //that means it's a dangling child
                //note that having null as a parent value is fine since that means it's a root node
                for(var entity of entities){
                    if(entity.parent != null && !allIds.has(entity.parent)){
                        danglingIds.push(entity._id)
                    }
                }
                
                if(danglingIds.length > 0){
                    await remove({_id: danglingIds})
                    await refreshrerender()
                }
            })

            if(isLoggedIn()){
                crend('div',`logged in as ${getcurrentuser().name} : ${getcurrentRole()}`)
                crend('button','logout',{class:'btn btn-primary'}).on('click', async () => {
                    logout()
                    await refreshrerender()
                })
            }else{

                var usernameinput = crend('input')
                crend('button','login',{class:'btn btn-primary'}).on('click',async () => {
                    var res = await fetch('/api/login',{
                        method:'POST',
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        body:JSON.stringify({username:usernameinput.value})
                    }).then(res => res.json())
                    localStorage.setItem('sessionid',res.sessionid)
                    //get the users role
                    var founduser = entities.find(e => e.name == usernameinput.value)// && e.type == findbyname('user')._id
                    
                    localStorage.setItem('currentuserid',founduser._id)
                    await refreshrerender()
                })
            }
        end()
    end()
    crend('br')
    endContext()
}
