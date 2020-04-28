const express = require('express')
const ws      = require('ws')
const http    = require('http')
const events  = require('events')

const app     = express()
const server = http.createServer(app)
const wss = new ws.Server({ server: server, path: '/ws/status-updates'})
const status_updates = new events.EventEmitter()


let status = {}

// curse you javascript...!
const empty = obj => Object.keys(obj).length === 0 && obj.constructor === Object

app.use(express.json())
app.use(express.static('public'))

app.get('/api/status', (req, res) => {
  res.send(JSON.stringify(status))
})

wss.on('connection', (ws) => {
  status_updates.on('change', () => {
    ws.send(JSON.stringify(status))
  })

  ws.send(JSON.stringify(status))
})

app.post('/api/status', (req, res) => {
  if (empty(req.body)) {
    res.sendStatus(400)
    return
  }

  console.log(req.body)
  status = req.body
  status_updates.emit('change')
  res.sendStatus(200)
})

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${server.address().port} :)`)
})
