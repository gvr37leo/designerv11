async function practiceselect(){
    console.log('practiceselect')

    var practices = await pathsearch(`praktijken/*`)
    if(practices.length == 1){
        router.navigate(`/practice/${practices[0]._id}`)
    }

    startContext(appcontainer)
    appcontainer.innerHTML = ''
    cr('select').on('change',(e) => {
        router.navigate(`/practice/${e.target.value}`)
    })
    crend('option','',{})
    for(var practice of practices){
        crend('option',practice.name,{value:practice._id})
    }
    end()    
    endContext()
}