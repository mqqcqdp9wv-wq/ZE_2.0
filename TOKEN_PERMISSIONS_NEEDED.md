# 🔑 Необходимые разрешения для Cloudflare Pages через Wrangler

## ⚠️ ПРОБЛЕМА:
```
Authentication error [code: 10000]
A request to the Cloudflare API (/memberships) failed.
```

## ✅ РЕШЕНИЕ:

Нужно добавить **ЕЩЁ ОДНО** разрешение к токену!

---

## 📋 ПОЛНЫЙ СПИСОК РАЗРЕШЕНИЙ:

### **Вариант 1: Минимальные права (попробуем сначала)**

```
1. Account → Cloudflare Pages → Edit
2. User → User Details → Read  
3. Account → Account Settings → Read  ← ДОБАВИТЬ!
```

### **Вариант 2: Если не поможет - используйте шаблон**

Вместо Custom Token используйте готовый шаблон:

**"Edit Cloudflare Workers"** 
(Да, именно Workers! Он включает права на Pages тоже)

---

## 🎯 ЧТО ДЕЛАТЬ:

### **СПОСОБ А: Редактировать существующий токен**

1. Откройте: https://dash.cloudflare.com/profile/api-tokens
2. Найдите токен: "Name Pages" или "Wrangler Pages Full Access"
3. Нажмите: **Edit** (карандаш)
4. Добавьте разрешение: **Account → Account Settings → Read**
5. **Save**

### **СПОСОБ Б: Создать новый с шаблоном (ПРОЩЕ!)**

1. Откройте: https://dash.cloudflare.com/profile/api-tokens
2. **Create Token**
3. Найдите шаблон: **"Edit Cloudflare Workers"**
4. Нажмите: **Use template**
5. **Create Token**
6. Скопируйте новый токен

**Почему "Workers"?**
- Cloudflare Pages технически работает на Workers
- Шаблон "Workers" включает ВСЕ нужные права
- Это самый простой способ!

---

## 🚀 РЕКОМЕНДАЦИЯ:

**СПОСОБ Б (шаблон Workers) - САМЫЙ ПРОСТОЙ!**

Просто создайте токен из шаблона "Edit Cloudflare Workers" и всё заработает!

---

## 💡 АЛЬТЕРНАТИВА:

Если CLI продолжает давать ошибки, можем:
1. Задеплоить сайт вручную через `wrangler pages deploy`
2. Или всё-таки использовать Dashboard (5 минут, гарантированно работает)

Ваш выбор! 🙂
