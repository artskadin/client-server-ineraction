const SERVER_HTTP_API = 'http://localhost:4000'
const WEBSOCKET_API = 'ws://localhost:2000'

start()

function start() {
  // Чтобы посмотреть как работает метод
  // нужно раскоментировать только его

  // startShortPolling(1000)

  // startLongPolling()

  // startWebSocket()

  // startServerSentEvents()
}

function startShortPolling(delay, lastUserIndex = 0) {
  setTimeout(async () => {
    const response = await fetch(`${SERVER_HTTP_API}/short-polling?last=${lastUserIndex}`)
    const { users, last } = await response.json()

    addUsersToHtml(users)

    startShortPolling(delay, last)
  }, delay)
}

function startLongPolling(lastUserIndex = 0) {
  setTimeout(async () => {
    const response = await fetch(`${SERVER_HTTP_API}/long-polling?last=${lastUserIndex}`)
    const { users, last } = await response.json()

    addUsersToHtml(users)

    startLongPolling(last)
  }, 0)
}

function startWebSocket() {
  const ws = new WebSocket(`${WEBSOCKET_API}/ws`)
  const params = { lastUserIndex: 0 }

  ws.onopen = () => {
    console.log('websocket connection is done')

    const paramsToString = JSON.stringify(params)

    ws.send(paramsToString)
  }

  ws.onmessage = (event) => {
    const { users, last } = JSON.parse(event.data)

    addUsersToHtml(users)
  }

  ws.onclose = () => {
    console.log('websocket ws closed')
  }

  ws.onerror = () => {
    console.log('An error was occurred with the websocket')
  }
}

function startServerSentEvents() {
  const lastUserIndex = 0
  const eventSource = new EventSource(`${SERVER_HTTP_API}/server-sent-event?last=${lastUserIndex}`)

  eventSource.onmessage = (event) => {
    const { users } = JSON.parse(event.data)
    addUsersToHtml(users)
  }
}

function addUsersToHtml(users) {
  const usersDiv = document.querySelector('#users-list')

  users.forEach((user) => {
    const userDiv = document.createElement('div')
    userDiv.textContent = `${user.name} ${user.surname}`
    usersDiv.appendChild(userDiv)
  })
}
