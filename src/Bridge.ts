import * as j from './JSON'
import * as c from './Chain'
import * as v from './Validate'

import * as sock from 'socket.io-client'

const SERVER_URL = "http://192.168.86.185:5959"

function run(obj) {
  return Function("return (function(c, v) { return v((function(v) { " + obj + " })())})")()(c, (n) => v.validateNode(n).map(n => j.nodeToJSON(n)))
}

export class SocketService {
  private socket;

  public initSocket(): void {
    this.socket = sock(SERVER_URL)
  }

  public send(message: string) {
    this.socket.emit('message', message)
  }
}

let socket = new SocketService()
console.log("starting socket")
socket.initSocket()
console.log("socket inited")
socket.send(run("let n = c.tope('rectangleTOP').connect(c.tope('outTOP')).out(); return n;"))
console.log("shit ran")