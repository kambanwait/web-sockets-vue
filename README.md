# WebSockets & vue

## Testing WebSockets with Vue on the front-end

I'm testing how to set up a WebSocket server in node.js and using Vue to listen for events that are emitted from the 
backend to update the front-end with whatever data is sent.

### How to run locally
- Clone repo to local directory
- run `npm install` in both **server** and **app** directories
- in the server directory: run `node index.js` to start the server for the webhook server
- in the app directory: open the index.html page (TODO: updates when Vue's used)

### Deployment 

This is using my GitHub repo and deploying to Heroku with each commit to the main branch.