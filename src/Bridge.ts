import * as j from './JSON'
import * as c from './Chain'
import * as v from './Validate'
import { Either, tryCatch } from 'fp-ts/lib/Either'

import * as sock from 'socket.io-client'

const SERVER_URL = "http://localhost:8080"

function run(obj) {
  return Function("return (function(c, v) { return v((function() { " + obj + " })())})")()(c, (n) => v.validateNode(n).map(n => j.nodeToJSON(n)))
}

function runAndSend(text) {
  let result: Either<string[], string> = tryCatch<Either<string[], string>>(() => run(text) as Either<string[], string>).mapLeft(e => [e.message]).chain(r => r)
  if(result.isRight()) {
    socket.send(result.value)
    document.getElementById("errors").textContent = "Correct"
  } else {
    document.getElementById("errors").textContent = result.value[0]
  }
}

class SocketService {
  private socket;

  public initSocket(): void {
    this.socket = sock.connect(SERVER_URL)
  }

  public send(message: string) {
    this.socket.emit('compiled', message)
  }
}

let socket = new SocketService()
console.log("starting socket")
socket.initSocket()
console.log("socket inited")
let textinput = <HTMLInputElement>document.getElementById("codeinput")
runAndSend("let n = c.tope('rectangleTOP').connect(c.tope('outTOP')).out(); return n;")
textinput.oninput = () => runAndSend(textinput.value)