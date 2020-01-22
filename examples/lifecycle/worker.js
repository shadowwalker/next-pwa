self.addEventListener('message', event => {
    console.log(`Worker message event is triggered.`)    
    console.debug(event)
})
