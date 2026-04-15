# VK Bot Menu Schema -- ze.studio

## Обзор

Меню VK-бота ze.studio описывается в файле `vk-bot-menu-structure.json`.
Каждый экран (меню, карточка, FAQ-ответ) -- это **узел** (node) со своим `id`.
Бот получает действие пользователя (`action`), находит целевой узел по `target` и отправляет его содержимое через VK API.

---

## Типы узлов (type)

### 1. `text_with_keyboard`

Текстовое сообщение + inline-клавиатура с кнопками навигации.

**Маппинг VK API:** `messages.send` с параметром `keyboard` (JSON-объект `VkKeyboard`).

```json
{
  "id": "main_menu",
  "type": "text_with_keyboard",
  "text": "Выберите раздел:",
  "image": null,
  "keyboard": {
    "inline": true,
    "buttons": [
      [
        {
          "label": "Плёнки",
          "action": "navigate",
          "target": "films",
          "color": "primary"
        }
      ],
      [
        {
          "label": "Услуги",
          "action": "navigate",
          "target": "services",
          "color": "secondary"
        }
      ]
    ]
  }
}
```

**Поля:**

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | string | Уникальный идентификатор узла |
| `type` | string | Всегда `"text_with_keyboard"` |
| `text` | string | Текст сообщения (поддерживает `\n`) |
| `image` | string / null | ID вложения VK или `null`. Для заливки: `"UPLOAD: описание"` |
| `keyboard.inline` | bool | `true` -- кнопки под сообщением, `false` -- внизу чата |
| `keyboard.buttons` | array[][] | Двумерный массив кнопок (строки x столбцы) |

**Кнопка:**

| Поле | Тип | Описание |
|------|-----|----------|
| `label` | string | Текст на кнопке (макс. 40 символов) |
| `action` | string | `"navigate"` -- переход к узлу, `"open_link"` -- внешняя ссылка, `"callback"` -- серверный обработчик |
| `target` | string | `id` целевого узла или URL |
| `color` | string | `"primary"` (синяя), `"secondary"` (белая), `"positive"` (зелёная), `"negative"` (красная) |

**VK API маппинг кнопки:**

```json
{
  "action": {
    "type": "callback",
    "label": "Плёнки",
    "payload": "{\"action\":\"navigate\",\"target\":\"films\"}"
  },
  "color": "primary"
}
```

Для `"action": "open_link"` используется `"type": "open_link"` с полем `"link"` вместо `payload`.

---

### 2. `carousel`

Горизонтальная карусель карточек (template carousel).

**Маппинг VK API:** `messages.send` с параметром `template` типа `carousel`.

```json
{
  "id": "films",
  "type": "carousel",
  "elements": [
    {
      "title": "RAYNO Centum",
      "description": "Керамическая плёнка с защитой от 95% ИК-излучения",
      "image": "UPLOAD: фото плёнки Centum на авто, 13:8",
      "buttons": [
        {
          "label": "Подробнее",
          "action": "navigate",
          "target": "film_centum"
        }
      ]
    }
  ]
}
```

**Поля элемента карусели:**

| Поле | Тип | Описание |
|------|-----|----------|
| `title` | string | Заголовок карточки (макс. 80 символов) |
| `description` | string | Описание (макс. 80 символов) |
| `image` | string | ID фото VK. При разработке: `"UPLOAD: описание"` |
| `buttons` | array | Массив кнопок (макс. 3 на карточку) |

**VK API маппинг элемента:**

```json
{
  "photo_id": "-123456_789012",
  "title": "RAYNO Centum",
  "description": "Керамическая плёнка...",
  "action": { "type": "open_photo" },
  "buttons": [
    {
      "action": {
        "type": "callback",
        "label": "Подробнее",
        "payload": "{\"action\":\"navigate\",\"target\":\"film_centum\"}"
      }
    }
  ]
}
```

---

### 3. `text_node`

Простое текстовое сообщение (с опциональным изображением) и кнопкой «Назад».

**Маппинг VK API:** `messages.send` с `message` (+ `attachment` если есть фото) и минимальной `keyboard`.

