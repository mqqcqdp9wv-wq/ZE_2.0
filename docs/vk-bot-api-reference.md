# VK Bot API — Справочник для разработчика

Практический справочник по VK Bot API для построения интерактивных меню с каруселями, клавиатурами и callback-кнопками.

---

## 1. Отправка сообщений (messages.send)

### Базовый запрос

```javascript
async function sendMessage(peerId, message, options = {}) {
  const params = new URLSearchParams({
    peer_id: peerId,
    message: message,
    random_id: Math.floor(Math.random() * 1e9),
    access_token: VK_TOKEN,
    v: '5.199',
    ...options
  });

  const res = await fetch('https://api.vk.com/method/messages.send', {
    method: 'POST',
    body: params
  });
  return res.json();
}
```

### Ограничения
- Текст сообщения: до **4096 символов**
- Rate limit: **3 запроса/секунду** для сообщений сообщества
- `random_id` — обязательный, уникальный ID для предотвращения дублей

---

## 2. Клавиатуры (Keyboard)

### Inline-клавиатура (кнопки под сообщением)

```javascript
const keyboard = {
  inline: true,
  buttons: [
    [
      {
        action: {
          type: 'callback',
          label: 'Плёнки RAYNO',
          payload: JSON.stringify({ action: 'navigate', target: 'films' })
        },
        color: 'primary'
      },
      {
        action: {
          type: 'callback',
          label: 'Услуги',
          payload: JSON.stringify({ action: 'navigate', target: 'services' })
        },
        color: 'primary'
      }
    ],
    [
      {
        action: {
          type: 'callback',
          label: 'Связаться',
          payload: JSON.stringify({ action: 'navigate', target: 'contact' })
        },
        color: 'positive'
      }
    ]
  ]
};

await sendMessage(peerId, 'Выберите раздел:', {
  keyboard: JSON.stringify(keyboard)
});
```

### Обычная клавиатура (фиксированная внизу чата)

```javascript
const keyboard = {
  one_time: false,  // true — скрыть после нажатия
  inline: false,
  buttons: [
    [
      {
        action: { type: 'text', label: 'Главное меню' },
        color: 'primary'
      }
    ]
  ]
};
```

### Скрыть клавиатуру

```javascript
const keyboard = {
  buttons: [],
  one_time: true
};
```

### Типы кнопок (action.type)

| Тип | Описание | Поля |
|-----|----------|------|
| `text` | Обычная кнопка, отправляет label как сообщение | `label`, `payload` |
| `callback` | Callback-кнопка, не отправляет сообщение, генерирует `message_event` | `label`, `payload` |
| `open_link` | Открывает URL в браузере | `label`, `link` |
| `open_app` | Открывает VK Mini App | `label`, `app_id`, `owner_id`, `hash` |
| `vkpay` | Кнопка VK Pay | `hash` (параметры платежа) |
| `location` | Отправить местоположение | — |

### Цвета кнопок (color)

| Значение | Цвет | Использование |
|----------|------|---------------|
| `primary` | Синяя | Основное действие |
| `secondary` | Белая/серая | Второстепенное действие |
| `positive` | Зелёная | Подтверждение, CTA |
| `negative` | Красная | Отмена, опасное действие |

> Цвет доступен только для `text` и `callback` кнопок

### Ограничения клавиатуры

- Inline: максимум **6 строк**, **5 кнопок в строке**, всего до **10 кнопок**
- Обычная: максимум **10 строк**, **5 кнопок в строке**, всего до **40 кнопок**
- Label: до **40 символов**
- Payload: до **255 байт** (JSON-строка)

---

## 3. Карусель (Carousel)

Горизонтально прокручиваемые карточки с изображениями и кнопками.

### Структура

```javascript
const template = {
  type: 'carousel',
  elements: [
    {
      photo_id: '-123456_789012',  // ID загруженного фото (owner_photo)
      title: 'RAYNO Centum',
      description: 'Керамическая теплозащитная плёнка',
      action: {
        type: 'open_photo'  // действие при клике на карточку
      },
      buttons: [
        {
          action: {
            type: 'callback',
            label: 'Подробнее',
            payload: JSON.stringify({ action: 'navigate', target: 'film_centum' })
          }
        },
        {
          action: {
            type: 'open_link',
            label: 'На сайте',
            link: 'https://ze-studio48.ru/centum'
          }
        }
      ]
    },
    // ... ещё элементы
  ]
};

await sendMessage(peerId, '', {
  template: JSON.stringify(template)
});
```

### Отправка карусели

