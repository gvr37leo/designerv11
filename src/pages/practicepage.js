//get all patients below a practice
//render them 


//  /practice/{id}

async function practicePage(practiceid){
    
    // var practice = await query({_id:practiceid},{})
    // var patients = await query({parent:practice._id ,type:'patient'})

    // var practice = await queryOne({_id:practiceid})
    // var patients = await pathsearch(`[${practiceid}]/*`)

    //need to get the patients and all their orders, and find the latest order to show
    //also need this for the selectedorder query paramter
    // do a find parents query {parent:{$in:[patients.id]}}
    
    var practicetree = await gettree(practiceid,2)
    var practice = practicetree
    var patients = practicetree.children
    var producttypes = await pathsearch('producten/*')
    
    //header
    //3 sections, new order/upload,table of orders,chat

    //render practice information
    startContext(appcontainer)
    appcontainer.innerHTML = ''

    await drawSupraHeader()
    cr('div',{style:"background:white; display:flex;justify-content:space-between; gap:10px;flex-wrap:wrap;"})
        cr('div',{style:"background:grey; padding:10px;"})//col1
            cr('div')//praktijk info
                crend('h2','New order')
                crend('h2','Upload')
                cr();crend('a','back',{href:`/practiceselect`});end();
                crend('div',practice.name)
                //patientnummer
                //geboortedatum
            end();
        end()
        cr('div',{style:"background:grey; flex-grow:1; padding:10px;"})//col2 
            crend('h2','Orders')
            cr('table')
                cr('tr')
                    crend('th','patient')
                    crend('th','product')
                    crend('th','images')
                end()
            for(var patient of patients){
                var orders = patient.children
                orders.sort((a,b) => a.createdAt - b.createdAt)
                var mostrecentorder = orders[0]
                
                cr('tr')
                //render patients
                //with urls to /patient/{patient._id}
                var selectedstring = `?selectedid=${mostrecentorder?._id}`
                cr('td');crend('a',patient.name,{href:`/patient/${patient._id}${mostrecentorder != null ? selectedstring : ''}`});end();
                if(mostrecentorder){
                    var prod = producttypes.find(pt => pt._id == mostrecentorder.product) 
                    cr('td');crend('a',prod?.name,{href:`/order/${mostrecentorder?._id}`});end();//meeste recente order product naam,
                }else{
                    crend('td');    
                }
                cr('td');
                    if(mostrecentorder?.files != null){
                        for(var file of mostrecentorder.files){
                            crend('img','',{src:`/uploads/${file.filename}`,width:'100',style:'margin-right:10px;'})
                        }
                    }
                end();
                
                

                end()
            }
            end()
        end()
    end()
    endContext()
}