import * as ldj from '.'
import * as fs from 'fs'
import * as t from 'io-ts'
import * as net from 'net'
import { Either, tryCatch } from 'fp-ts/lib/Either'

const clientWrite = (data: string, client: net.Socket): Either<Error, boolean> => {
  return tryCatch(() => client.write(data))
}

Function('return (function(validate, data){ console.log(validate(data)) })')()(ldj.parseJSON, "{\"type\": \"TOP\", \"optype\" : \"waveCHOP\"}")

var client = new net.Socket()
client.connect(5959, "192.168.86.185", () => {
  console.log('Connected')
  fs.watch('./scratch.json', (event, filename)=>{
    fs.readFile(filename, "utf8", (err, data) => {
      let result = ldj.parseJSON(data)
                    .map(n => ldj.nodeToJSON(n))
                    .chain(res => clientWrite(res + "\n", client).mapLeft(e => [e.message]))
                    .fold<any>(t.identity, t.identity)
      console.log(result)
    })
  })
})