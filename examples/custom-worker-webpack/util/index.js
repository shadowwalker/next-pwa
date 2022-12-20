'use strict'

module.exports = () => {
    console.log('Hello from util.')
    console.log('es6+ syntax test:')
    let foo = { message: "working" }
    console.log(foo?.message)
}
