const WebSocket = require ('ws')
const server = new WebSocket.Server({ port: 8082 })


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
// socket = single connection
// server = WebSocket server
server.on('connection', webSocket => {
  console.log('new client connected')
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
      console.error(`Error: something was wrong with the message object: ${err.message}`)
    }

  })

  const interval = setInterval(() => {
    console.log('sending new random number')
    webSocket.send(Math.ceil(Math.random() * 200))
  }, 2500)

  // when socket closes or disconnects, remove it from the array
  webSocket.on('close', () => {
    console.log('close')
    clearInterval(interval)
    sockets = sockets.filter(s => s !== webSocket)
  })

})
