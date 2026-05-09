#!/usr/bin/env bash
set -euo pipefail

# Wrapper для локального `vercel dev`.
# Читает секреты из macOS Keychain вместо .env.local.
# Установка ключей — см. docs/dev.md.

export ADMIN_ID="8141249044"
export VK_CONFIRMATION="1478c393"
export TELEGRAM_TOKEN=$(security find-generic-password -a "$USER" -s "ze-studio-telegram-bot-token" -w)
export VK_TOKEN=$(security find-generic-password -a "$USER" -s "ze-studio-vk-group-token" -w)
export VK_SECRET=$(security find-generic-password -a "$USER" -s "ze-studio-vk-callback-secret" -w)

exec vercel dev "$@"
