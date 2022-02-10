const express = require('express')
const WebSocket = require ('ws')
const app = express()
// sets up a headless WebSocket server that prints any events that come in
const wsServer = new WebSocket.Server({ noServer: true })

const waypoints = [
  [-1.1069798469543455, 51.388441049123344],
  [-1.1028170585632322, 51.38874902698069],
  [-1.095306873321533, 51.38743675910101],
  [-1.0946416854858396, 51.388200021528235],
  [-1.0895991325378416, 51.38845443950808],
  [-1.0871744155883787, 51.387999164229086],
  [-1.0842776298522947, 51.38868207544894],
  [-1.0838699340820308, 51.38601732494524],
  [-1.0870885848999021, 51.38597715163979],
  [-1.086187362670898, 51.384129141463546],
  [-1.0832262039184568, 51.383044405081876],
  [-1.0838270187377925, 51.37815607649475],
  [-1.0876464843749996, 51.381745365955084],
  [-1.0885691642761228, 51.38012486340128],
  [-1.0878396034240718, 51.378075716046766],
  [-1.084492206573486, 51.3769238674559],
  [-1.0835051536560054, 51.37587914250594],
  [-1.0833764076232908, 51.374352193921084],
  [-1.084191799163818, 51.373213646480735],
  [-1.085243225097656, 51.37490136550488],
  [-1.086616516113281, 51.37342796345632],
  [-1.0897922515869138, 51.373360989509194],
  [-1.0897707939147945, 51.37551750139124],
  [-1.0948133468627927, 51.373320805093925],
  [-1.0976243019104002, 51.37551750139124],
  [-1.100199222564697, 51.37417806497018],
  [-1.1047053337097166, 51.3738967783427],
  [-1.1059069633483884, 51.374794210591205],
  [-1.1021518707275388, 51.377285497460434],
  [-1.0994696617126463, 51.378557876618544],
  [-1.0926032066345213, 51.378839134606636],
  [-1.0935688018798826, 51.38135698627312],
  [-1.1027312278747556, 51.3802587914071],
  [-1.1053061485290525, 51.37885252780106],
  [-1.1066365242004392, 51.38016504184418],
  [-1.1037611961364744, 51.38099538843423],
  [-1.1036539077758787, 51.38212035010707],
  [-1.0989117622375486, 51.38153108791741],
  [-1.0962080955505367, 51.38325867603447],
  [-1.1002421379089353, 51.38424966614116],
  [-1.1035251617431638, 51.383888091156194],
  [-1.1039543151855467, 51.38482550188624],
  [-1.1060357093811033, 51.38521385213491],
  [-1.1067008972167967, 51.38632531911557],
  [-1.1046624183654783, 51.38738319634737],
  [-1.1067008972167967, 51.38759744698581 ]
]

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
let counter = 0;

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
      event: 'LONLAT_UPDATE',
      payload: {
        data: {
          lon: getRandomCoords(-1.1001, -1.1005),
          lat: getRandomCoords(51.380, 51.385),
        }
      }
    }))

    if (counter < waypoints.length) {
      webSocket.send(JSON.stringify({
        event: 'POSITION_UPDATE',
        payload: {
          data: {
            lon: waypoints[counter][0],
            lat: waypoints[counter][1]
          }
        }
      }))
      counter++
    }

  }, 200)

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
