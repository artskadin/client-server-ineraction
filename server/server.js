import express from 'express'
import cors from 'cors'
import { EventEmitter } from 'events'
import { WebSocketServer } from 'ws'

const HTTP_PORT = 4000
const WS_PORT = 2000
const PUSH_USER_EVENT = 'push-user'

const app = express()
app.use(cors())
app.use(express.json())

const usersDB = []

const eventEmitter = new EventEmitter()

app.get('/', (req, res) => {
  res.send('Hello, Kovka')
})

app.get('/short-polling', (req, res) => {
  const { last } = req.query
  const freshUsers = usersDB.slice(last, usersDB.length)

  res.status(200).json({ users: freshUsers, last: usersDB.length })
})

app.get('/long-polling', (req, res) => {
  const { last } = req.query

  eventEmitter.once(PUSH_USER_EVENT, () => {
    const freshUsers = usersDB.slice(last, usersDB.length)

    res.status(200).json({ users: freshUsers, last: usersDB.length })
  })
})

app.get('/server-sent-event', (req, res) => {
  const { last } = req.query
  let lastUserIndex = last

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  })

  eventEmitter.on(PUSH_USER_EVENT, () => {
    const freshUsers = usersDB.slice(lastUserIndex, usersDB.length)
    lastUserIndex = usersDB.length
    const data = JSON.stringify({ users: freshUsers, last: lastUserIndex })

    res.write(`data: ${data} \n\n`)
  })
})

app.listen(HTTP_PORT, () => {
  console.log(`Server is running on port ${HTTP_PORT}`)
});

const wss = new WebSocketServer({
    port:  WS_PORT
  },
  () => `ws server is running on port ${WS_PORT}`
)

wss.on('connection', (ws) => {
  let last = 0
  ws.on('error', console.error)

  ws.on('message', (data) => {
    const { lastUserIndex } = JSON.parse(data)
    last = lastUserIndex
  })

  eventEmitter.on(PUSH_USER_EVENT, () => {
    const freshUsers = usersDB.slice(last, usersDB.length)
    last = usersDB.length

    const data = JSON.stringify({ users: freshUsers, last })

    ws.send(data)
  })
});

(function pushUser() {
  const delay = Math.floor(Math.random() * 3000)

  setTimeout(() => {
    const user = generateUser()
    usersDB.push(user)
    eventEmitter.emit(PUSH_USER_EVENT)

    pushUser()
  }, delay)
})()

function generateUser() {
  const names = [
    "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Helen", "Ivy", "Jack",
    "Kevin", "Linda", "Mike", "Nancy", "Oliver", "Pamela", "Quinn", "Roger", "Sara", "Tom"];
  const surnames = [
    "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"
  ];

  const randomName = names[Math.floor(Math.random() * names.length)]
  const randomSurname = surnames[Math.floor(Math.random() * surnames.length)]

  return {
    name: randomName,
    surname: randomSurname
  }
}
