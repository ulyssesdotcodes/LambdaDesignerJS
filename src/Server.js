// import * as express from 'express'
// import * as path from 'path'
// import * as sock from 'socket.io'
// import * as net from 'net'

let express = require('express')
let path = require('path')
let sock = require('socket.io')
let net = require('net')

const app = express()

app.set("port", process.env.PORT || 8080)

var http = require('http').Server(app)

let io = sock(http)

app.use(express.static("build"))

let client = new net.Socket()

client.connect(5959, 'localhost', function(){
    console.log("connected to TD")
    io.on('connection', function(socket){
        console.log("ws client connected")
        socket.on('message', (m) => {
            console.log(m)
            client.write(m + "\n")
        })
    })
})


const server = http.listen(8080)