# Kovka client-server-interaction урок

Учебные примеры взаимодействия клиента и сервера.
Рассматриваются short и long polling, websockets и server-sent-events подходы.

Для тестирования нужно:
- склонировать репозиторий
- установить зависимости через pnpm (если pnpm нет, то установить его)
- папке `/server` выполнить команду `pnpm run start`
- открыть `index.html` в браузере
- в файле `client.js` поочередно раскоментировать методы: `startShortPolling()`, 
`startLongPolling()`, `startWebSocket()`, `startServerSentEvents()`

[Ссылка на видео урок](https://www.youtube.com/watch?v=tBb0txoanH4)

[Телеграм канал](https://t.me/wykovka), где пишу редко и по делу.
