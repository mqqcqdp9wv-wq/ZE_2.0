// VK Callback API → Telegram
// Получает сообщения из группы ВКонтакте и пересылает в Telegram

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const VK_CONFIRMATION = process.env.VK_CONFIRMATION; // строка подтверждения из настроек ВК
const VK_SECRET = process.env.VK_SECRET;             // секретный ключ из настроек ВК

async function sendTelegramMessage(text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: ADMIN_ID,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        })
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Telegram API error: ${res.status} ${err}`);
    }
    return res.json();
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const body = req.body;

        // 1. Подтверждение адреса — отвечаем без проверки секрета
        if (body.type === 'confirmation') {
            return res.status(200).send(VK_CONFIRMATION);
        }


        // 2. Новое сообщение в группу
        if (body.type === 'message_new') {
            const msg = body.object?.message || body.object;
            const text = msg?.text || '';
            const fromId = msg?.from_id || msg?.user_id || '?';
            const attachments = msg?.attachments || [];

            // Ссылка на профиль ВК
            const vkLink = fromId > 0
                ? `https://vk.com/id${fromId}`
                : `https://vk.com/club${Math.abs(fromId)}`;

            // Формируем сообщение
            let telegramText = `💬 <b>[ВКонтакте] Новое сообщение</b>\n\n`;
            telegramText += `👤 Профиль: <a href="${vkLink}">vk.com/id${fromId}</a>\n`;

            if (text) {
                telegramText += `\n📝 Текст:\n${text}`;
            }

            if (attachments.length > 0) {
                const types = attachments.map(a => a.type).join(', ');
                telegramText += `\n📎 Вложения: ${types}`;
            }

            await sendTelegramMessage(telegramText);
        }

        // ВК ожидает ответ "ok"
        return res.status(200).send('ok');

    } catch (error) {
        console.error('VK webhook error:', error);
        // Всё равно отвечаем "ok" чтобы ВК не ретраил
        return res.status(200).send('ok');
    }
};