```javascript
async function sendCarousel(peerId, elements) {
  const template = {
    type: 'carousel',
    elements: elements.map(el => ({
      photo_id: el.photo_id,
      title: el.title,
      description: el.description,
      action: { type: 'open_photo' },
      buttons: el.buttons
    }))
  };

  const params = new URLSearchParams({
    peer_id: peerId,
    message: '',  // текст не обязателен при карусели
    random_id: Math.floor(Math.random() * 1e9),
    template: JSON.stringify(template),
    access_token: VK_TOKEN,
    v: '5.199'
  });

  const res = await fetch('https://api.vk.com/method/messages.send', {
    method: 'POST',
    body: params
  });
  return res.json();
}
```

### Ограничения карусели

- Максимум **10 элементов** (карточек)
- Каждый элемент: до **3 кнопок**
- `title`: до **80 символов**
- `description`: до **80 символов**
- Изображение: соотношение **13:8** рекомендовано, минимум **221px** ширина
- Рекомендуемый размер: **650×400px** или **1300×800px**
- Формат: JPG, PNG
- Действие карточки (`action.type`): `open_photo` или `open_link`

---

## 4. Callback-кнопки и message_event

Когда пользователь нажимает кнопку `type: "callback"`, VK присылает событие `message_event` вместо нового сообщения.

### Обработка в Callback API

```javascript
export default async function handler(req, res) {
  const { type, object, group_id } = req.body;

  if (type === 'confirmation') {
    return res.send(VK_CONFIRMATION);
  }

  // Обычное сообщение
  if (type === 'message_new') {
    const msg = object.message;
    await handleTextMessage(msg);
  }

  // Нажатие callback-кнопки
  if (type === 'message_event') {
    const { peer_id, user_id, event_id, payload } = object;

    // 1. Ответить на событие (убрать «загрузку» с кнопки)
    await sendMessageEventAnswer(event_id, user_id, peer_id);

    // 2. Обработать навигацию
    const { action, target } = payload;
    if (action === 'navigate') {
      await navigateToNode(peer_id, target);
    }
  }

  res.send('ok');
}
```

### messages.sendMessageEventAnswer

Обязательно вызывать после получения `message_event`, иначе кнопка будет «зависать» в состоянии загрузки.

```javascript
async function sendMessageEventAnswer(eventId, userId, peerId, eventData = {}) {
  const params = new URLSearchParams({
    event_id: eventId,
    user_id: userId,
    peer_id: peerId,
    event_data: JSON.stringify(eventData),
    access_token: VK_TOKEN,
    v: '5.199'
  });

  await fetch('https://api.vk.com/method/messages.sendMessageEventAnswer', {
    method: 'POST',
    body: params
  });
}
```

### Варианты event_data

```javascript
// 1. Показать snackbar (всплывающее уведомление)
{ type: 'show_snackbar', text: 'Раздел загружается...' }

// 2. Открыть ссылку
{ type: 'open_link', link: 'https://ze-studio48.ru' }

// 3. Открыть VK Mini App
{ type: 'open_app', app_id: 123456, owner_id: -123456, hash: 'param=value' }
```

---

## 5. Загрузка фото для бота

Чтобы использовать изображения в каруселях и сообщениях, нужно сначала загрузить фото через VK API.

### Шаг 1: Получить URL для загрузки

```javascript
async function getUploadUrl(peerId) {
  const params = new URLSearchParams({
    peer_id: peerId,
    access_token: VK_TOKEN,
    v: '5.199'
  });

  const res = await fetch('https://api.vk.com/method/photos.getMessagesUploadServer', {
    method: 'POST',
    body: params
  });
  const data = await res.json();
  return data.response.upload_url;
}
```

### Шаг 2: Загрузить файл

```javascript
async function uploadPhoto(uploadUrl, imageBuffer, filename) {
  const formData = new FormData();
  formData.append('photo', new Blob([imageBuffer]), filename);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  });
  return res.json(); // { server, photo, hash }
}
```

### Шаг 3: Сохранить фото

```javascript
async function savePhoto(server, photo, hash) {
  const params = new URLSearchParams({
    server,
    photo,
    hash,
    access_token: VK_TOKEN,
    v: '5.199'
  });

  const res = await fetch('https://api.vk.com/method/photos.saveMessagesPhoto', {
    method: 'POST',
    body: params
  });
  const data = await res.json();
  const p = data.response[0];

  // Формат для attachment: "photo{owner_id}_{id}"
  return {
    attachment: `photo${p.owner_id}_${p.id}`,
    photo_id: `${p.owner_id}_${p.id}`  // для карусели
  };
}
```

### Полный пример: загрузить и отправить

```javascript
async function sendPhotoMessage(peerId, imageBuffer, text) {
  const uploadUrl = await getUploadUrl(peerId);
  const uploaded = await uploadPhoto(uploadUrl, imageBuffer, 'photo.jpg');
  const saved = await savePhoto(uploaded.server, uploaded.photo, uploaded.hash);

  await sendMessage(peerId, text, {
    attachment: saved.attachment
  });
}
```

---

## 6. Навигация по меню (пример движка)

Пример кода, который читает `vk-bot-menu-structure.json` и рендерит узлы:

