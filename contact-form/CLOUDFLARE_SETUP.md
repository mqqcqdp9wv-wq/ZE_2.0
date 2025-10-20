# ☁️ Настройка Cloudflare Workers

## 📋 Пошаговая инструкция

---

## ШАГ 1: Регистрация/Вход в Cloudflare

### 1.1 Откройте Cloudflare Dashboard
🔗 **https://dash.cloudflare.com/**

### 1.2 Войдите или зарегистрируйтесь
- Если есть аккаунт - войдите
- Если нет - создайте бесплатный аккаунт

---

## ШАГ 2: Создание Worker

### 2.1 Перейдите в Workers & Pages
В левом меню найдите **"Workers & Pages"** и нажмите

### 2.2 Создайте новый Worker
Нажмите кнопку **"Create application"** → **"Create Worker"**

### 2.3 Назовите Worker
**Имя:** `ze-studio-telegram-bot`
(или любое другое, латиницей, без пробелов)

Нажмите **"Deploy"**

---

## ШАГ 3: Вставка кода

### 3.1 Откройте редактор
После создания нажмите **"Edit code"** (или "Quick edit")

### 3.2 Очистите весь код
Удалите весь код, который там есть по умолчанию

### 3.3 Вставьте наш код
Скопируйте **ВСЁ** содержимое файла `cloudflare-worker.js`

**Файл находится здесь:**
`/home/user/webapp/contact-form/cloudflare-worker.js`

**Или скопируйте отсюда:** ↓

```javascript
[СОДЕРЖИМОЕ ФАЙЛА cloudflare-worker.js]
```

### 3.4 Сохраните и задеплойте
Нажмите **"Save and Deploy"** (справа вверху)

---

## ШАГ 4: Получение URL

### 4.1 Скопируйте URL Worker'а
После деплоя вы увидите URL вида:
```
https://ze-studio-telegram-bot.YOUR-USERNAME.workers.dev
```

**ЭТО ВАЖНО!** Скопируйте этот URL - он понадобится!

### 4.2 Тест Worker'а
Нажмите **"Send"** рядом с URL - должна открыться страница с ошибкой "Method not allowed" - это нормально!

---

## ШАГ 5: Обновление формы

### 5.1 Откройте contact-form.js
Файл: `/home/user/webapp/contact-form/js/contact-form.js`

### 5.2 Найдите строку с URL
Ищите строку:
```javascript
url: 'https://9001-itdase4sprh4qjvfj3yg6-0e616f0a.sandbox.novita.ai',
```

### 5.3 Замените на ваш URL
```javascript
url: 'https://ze-studio-telegram-bot.YOUR-USERNAME.workers.dev',
```

### 5.4 Сохраните файл

---

## ШАГ 6: Тестирование

### 6.1 Откройте форму
🔗 https://9000-itdase4sprh4qjvfj3yg6-0e616f0a.sandbox.novita.ai

### 6.2 Заполните и отправьте
Заполните любую форму и нажмите "Отправить"

### 6.3 Проверьте Telegram
Должно прийти сообщение от @ze_studio48bid_bot

---

## ✅ Готово!

Теперь ваша форма работает на Cloudflare Workers:
- ✅ Работает 24/7
- ✅ Бесплатно до 100,000 запросов/день
- ✅ Быстро (edge network)
- ✅ Надёжно

---

## 🔧 Дополнительные настройки

### Custom Domain (опционально)
Можете настроить свой домен вместо *.workers.dev:
1. Workers & Pages → ваш worker
2. Settings → Triggers → Custom Domains
3. Add Custom Domain

### Мониторинг
В дашборде Worker'а можете смотреть:
- Количество запросов
- Ошибки
- Логи

### Обновление кода
Чтобы обновить код:
1. Откройте Worker в дашборде
2. Edit code
3. Внесите изменения
4. Save and Deploy

---

## ❓ Если что-то не работает

### Проблема: "Method not allowed"
✅ Это нормально при GET запросе. Форма работает через POST.

### Проблема: "Missing required fields"
❌ Проверьте, что заполнены имя и телефон

### Проблема: Сообщения не приходят
1. Проверьте Bot Token и Chat ID в коде Worker'а
2. Убедитесь, что бот @ze_studio48bid_bot активен
3. Проверьте логи в Cloudflare Dashboard

---

## 📞 Контакты

**Bot:** @ze_studio48bid_bot
**Chat ID:** 8141249044
**Владелец:** Владислав (@I9006)

---

Последнее обновление: 20.10.2025
