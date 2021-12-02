const WebSocket = require ('ws')
const server = new WebSocket.Server({ port: 8082 })

// array of connected sockets
let sockets = []
// socket = single connection
// server = WebSocket server
server.on('connection', webSocket => {
  console.log('new client connected')
  sockets.push(webSocket)

  // when we receive a message, send that to every socket
  webSocket.on('message', message => {
    // extract the message content
    const messageContent = JSON.parse(message)

    // send the message content to each connected client
    sockets.forEach(socket => socket.send(messageContent.payload.msg))

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
