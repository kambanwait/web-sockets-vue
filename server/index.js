const WebSocket = require ('ws')
const server = new WebSocket.Server({ port: 8082 })

// array of connected sockets
let sockets = []
// socket = single connection
// server = web socket server
server.on('connection', webSocket => {
  console.log('new client connected')
  sockets.push(webSocket)


  // when socket closes or disconnects, remove it from the array
  webSocket.on('close', () => {
    console.log('close')
    sockets = sockets.filter(s => s !== webSocket)
  })

})