```javascript
import menuData from './vk-bot-menu-structure.json';

// Построить Map для быстрого поиска
const nodesMap = new Map(menuData.nodes.map(n => [n.id, n]));

async function navigateToNode(peerId, nodeId) {
  const node = nodesMap.get(nodeId);
  if (!node) return sendMessage(peerId, 'Раздел не найден');

  switch (node.type) {
    case 'text_with_keyboard':
    case 'text_node':
    case 'faq_node':
      return sendTextNode(peerId, node);

    case 'carousel':
      return sendCarouselNode(peerId, node);

    case 'callback_node':
      return sendCallbackNode(peerId, node);
  }
}

function buildVkKeyboard(node) {
  // Для faq_node — автоматическая кнопка «Назад»
  if (node.type === 'faq_node') {
    return {
      inline: true,
      buttons: [[{
        action: {
          type: 'callback',
          label: '◀️ Назад к FAQ',
          payload: JSON.stringify({ action: 'navigate', target: node.back_target })
        },
        color: 'secondary'
      }]]
    };
  }

  // Для остальных — конвертируем из структуры JSON
  return {
    inline: node.keyboard.inline,
    buttons: node.keyboard.buttons.map(row =>
      row.map(btn => {
        if (btn.action === 'open_link') {
          return {
            action: {
              type: 'open_link',
              label: btn.label,
              link: btn.target
            }
          };
        }
        return {
          action: {
            type: 'callback',
            label: btn.label,
            payload: JSON.stringify({ action: btn.action, target: btn.target })
          },
          color: btn.color || 'secondary'
        };
      })
    )
  };
}

async function sendTextNode(peerId, node) {
  const text = node.text || node.question + '\n\n' + node.text;
  const keyboard = buildVkKeyboard(node);

  const options = { keyboard: JSON.stringify(keyboard) };

  // Если есть изображение (и оно загружено)
  if (node.image && !node.image.startsWith('UPLOAD:')) {
    options.attachment = node.image;
  }

  await sendMessage(peerId, text, options);
}

async function sendCarouselNode(peerId, node) {
  const template = {
    type: 'carousel',
    elements: node.elements.map(el => ({
      photo_id: el.image.startsWith('UPLOAD:') ? undefined : el.image,
      title: el.title,
      description: el.description,
      action: { type: 'open_photo' },
      buttons: el.buttons.map(btn => ({
        action: {
          type: 'callback',
          label: btn.label,
          payload: JSON.stringify({ action: btn.action, target: btn.target })
        }
      }))
    }))
  };

  await sendMessage(peerId, '', { template: JSON.stringify(template) });
}

async function sendCallbackNode(peerId, node) {
  // Отправляем сообщение и ставим пользователя в режим ожидания ввода
  const keyboard = buildVkKeyboard(node);
  await sendMessage(peerId, node.text, { keyboard: JSON.stringify(keyboard) });

  // Состояние ожидания (хранить в Map/Redis)
  userStates.set(peerId, { awaiting: node.await_input, onSuccess: node.on_success });
}
```

---

## 7. Настройка Callback API в сообществе VK

### Шаги настройки

1. **Управление сообществом** → **Работа с API** → **Callback API**
2. Указать URL вашего сервера (например, `https://your-domain.vercel.app/api/vk`)
3. VK пришлёт `confirmation` запрос — ваш сервер должен ответить строкой-кодом
4. Включить нужные **Типы событий**:
   - `message_new` — новые сообщения
   - `message_event` — нажатия callback-кнопок
   - `message_reply` — ответы бота (опционально)

### Необходимые разрешения бота

В настройках **Ключи доступа** (Access Token) включить:
- `messages` — отправка/чтение сообщений
- `photos` — загрузка фотографий
- `manage` — управление сообществом (опционально)

### Получение VK Token

**Управление** → **Работа с API** → **Ключи доступа** → **Создать ключ**

---

## 8. Полезные советы

### Rate Limits
- `messages.send`: 3 запроса/сек для сообществ
- При массовой рассылке использовать задержки
- При превышении VK возвращает ошибку `too many requests per second`

### UX-рекомендации
- Используйте **callback-кнопки** вместо text — они не засоряют чат
- Всегда отвечайте на `message_event` через `sendMessageEventAnswer` — иначе кнопка «зависает»
- Показывайте snackbar при навигации: `{ type: 'show_snackbar', text: 'Загружаю...' }`
- Добавляйте кнопку «Назад» и «В меню» на каждом экране
- Не перегружайте карусель — 4-6 элементов оптимально

### Отладка
- Все ошибки VK API возвращают `{ error: { error_code, error_msg } }`
- Частые ошибки:
  - `901` — нет доступа к отправке сообщений (пользователь не подписан)
  - `914` — сообщение слишком длинное
  - `100` — неверные параметры
  - `7` — нет разрешений
