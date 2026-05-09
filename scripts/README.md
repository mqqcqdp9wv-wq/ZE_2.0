# Локальный dev — секреты через macOS Keychain

Боевые секреты `TELEGRAM_TOKEN`, `VK_TOKEN`, `VK_SECRET` живут в macOS Keychain, а не в `.env.local`. Ниже — как настроить локальное окружение и стартовать `vercel dev`.

## Однократная настройка

1. Получить актуальные значения:
   - `TELEGRAM_TOKEN` — `@BotFather` → `/mybots` → `@ze_studio48bid_bot` → `API Token`. Если ротировали — взять текущий из Vercel Project Settings.
   - `VK_TOKEN` — VK → группа → Управление сообществом → Работа с API → Ключи доступа.
   - `VK_SECRET` — VK → Работа с API → Callback API → Секретный ключ.

2. Положить в Keychain:

   ```bash
   security add-generic-password -a "$USER" -s "ze-studio-telegram-bot-token" -w '<token>' -U
   security add-generic-password -a "$USER" -s "ze-studio-vk-group-token"      -w '<token>' -U
   security add-generic-password -a "$USER" -s "ze-studio-vk-callback-secret"  -w '<secret>' -U
   ```

   Флаг `-U` обновляет существующую запись (без него — ошибка, если запись уже есть).

## Старт dev-сервера

```bash
./scripts/dev.sh
```

Скрипт читает значения из Keychain, экспортит в env и запускает `vercel dev`. `.env.local` не нужен — его быть не должно.

## Прочесть значение из Keychain (если нужно проверить)

```bash
security find-generic-password -a "$USER" -s "ze-studio-telegram-bot-token" -w
```

## gitleaks pre-commit hook

```bash
pip install pre-commit          # один раз на машине
pre-commit install              # в корне репо
```

Первый коммит запустит сборку `gitleaks` из исходников (~3–5 мин), дальше hook работает мгновенно.

## Что НЕ делать

- Не возвращать `.env.local` обратно в репо/диск. Если для какого-то нового интеграционного сценария нужны env vars, добавить новую запись в Keychain и расширить `scripts/dev.sh`.
- Не коммитить значения из Keychain в код. Если файл случайно содержит токен — gitleaks pre-commit это поймает.
- Не путать `VK_SECRET` (callback secret) с `VK_TOKEN` (group access token) — это разные сущности с разными источниками.
