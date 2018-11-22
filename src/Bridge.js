const JSON = require('./JSON')
const Validate = require('./Validate')

function run(obj) {
  return Function('"use strict"; return (' + obj + ')')()(Validate)
}

console.log(run("function(Validate){ return Validate.parseJSON('{}') }"))