


function loginPage(){
    //move the username password fields here
    //redirect here if not logged in

    cr('div',{style:'background:white; height:100%; display:flex; justify-content:center; align-items:center;'})
        cr('div', {style:'background:grey; padding:10px;'})
            // crend('',)
            cr('div')
                crend('span','username')
                var username = crend('input','',{style:'display:block;'})
            end()

            cr('div')
                crend('span','password')
                var password = crend('input','',{style:'display:block;'})
            end()
            crend('br')
            

            crend('button','login',{}).on('click',async () => {
                var succesfull = await login(username.value,password.value)
                if(succesfull){
                    drawHeader()
                    router.navigate('/')
                }else{
                    toastr.error('wrong username and password')
                }
            })
        end()
    end()
}