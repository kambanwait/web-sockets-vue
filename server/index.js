const express = require('express')
const WebSocket = require ('ws')
const app = express()
// sets up a headless WebSocket server that prints any events that come in
const wsServer = new WebSocket.Server({ noServer: true })

/**
 * Validates and parses an incoming message to ensure it's in the form of JSON we require
 * @param {String} message A message received from the client
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


function getRandomCoords(min, max) {
  return Math.random() * (max - min) + min
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

      // send the message content   to each connected client
      sockets.forEach(socket => socket.send(JSON.stringify(data)))
    } catch (err) {
      // provide informative error to front-end
      console.error(`Error: something was wrong with the message object: ${err.message}`)
    }
  })

  // setup an interval to send random number to attached clients
  const interval = setInterval(() => {
    // for each connected client, send a random number
    console.info(`sending new random number to ${sockets.length} client(s)`,)

    // send info on how many people are connected
    webSocket.send(JSON.stringify({
      event: 'STATS_UPDATE',
      payload: {
        data: sockets.length
      }
    }))

    // send a random number for the progress bar
    webSocket.send(JSON.stringify({
      event: 'PROGRESS_UPDATE',
      payload: {
        value: Math.ceil(Math.random() * 101)
      }
    }))

    // send single datapoint to plot on chart
    webSocket.send(JSON.stringify({
      event: 'LINEAR_UPDATE',
      payload: {
        data: {
          datasets: [
            {
              label: 'Dataset 1',
              data: Array.from({ length: 6 }, () => Math.ceil(Math.random() * 100)) // returns array of 6 random numbers,
            },
            {
              label: 'Dataset 2',
              data: Array.from({ length: 6 }, () => Math.ceil(Math.random() * 100)) // returns array of 6 random numbers,
            }
          ]
        },
      }
    }))

    // send array of 6 random numbers for bar graph
    webSocket.send(JSON.stringify({
      event: 'CHART_UPDATE',
      payload: {
        data: Array.from({ length: 6 }, () => Math.ceil(Math.random() * 100)) // returns array of 6 random numbers
      }
    }))

    webSocket.send(JSON.stringify({
      event: 'POSITION_UPDATE',
      payload: {
        data: {
          lon: getRandomCoords(-1.1001, -1.1005),
          lat: getRandomCoords(51.380, 51.385),
        }
      }
    }))

  }, 1500)

  // when socket closes or disconnects, remove it from the array
  webSocket.on('close', () => {
    console.info(`Closed a client connection: ${webSocket}`)
    clearInterval(interval)
    sockets = sockets.filter(s => s !== webSocket)
  })

})

// 'server' is a vanilla Node.js HTTP server, so use the same ws
const server = app.listen(process.env.PORT || 8082, () => console.log('server is running...'));

app.use(express.static('app'))

app.get('/', function (req, res) {})

app.get('*', function (req, res) {
  res.send('<h1>Can not find the page you are looking for 😭</h1>')
})

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request)
  })
})
