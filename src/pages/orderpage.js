//shows the questions for a given order and allows you to buy it

// /order/{id}

async function orderPage(orderid){
    
    //get the order and it's answerblock
    //get the product and it's questions
    //get all the questiontypes
    

    //get the product
    //get the question pointers under the product
    //deref them
    var order = await queryOne({_id:orderid},{});
    if(order.answerblock == null){
        order.answerblock = {}
    }
    var answerblock = order.answerblock
    
    var product = await queryOne({_id:order.product},{})
    var questionpointers = await query({parent:product._id}) 
    var questiontypes = await pathsearch('vragen/*');
    var questions = questionpointers.map(qp => questiontypes.find(qt => qt._id == qp.ref))

    //header
    //3sections
    //maybe a simple answerblock object would be better, it would be a lot less error prone
    //but doesnt jive aswell with the current designer ui

    //render some information about the order like the product name
    startContext(appcontainer)
    appcontainer.innerHTML = ''

    //speciale orderpage hoeft niet, is gemengd met de patientpage met een master detail opzet
    //toch wel op deze pagina komen de vragen
    await drawSupraHeader()
    cr('div',{style:"background:white; padding: 10px;"})
        cr('div');crend('a','back',{href:`/patient/${order.parent}?selectedid=${orderid}`});end();
        crend('h1',order.name)
        crend('h1',product.name)
        crend('button','save',{}).on('click',async () => {
            await update(order)
            toastr.success('saved')
        })

        cr('div')
            for(let question of questions){
                let answer = answerblock[question.name]
                if(answer == null){
                    //no answer given yet
                }
                //get the matching answer(can be null)
                
                crend('div',question.name,{style:'font-weight:bold;'})
                let input = null
                if(question.questiontype == 'bool'){
                    input = crend('input','',{type:'checkbox'}).on('change',(e) => {
                        answerblock[question.name] = e.target.checked
                    })
                    input.checked = answer
                }else if(question.questiontype == 'number'){
                    input = crend('input','',{type:'number'}).on('change',(e) => {
                        answerblock[question.name] = e.target.value
                    })
                    input.value = answer ?? 0
                }else if(question.questiontype == 'text'){
                    input = crend('input','',{}).on('change',(e) => {
                        answerblock[question.name] = e.target.value
                    })
                    input.value = answer ?? ''
                }else if(question.questiontype == 'multiplechoice'){
                    input = cr('select').on('change',(e) => {
                        answerblock[question.name] = e.target.value
                    })
                    crend('option','')
                    for(var option of question.options){
                        crend('option',option)
                    }
                    end()
                    input.value = answer ?? ''
                }

            }
        end()

        
    end()

    


    endContext()
}