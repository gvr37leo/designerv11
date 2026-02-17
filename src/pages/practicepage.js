//get all patients below a practice
//render them 


//  /practice/{id}

async function practicePage(practiceid){
    
    // var practice = await query({_id:practiceid},{})
    // var patients = await query({parent:practice._id ,type:'patient'})

    var practice = await queryOne({_id:practiceid})
    var data = await pathsearch(`[${practiceid}]/*`)
    // var practice = data[0]
    var patients = data


    

    //render practice information
    startContext(appcontainer)
    appcontainer.innerHTML = ''
    cr('div',{style:'background:white;'})
        cr();crend('a','back',{href:`/practiceselect`});end();
        crend('div',practice.name)


        cr('table')
            cr('tr')
                crend('th','patient')
                crend('th','product')
                crend('th','images')
            end()
        for(var patient of patients){
            cr('tr')
            //render patients
            //with urls to /patient/{patient._id}
            cr('td');crend('a',patient.name,{href:`/patient/${patient._id}`});end();
            crend('td');
            crend('td');
            //patientnaam
            //meeste recente order product naam,
            //previews van bestanden

            end()
        }
        end()
    end()
    endContext()


}