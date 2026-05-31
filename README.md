# Веб-версия расписания МГКЦТ (Клон Android-приложения)

Этот проект является точной копией Android-приложения расписания МГКЦТ, адаптированной для работы в браузере (как на мобильных устройствах, так и на ПК).

Интерфейс построен в современном дизайне **Material 3 / Material You** с динамическим наследованием тем оформления, кастомным акцентным цветом и сохранением всех данных в LocalStorage.

## 🚀 Как запустить локально

1. Установите зависимости (если еще не установлены):
   ```bash
   npm install
   ```
2. Запустите сервер для разработки:
   ```bash
   npm run dev
   ```
3. Откройте в браузере предоставленную ссылку (обычно `http://localhost:5173`).

## 📦 Как скомпилировать и деплоить (например, на GitHub Pages)

1. Скомпилируйте проект в статический бандл:
   ```bash
   npm run build
   ```
   В результате в корне проекта появится папка `dist`, содержащая оптимизированные статические файлы.
2. Загрузите содержимое папки `dist` на ваш хостинг или настройте GitHub Actions / Git-деплой в ветку `gh-pages`. Пути в файлах настроены относительно (`./`), поэтому проект откроется без ошибок на любых поддоменах.

---

## 🛡️ Настройка собственного CORS-прокси (Cloudflare Workers)

Так как запросы расписания выполняются на стороне клиента напрямую с сайта колледжа, браузер блокирует их политикой CORS. По умолчанию в приложении настроены стабильные публичные прокси, но для надежности рекомендуется создать свой личный прокси через Cloudflare Workers (это абсолютно бесплатно).

### Инструкция по созданию:
1. Зарегистрируйтесь/войдите на [Cloudflare](https://dash.cloudflare.com/).
2. Перейдите в раздел **Workers & Pages** -> **Create Application** -> **Create Worker**.
3. Задайте имя воркеру (например, `cors-proxy-timetable`) и нажмите **Deploy**.
4. Нажмите **Edit Code** и замените код файла `worker.js` следующим содержанием:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  // Получаем оригинальный URL из параметра запроса ?url=
  let targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return new Response('Missing "url" parameter', { status: 400 })
  }

  // Декодируем URL
  targetUrl = decodeURIComponent(targetUrl)

  // Создаем новый запрос с оригинальными заголовками
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
      'Accept-Language': 'ru-RU,ru;q=0.9'
    }
  })

  try {
    const response = await fetch(modifiedRequest)
    
    // Создаем новые заголовки ответа, разрешая CORS
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
    newHeaders.set('Access-Control-Allow-Headers', '*')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })
  } catch (err) {
    return new Response('Proxy Error: ' + err.message, { status: 500 })
  }
}
```

5. Нажмите **Save and Deploy**.
6. Скопируйте ссылку вашего воркера (например, `https://cors-proxy-timetable.username.workers.dev/`).
7. Откройте веб-приложение расписания, перейдите в **«Настройки»** -> **«CORS прокси-сервер»**, введите адрес домена вашего воркера в текстовое поле:
   `cors-proxy-timetable.username.workers.dev` (адрес будет автоматически очищен и приведен к нужному виду при выполнении запросов).
8. Нажмите **Готово**. Теперь расписание будет грузиться через ваш собственный прокси-сервер!
