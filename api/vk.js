// VK Callback API → автоответ + уведомление в Telegram

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const VK_CONFIRMATION = process.env.VK_CONFIRMATION;
const VK_TOKEN = process.env.VK_TOKEN;

// Текст автоответа клиенту в ВК
const AUTO_REPLY = `Здравствуйте! Мы получили ваше сообщение 👋

Сейчас связываемся с мастером — уточним стоимость и свободное время. Ответим чуть позже.

О нашем подходе:

🔧 Не снимаем обшивку дверей — заводская сборка остаётся нетронутой.

🎬 Работаем только с американской плёнкой Rayno. Два варианта:
1. Карбоновая тёмная — не выгорает, глубокий чёрный, любой % от 5 до 50
2. Керамическая атермальная — защита от нагрева и УФ для передней полусферы

🏆 В 2026 году студия получила награду Яндекса «Хорошее место». Отзывы клиентов:
https://yandex.ru/maps/-/CDu~mGzX

Срочный вопрос? Звоните напрямую мастеру:
📞 +7 (915) 858-21-15 (Елена)

Скоро вернёмся к вам с расчётом!`;

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
    return res.json();
}

async function sendVkMessage(userId, message) {
    const randomId = Math.floor(Math.random() * 1000000);
    const url = `https://api.vk.com/method/messages.send?user_id=${userId}&message=${encodeURIComponent(message)}&random_id=${randomId}&access_token=${VK_TOKEN}&v=5.199`;
    const res = await fetch(url);
    return res.json();
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const body = req.body;

        // 1. Подтверждение адреса
        if (body.type === 'confirmation') {
            return res.status(200).send(VK_CONFIRMATION);
        }

        // 2. Новое сообщение в группу
        if (body.type === 'message_new') {
            const msg = body.object?.message || body.object;
            const text = msg?.text || '';
            const fromId = msg?.from_id || msg?.user_id;

            // Автоответ клиенту в ВК
            if (fromId && fromId > 0) {
                await sendVkMessage(fromId, AUTO_REPLY);
            }

            // Уведомление тебе в Telegram
            const vkLink = `https://vk.com/id${fromId}`;
            let telegramText = `💬 <b>[ВК] Новое сообщение</b>\n\n`;
            telegramText += `👤 <a href="${vkLink}">Профиль клиента</a>\n`;
            if (text) telegramText += `\n📝 ${text}`;

            const attachments = msg?.attachments || [];
            if (attachments.length > 0) {
                telegramText += `\n📎 Вложения: ${attachments.map(a => a.type).join(', ')}`;
            }

            await sendTelegramMessage(telegramText);
        }

        return res.status(200).send('ok');

    } catch (error) {
        console.error('VK webhook error:', error);
        return res.status(200).send('ok');
    }
};