```json
{
  "id": "film_centum",
  "type": "text_node",
  "text": "RAYNO Centum -- керамическая плёнка...",
  "image": "UPLOAD: фото плёнки Centum крупным планом",
  "back_target": "films",
  "keyboard": {
    "inline": true,
    "buttons": [
      [
        {
          "label": "Узнать цену",
          "action": "navigate",
          "target": "contact",
          "color": "positive"
        }
      ],
      [
        {
          "label": "Назад",
          "action": "navigate",
          "target": "films",
          "color": "secondary"
        }
      ]
    ]
  }
}
```

---

### 4. `faq_node`

Ответ на конкретный вопрос FAQ. Содержит текст ответа и кнопку возврата к списку FAQ.

```json
{
  "id": "faq_price",
  "type": "faq_node",
  "question": "Почему плёнки RAYNO дороже обычных?",
  "text": "Премиум-плёнки стоят на 40-60% дороже...",
  "back_target": "faq"
}
```

**Маппинг VK API:** аналогичен `text_node` -- `messages.send` с `message` + inline `keyboard` с кнопкой «Назад к FAQ».

---

### 5. `callback_node`

Узел, требующий серверной обработки (например, запись телефона пользователя). Бот переходит в режим ожидания ввода.

```json
{
  "id": "contact",
  "type": "callback_node",
  "text": "Оставьте ваш номер телефона...",
  "await_input": "phone",
  "on_success": "contact_success",
  "keyboard": {
    "inline": true,
    "buttons": [
      [
        {
          "label": "Назад",
          "action": "navigate",
          "target": "main_menu",
          "color": "secondary"
        }
      ]
    ]
  }
}
```

**Маппинг VK API:** при получении следующего сообщения от пользователя бот проверяет формат телефона и отправляет уведомление менеджеру через внутренний API / CRM.

---

## Требования к изображениям

### Для карусели (`carousel`)

- **Рекомендованное соотношение сторон:** 13:8 (VK рекомендация)
- **Минимальная ширина:** 221 px
- **Рекомендованный размер:** 650 x 400 px или 1300 x 800 px
- **Формат:** JPG или PNG
- **Максимальный размер файла:** 50 МБ (ограничение VK API)
- Изображения загружаются через `photos.getMessagesUploadServer` + `photos.saveMessagesPhoto`

### Для обычных сообщений (`text_node`, `text_with_keyboard`)

- Произвольное соотношение сторон
- Загружаются аналогично через Photos API
- В JSON указывается как `"photo-OWNER_ID_PHOTO_ID"` после загрузки

### Плейсхолдеры

При разработке вместо реальных ID фото используется формат:

```
"UPLOAD: краткое описание нужного фото, соотношение"
```

Перед деплоем необходимо заменить все `UPLOAD:` на реальные ID загруженных фотографий.

---

## Как добавить / изменить пункт меню

### Добавить новый экран

1. Добавить новый объект в массив `nodes` файла `vk-bot-menu-structure.json`.
2. Указать уникальный `id`.
3. Выбрать `type` из списка выше.
4. Заполнить текстовые поля.
5. Добавить кнопку-ссылку на новый узел в родительском узле.

### Изменить существующий экран

1. Найти узел по `id` в массиве `nodes`.
2. Изменить нужные поля (`text`, `label`, `buttons` и т.д.).
3. Проверить, что все `target` ссылаются на существующие `id`.

### Добавить вопрос в FAQ

1. Добавить новый узел с `"type": "faq_node"` в `nodes`.
2. Добавить кнопку в `keyboard.buttons` узла `faq`, ссылающуюся на новый `id`.
3. Кнопка «Назад к FAQ» в новом узле должна вести на `"target": "faq"`.

### Добавить слайд в карусель

1. Найти carousel-узел (например, `"id": "films"`).
2. Добавить объект в массив `elements`.
3. При необходимости создать `text_node` для детальной страницы и указать его `id` в `target` кнопки слайда.

---

## Цвета кнопок VK

| Значение | Цвет | Назначение |
|----------|------|------------|
| `primary` | Синяя | Основное действие |
| `secondary` | Белая / серая | Вспомогательное действие, навигация |
| `positive` | Зелёная | Подтверждение, CTA |
| `negative` | Красная | Отмена, предупреждение |

---

## Ограничения VK Bot API

- Максимум 10 кнопок в одной клавиатуре (inline)
- Максимум 5 кнопок в одной строке
- Максимум 10 элементов в карусели
- Текст сообщения -- до 4096 символов
- Label кнопки -- до 40 символов
- Payload кнопки -- до 255 символов (JSON-строка)
