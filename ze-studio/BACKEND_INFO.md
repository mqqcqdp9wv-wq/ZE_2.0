# 🤖 Telegram Backend - Информация

## ✅ Что работает:

### **Backend API:**
- **URL:** `https://9001-itdase4sprh4qjvfj3yg6-0e616f0a.sandbox.novita.ai`
- **Метод:** POST
- **Content-Type:** application/json
- **Язык:** Python 3

### **Telegram Bot:**
- **Username:** @ze_studio48bid_bot
- **Token:** 8223297194:AAGrxlYqx67E4FqjMCd_3m_BWNAD-Lxd59A
- **Chat ID:** 8141249044 (Владислав @I9006)

---

## 📋 Формат запроса:

```json
{
  "goal": "Запись на тонировку",
  "name": "Иван Петров",
  "phone": "+7 (900) 123-45-67",
  "car": "BMW X5 2022",
  "service": "Полная тонировка",
  "film": "RAYNO Centum 80",
  "timing": "На этой неделе",
  "comment": "Царапина на заднем стекле"
}
```

---

## 📋 Формат ответа:

**Успех:**
```json
{
  "success": true,
  "message": "Заявка успешно отправлена в Telegram",
  "message_id": 35
}
```

**Ошибка:**
```json
{
  "success": false,
  "error": "Missing required fields: name or phone"
}
```

---

## 🚀 Запуск backend локально:

```bash
cd /home/user/webapp/contact-form
python3 send-telegram.py
```

Backend будет доступен на порту 9001.

---

## 📱 Формат сообщения в Telegram:

```
🎯 Запись на тонировку

👤 Имя: Иван Петров
📱 Телефон: +7 (900) 123-45-67
🚗 Автомобиль: BMW X5 2022

💼 Услуга: Полная тонировка
🎞 Пленка: RAYNO Centum 80
⏰ Когда: На этой неделе

💬 Комментарий:
Царапина на заднем стекле

🕐 20.10.2025 05:26:45
```

---

## 🔧 Для продакшена:

### **Вариант 1: Cloudflare Workers (рекомендуется)**
- Бесплатно до 100k запросов/день
- Работает 24/7
- Не нужен сервер
- Быстро (edge network)

### **Вариант 2: PHP на хостинге**
- Файл: `send-telegram.php`
- Требования: PHP 7.4+, curl
- Работает на большинстве хостингов

### **Вариант 3: Python на VPS**
- Файл: `send-telegram.py`
- Требования: Python 3.7+
- Нужен отдельный сервер

---

## 📝 Тестирование:

**Тестовая страница:**
https://9000-itdase4sprh4qjvfj3yg6-0e616f0a.sandbox.novita.ai/test-telegram.html

**Основная форма:**
https://9000-itdase4sprh4qjvfj3yg6-0e616f0a.sandbox.novita.ai

---

## ✅ Протестировано:

- [x] Backend запуск
- [x] Отправка через curl
- [x] Отправка через тестовую форму
- [x] Отправка через основную форму (3 варианта)
- [x] Форматирование сообщений
- [x] Обработка ошибок
- [x] CORS настройка

---

Последнее обновление: 20.10.2025 05:30
