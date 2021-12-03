const express = require('express')
const WebSocket = require ('ws')
const app = express()
// sets up a headless WebSocket server that prints any events that come in
const wsServer = new WebSocket.Server({ noServer: true })

/**
 * Validates and parses an incoming message to ensure it's in the form of JSON we require
 * @param {Object} message A message received from the client
 * @returns {{event: string, payload: object}}
 * @throws throws an error if message is invalid
 */
function parseMessage(message) {
  let object = JSON.parse(message)

  if (!('event' in object)) {
    throw new Error('event property not provided!')
  }

  if (!('payload' in object)) {
    throw new Error('payload property not provided!')
  }

  return object
}

// array of connected sockets
let sockets = []

// server = WebSocket server
// WebSocket = client connection
wsServer.on('connection', webSocket => {
  console.info('new client connected')
  sockets.push(webSocket)

  // when we receive a message, send that to every socket
  webSocket.on('message', message => {
    // set up empty data, to be updated with message copy
    let data

    // simple try catch for checking the message sent in
    // if parseMessage is successful then we send the message to all clients
    try {
      // check out message received is valid
      data = parseMessage(message)
      // send the message content to each connected client
      sockets.forEach(socket => socket.send(data.payload.msg))
    } catch (err) {
      // provide informative error to front-end
      console.error(`Error: something was wrong with the message object: ${err.message}`)
    }
  })

  // setup an interval to send random number to attached clients
  // const interval = setInterval(() => {
  //   console.info('sending new random number')
  //   webSocket.send(Math.ceil(Math.random() * 200))
  // }, 2500)

  // when socket closes or disconnects, remove it from the array
  webSocket.on('close', () => {
    console.info(`Closed a client connection: ${webSocket}`)
    // clearInterval(interval)
    sockets = sockets.filter(s => s !== webSocket)
  })

})

// 'server' is a vanilla Node.js HTTP server, so use the same ws
const server = app.listen(8082);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request)
  })
})
