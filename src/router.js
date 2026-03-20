class Router{

    listeners = []
    preroutecb

    constructor(){
        
    }

    listen(pattern, listener){
        this.listeners.push(new RouteRegistration(pattern,listener))
    }

    trigger(string){
        if(this.preroutecb?.(string) == false){
            return
        }
        for (var routeRegistration of this.listeners) {
            var result = routeRegistration.test(string)
            if(result != null){
                routeRegistration.listener(result)
                break
            }
        }
    }

    navigate(url){
        window.history.pushState(null,null,url)
        // this.trigger(url)
    }

    navigateID(id){
        this.navigate(`/detail/${id}`)
    }

    locationListen(){
        navigation.addEventListener('navigate',(event) => {
            if(event.destination.url.includes('/api/download')){
                return
            }
            event.intercept()
            var url = new URL(event.destination.url)
            this.trigger(url.pathname)
        })
        // window.addEventListener('popstate', () => {
        //     this.trigger(window.location.pathname)
        // });
    }
}

class RouteRegistration{
    
    pattern
    listener

    constructor(pattern, listener){
        this.pattern = pattern
        this.listener = listener
    }

    test(url){
        var result = {}
        // when a url like this comes in /patient/753485?somedata=12
        // this pattern '/patient/[id]' should succeed and  the id should be set on the result object
        // queryparameters should be ignored

        // Remove query parameters from URL
        const cleanUrl = url.split('?')[0]
        
        // Split on slashes and filter out empty strings
        const urlParts = cleanUrl.split('/').filter(p => p)
        const patternParts = this.pattern.split('/').filter(p => p)
        
        // Must have same number of parts
        if (urlParts.length !== patternParts.length) {
            return null
        }
        
        // Compare each part
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i]
            const urlPart = urlParts[i]
            
            // Check if pattern part is a parameter (e.g., [id])
            if (patternPart.startsWith('[') && patternPart.endsWith(']')) {
                const paramName = patternPart.slice(1, -1)
                result[paramName] = urlPart
            } else if (patternPart !== urlPart) {
                // Literal parts must match exactly
                return null
            }
        }
        return result
    }
}