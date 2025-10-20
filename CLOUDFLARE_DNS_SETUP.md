# 🌐 Настройка DNS для Cloudflare Pages

## Проблема:
Cloudflare Pages показывает ошибку: **"CNAME record not set"**

## Причина:
Когда домен уже в Cloudflare DNS, Pages не может автоматически создать CNAME запись.

---

## ✅ РЕШЕНИЕ: Настроить DNS вручную

### Шаг 1: Открой Cloudflare Dashboard
1. Зайди на https://dash.cloudflare.com
2. Войди с аккаунтом где находится домен `ze-studio48.ru`

### Шаг 2: Перейди в DNS настройки
1. Выбери домен **ze-studio48.ru** из списка
2. Перейди в раздел **DNS** → **Records**

### Шаг 3: УДАЛИ старые записи для корневого домена
Найди и **удали** следующие записи для `ze-studio48.ru` (без www):
- ❌ A записи (если есть)
- ❌ AAAA записи (если есть)
- ❌ Старые CNAME записи (если есть)

### Шаг 4: Добавь CNAME запись для Pages
Создай **новую CNAME** запись:

```
Type: CNAME
Name: @ (или ze-studio48.ru)
Target: ze-studio-production.pages.dev
TTL: Auto
Proxy status: Proxied (оранжевое облако ВКЛ)
```

**ВАЖНО:** 
- Используй `@` для корневого домена
- Target должен быть: `ze-studio-production.pages.dev`
- Включи Proxy (оранжевое облако)

### Шаг 5: (Опционально) Добавь WWW
Если хочешь, чтобы `www.ze-studio48.ru` тоже работал:

```
Type: CNAME
Name: www
Target: ze-studio-production.pages.dev
TTL: Auto
Proxy status: Proxied (оранжевое облако ВКЛ)
```

---

## 🎯 Альтернатива: CNAME Flattening

Если Cloudflare не позволяет создать CNAME для корневого домена, используй:

```
Type: CNAME
Name: @
Target: ze-studio-production.pages.dev
```

Cloudflare автоматически сделает "CNAME flattening" и преобразует в A записи.

---

## ⏱️ После настройки:

1. **Подожди 2-5 минут** для DNS propagation
2. **Проверь сайт**: https://ze-studio48.ru
3. **Проверь форму**: отправь тестовое сообщение

---

## 🔍 Проверка DNS:

После настройки можешь проверить через командную строку:

```bash
curl -s "https://dns.google/resolve?name=ze-studio48.ru&type=CNAME" | jq '.'
```

Должно вернуть что-то вроде:
```json
{
  "Answer": [
    {
      "name": "ze-studio48.ru.",
      "type": 5,
      "data": "ze-studio-production.pages.dev."
    }
  ]
}
```

---

## 📝 Текущий статус:

- ✅ Cloudflare Pages проект создан: `ze-studio-production`
- ✅ Сайт задеплоен: https://bace1a56.ze-studio-production.pages.dev
- ✅ Telegram Worker: https://bot.ze-studio48.ru
- ⏳ Домен ze-studio48.ru: ждёт настройки DNS
- ❌ GitHub Pages: удалён из настроек

---

## 🆘 Если возникнут проблемы:

1. Проверь, что удалил старые A записи для корневого домена
2. Убедись, что CNAME Target точно: `ze-studio-production.pages.dev`
3. Включи Proxy (оранжевое облако)
4. Подожди минимум 2-5 минут после изменений
