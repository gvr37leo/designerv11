//shows the questions for a given order and allows you to buy it

// /order/{id}

async function orderPage(orderid){
    var order = await queryOne({_id:orderid},{})
    var questiontypes = await pathsearch('vragen/*');
    var answers = await pathsearch(`/[${orderid}]/*`)
    

    //get the product
    //get the question pointers under the product
    //deref them

    var product = await queryOne({_id:order.product},{})
    var questionpointers = await query({parent:product._id}) 
    var questions = questionpointers.map(qp => questiontypes.find(qt => qt._id == qp.ref))

    

    //render some information about the order like the product name
    startContext(appcontainer)
    appcontainer.innerHTML = ''
    cr('div',{style:"background:white;"})
        cr('div')
        crend('a','back',{href:`/patient/${order.parent}`})
        end()
        crend('div',order.name)
        crend('div','dit is de order page met alle vragen')
        cr('div')
        for(var question of questions){
            //get the matching answer(can be null)
            crend('div',question.name)

            if(question.questiontype == 'bool'){
                crend('input','',{type:'checkbox'})
            }else if(question.questiontype == 'number'){
                crend('input','',{type:'number'})
            }else if(question.questiontype == 'text'){
                crend('input','',{})
            }else if(question.questiontype == 'multiplechoice'){
                cr('select')
                crend('option','')
                for(var option of question.options){
                    crend('option',option)
                }
                end()
            }

            
        }
        end()
    end()

    


    endContext()
}