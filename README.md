# Мой примерный график + Вишлист

Два инструмента на одном GitHub Pages репозитории. Данные хранятся в Firebase Realtime Database, всё работает в браузере без бэкенда.

- **[Расписание](https://kkqr77.github.io/fox-aoi/)** — календарь занятости и приём заявок на встречи
- **[Вишлист](https://kkqr77.github.io/fox-aoi/wishlist/)** — список желаний с бронированием подарков

---

## Расписание (`index.html`)

### Что умеет

- Показывает календарь на месяц с визуальной загрузкой каждого дня (мини-бар)
- Учитывает рабочий график 2/2
- Учитывает расписание сна (задаётся вручную по дням)
- Показывает свободные временны́е окна для выбранного дня
- Позволяет гостям оставлять заявки на конкретное время
- Защита паролем: гости входят через Firebase Auth (guest-аккаунт), админ — через Google

### Настройки

В начале `index.html` можно изменить:

```js
var SLOT_STEP  = 1;                 // шаг слотов в часах
var START_HOUR = 0;                 // начало суток
var END_HOUR   = 24;                // конец суток
var DEFAULT_DURATION_MIN = 60;      // длительность встречи по умолчанию
var MIN_BOOKING_MINUTES  = 20;      // минимальная длительность заявки
var SUGGESTION_STEP_MIN  = 20;      // шаг предлагаемых вариантов времени
```

### Панель администратора

Доступна после входа через Google (кнопка «Вход для админа»).

**Вкладка «Заявки»** — настройка графика 2/2, управление расписанием сна, список активных заявок: подтвердить / отклонить / редактировать.

**Вкладка «Архив»** — прошедшие события, доступно редактирование и удаление.

### Часовой пояс

Все даты рассчитываются локально в браузере. Страница рассчитана на часовой пояс **Екатеринбург (GMT+5)**.

---

## Вишлист (`wishlist/index.html`)

### Что умеет

- Карточки товаров с названием, описанием, ценой, картинкой (URL или смайл), категорией, тегами
- 5 уровней приоритета: «Очень хочу», «Было бы круто», «Низкий приоритет», «Спонтанное желание», «Мечта, когда-нибудь»
- Фильтрация по категории, приоритету, статусу (свободно / забронировано)
- Сортировка по приоритету (внутри — по цене), цене, новизне
- Бронирование подарков гостями: имя, подтверждение намерения, комментарий, опциональная дата вручения, анонимный режим
- Владелец вишлиста не видит, кто забронировал подарок (сюрприз сохраняется)
- Другие гости видят статус занятости и имя бронирующего (если бронь не анонимная)
- Транзакционная запись брони — двойное бронирование невозможно
- Длинные описания сворачиваются с кнопкой «Читать далее»
- Те же gate-пароль и admin-вход, что и на основном сайте

### Поля карточки товара

| Поле | Описание |
|---|---|
| `name` | Название товара (обязательно) |
| `description` | Описание (до 500 символов) |
| `url` | Ссылка на магазин |
| `price` | Цена |
| `currency` | Валюта (₽ / $ / € / ¥) |
| `imageUrl` | URL картинки или смайл (например `🎮`) |
| `category` | Категория (Игры, Техника, Аниме…) |
| `priority` | Приоритет 1–5 |
| `tags` | Теги через запятую |

### Поля брони

| Поле | Описание |
|---|---|
| `name` | Имя бронирующего |
| `comment` | Комментарий (необязательно) |
| `giftDate` | Примерная дата вручения (необязательно) |
| `isAnonymous` | Скрыть имя от других гостей |

---

## Стек

- Чистый HTML + JS, никаких фреймворков
- [Firebase](https://firebase.google.com/) — Auth + Realtime Database
- Хостинг: GitHub Pages

---

## Быстрый старт

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите **Authentication** → Email/Password и Google
3. Создайте гостевой аккаунт (email + пароль) — это и будет «пароль» для входа на страницу
4. Включите **Realtime Database**, настройте правила (см. ниже)
5. Замените Firebase-конфиг в обоих файлах (`index.html` и `wishlist/index.html`):

```js
firebase.initializeApp({
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
});
```

6. Замените константы:

```js
var GUEST_EMAIL = 'guest@example.com';   // email гостевого аккаунта
var ADMIN_EMAIL = 'you@gmail.com';       // ваш Google-аккаунт
```

---

## Правила Firebase Realtime Database

Замените `you@gmail.com` на свой Google-аккаунт администратора.

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "config": {
      ".read": true,
      ".write": "auth != null && auth.token.email === 'you@gmail.com' && auth.token.email_verified === true",
      ".validate": "newData.hasChildren(['referenceDate'])",
      "referenceDate": {
        ".validate": "newData.isString() && newData.val().matches(/^(19|20)\\d\\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/)"
      },
      "$other": { ".validate": false }
    },

    "sleep": {
      ".read": true,
      "$dateKey": {
        ".write": "auth != null && auth.token.email === 'you@gmail.com' && auth.token.email_verified === true",
        ".validate": "!newData.exists() || newData.hasChildren(['start', 'end'])",
        "start": { ".validate": "newData.isString() && newData.val().matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)" },
        "end":   { ".validate": "newData.isString() && newData.val().matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)" },
        "$other": { ".validate": false }
      }
    },

    "bookings": {
      ".read": true,
      "$bookingId": {
        ".write": "(!data.exists() && newData.child('status').val() === 'pending') || (auth != null && auth.token.email === 'you@gmail.com' && auth.token.email_verified === true)",
        ".validate": "newData.hasChildren(['date', 'time', 'name', 'status', 'ts'])",
        "date":      { ".validate": "newData.isString() && newData.val().matches(/^(19|20)\\d\\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/)" },
        "time":      { ".validate": "newData.isString() && newData.val().matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)" },
        "startTime": { ".validate": "!newData.exists() || (newData.isString() && newData.val().matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/))" },
        "endTime":   { ".validate": "!newData.exists() || (newData.isString() && newData.val().matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/))" },
        "endDate":   { ".validate": "!newData.exists() || (newData.isString() && newData.val().matches(/^(19|20)\\d\\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/))" },
        "name":      { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 40" },
        "activity":  { ".validate": "!newData.exists() || (newData.isString() && newData.val().length > 0 && newData.val().length <= 160)" },
        "isAnonymous": { ".validate": "!newData.exists() || newData.val() === true || newData.val() === false" },
        "status":    { ".validate": "newData.isString() && (newData.val() === 'pending' || newData.val() === 'confirmed')" },
        "ts":        { ".validate": "newData.isNumber() && newData.val() > 0" },
        "_meta": {
          ".validate": "newData.hasChildren(['ip', 'ua'])",
          "ip":       { ".validate": "newData.isString()" },
          "ua":       { ".validate": "newData.isString()" },
          "platform": { ".validate": "!newData.exists() || newData.isString()" },
          "lang":     { ".validate": "!newData.exists() || newData.isString()" },
          "screen":   { ".validate": "!newData.exists() || newData.isString()" },
          "tz":       { ".validate": "!newData.exists() || newData.isString()" },
          "$other":   { ".validate": false }
        },
        "$other": { ".validate": false }
      }
    },

    "wishlist": {
      "items": {
        ".read": true,
        "$itemId": {
          ".write": "auth != null && auth.token.email === 'you@gmail.com' && auth.token.email_verified === true",
          ".validate": "!newData.exists() || newData.hasChildren(['name', 'ts'])",
          "name":        { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100" },
          "description": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 500)" },
          "url":         { ".validate": "!newData.exists() || newData.isString()" },
          "price":       { ".validate": "!newData.exists() || newData.isNumber()" },
          "currency":    { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 5)" },
          "imageUrl":    { ".validate": "!newData.exists() || newData.isString()" },
          "category":    { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 40)" },
          "priority":    { ".validate": "!newData.exists() || (newData.isNumber() && newData.val() >= 1 && newData.val() <= 5)" },
          "tags":        { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 200)" },
          "ts":          { ".validate": "newData.isNumber() && newData.val() > 0" },
          "$other":      { ".validate": false }
        }
      },

      "reservations": {
        ".read": true,
        "$itemId": {
          ".write": "(!data.exists() && auth != null && newData.hasChildren(['name', 'ts'])) || (auth != null && auth.token.email === 'you@gmail.com' && auth.token.email_verified === true)",
          ".validate": "!newData.exists() || newData.hasChildren(['name', 'ts'])",
          "name":        { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 40" },
          "comment":     { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 200)" },
          "isAnonymous": { ".validate": "!newData.exists() || newData.val() === true || newData.val() === false" },
          "giftDate":    { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 20)" },
          "ts":          { ".validate": "newData.isNumber() && newData.val() > 0" },
          "$other":      { ".validate": false }
        }
      }
    }
  }
}
```

---

## Структура данных

### `bookings/{id}`

| Поле | Тип | Описание |
|---|---|---|
| `date` | string | Дата начала `YYYY-MM-DD` |
| `startTime` | string | Время начала `HH:MM` |
| `endTime` | string | Время окончания `HH:MM` |
| `endDate` | string | Дата окончания (если переходит через полночь) |
| `name` | string | Имя гостя |
| `activity` | string | Чем хотят заняться |
| `isAnonymous` | boolean | Скрыть детали от других |
| `status` | string | `pending` / `confirmed` |
| `ts` | number | Unix timestamp создания |
| `_meta` | object | IP, user-agent, часовой пояс гостя |

### `config`

| Поле | Тип | Описание |
|---|---|---|
| `referenceDate` | string | Дата первой рабочей смены для расчёта графика 2/2 |

### `sleep/{YYYY-MM-DD}`

| Поле | Тип | Описание |
|---|---|---|
| `start` | string | Время отхода ко сну `HH:MM` |
| `end` | string | Время подъёма `HH:MM` |

### `wishlist/items/{id}`

| Поле | Тип | Описание |
|---|---|---|
| `name` | string | Название товара |
| `description` | string | Описание |
| `url` | string | Ссылка на магазин |
| `price` | number | Цена |
| `currency` | string | Валюта |
| `imageUrl` | string | URL картинки или смайл |
| `category` | string | Категория |
| `priority` | number | Приоритет 1–5 |
| `tags` | string | Теги через запятую |
| `ts` | number | Unix timestamp создания |

### `wishlist/reservations/{itemId}`

| Поле | Тип | Описание |
|---|---|---|
| `name` | string | Имя бронирующего |
| `comment` | string | Комментарий |
| `giftDate` | string | Примерная дата вручения `YYYY-MM-DD` |
| `isAnonymous` | boolean | Анонимная бронь |
| `ts` | number | Unix timestamp создания |
