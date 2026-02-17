//shows a patients latest behandelplan and his older ones
//also shows the orders of the latest or selected behandeplan
//  /patient/{id}/?{behandelplan}

async function patientPage(patientid){

    var patient = await queryOne({_id:patientid},{})
    var orders = await query({parent:patientid })
    var producttypes = await pathsearch('producten/*')



    var latest = orders[0]

    // var questionanswers = await query({parent:latest._id},{})
    for(var order of orders){
        order.productderef = producttypes.find(pt => pt._id == order.product) 
    }


    startContext(appcontainer)
    appcontainer.innerHTML = ''
    cr('div',{style:"background:white;"})

    cr('div')
    crend('a','back',{href:`/practice/${patient.parent}`})
    end()
    crend('button','new order')
    crend('input','',{placeholder:'search'})

    crend('div',patient.name)
    for(var order of orders){

        cr('div')
            crend('a',order.productderef.name,{href:`/order/${order._id}`})
        end()
        //render order
        //and a link to its questions
        // /order/{id}
    }
    end()
    endContext()

}

//   [patientid]/behandelplannen/*