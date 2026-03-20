//shows a patients latest behandelplan and his older ones
//also shows the orders of the latest or selected behandeplan
//  /patient/{id}/?{behandelplan}

async function patientPage(patientid){

    var patient = await queryOne({_id:patientid},{})
    var orders = await query({parent:patientid })
    var producttypes = await pathsearch('producten/*')

    let params = new URLSearchParams(document.location.search);
    let selectedid = parseInt(params.get("selectedid"))
    var selectedorder = await queryOne({_id:selectedid},{})


    

    // var questionanswers = await query({parent:latest._id},{})
    for(var order of orders){
        order.productderef = producttypes.find(pt => pt._id == order.product) 
    }


    startContext(appcontainer)
    appcontainer.innerHTML = ''
    await drawSupraHeader()

    cr('div',{style:"background:white; display:flex;justify-content:space-between; gap:10px;flex-wrap:wrap;"})

        cr('div',{style:"background:grey; padding:10px;"})//col1
            cr('div')//patient info
                cr('div');crend('a','back',{href:`/practice/${patient.parent}`});end();
                crend('h2',patient.name)
                crend('div','info about the patient')
                //patientnummer
                //geboortedatum
            end();
            cr('div')//selected order info(most recent by default)
                crend('div',selectedorder?.name)
                crend('div','info about the order')

                crend('button','new order').on('click',async () => {
                    //todo create a popup to choose a product
                    var result = await createOne({
                        parent:patientid,
                        name:'new order',
                        type:'order',
                        product:954796210,//todo ui for product kiezen
                        files:[],
                        answerblock:{},
                    })
                    await refreshrerender()
                })
                //aantal implantaten
                //merk
                //type
                //
            end();
            cr('div')//order history
                for(var order of orders){

                    cr('div')
                        crend('a',order.productderef.name,{href:`/order/${order._id}`})
                    end()
                }
            end();
        end()
        cr('div',{style:"background:grey; flex-grow:1; padding:10px;"})//col2 
            //files, zips, images and data
            crend('h2','Files')
            // cr('label',{for:'fileinput'});crend('span','Upload file');end()
            crend('input','asd',{type:'file',id:'fileinput'}).on('change',(e) => {
                var formdata = new FormData()
                formdata.append("file",e.target.files[0])
                fetch('/api/upload',{
                    method:"POST",
                    headers:{},
                    body:formdata,
                }).then(res => res.json())
                .then(async data => {
                    if(selectedorder.files == null){
                        selectedorder.files = []
                    }
                    selectedorder.files.push({
                        filename:data.filename,
                        originalname:data.originalname,
                    })
                    await update(selectedorder)
                    await refreshrerender()
                })
            })
            crend('br');
            crend('br');
            
            
            if(selectedorder.files){
                cr('div',{style:'display:flex; flex-wrap:wrap; gap:10px;'})
                for(var file of selectedorder.files){
                    cr('div')
                        crend('a',file.originalname,{href:`/api/download/${file.filename}`,download:file.originalname})
                        crend('img','',{src:`/uploads/${file.filename}`,width:'100'})
                    end()
                }
                end()
            }
        end()
        cr('div',{style:"background:grey; padding:10px;"})//col3 
            crend('h2','chat')
            //chat for the currently selected order(or attached to patient?)
        end()


        
        // crend('button','new order')
        // crend('input','',{placeholder:'search'})

        
        
    end()
    endContext()

}

//   [patientid]/behandelplannen/*