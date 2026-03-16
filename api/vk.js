// VK Callback API → автоответ + уведомление в Telegram

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const VK_CONFIRMATION = process.env.VK_CONFIRMATION;
const VK_TOKEN = process.env.VK_TOKEN;

// Текст автоответа клиенту в ВК
const AUTO_REPLY = `Здравствуйте! Мы получили ваше сообщение.
Сейчас мы связываемся с мастером для точного расчета стоимости и уточнения свободных окон по вашей машине. Ответим вам чуть позже.

А пока вы ожидаете ответ, коротко расскажем о нашем подходе и материалах:

• Мы работаем аккуратно и принципиально не снимаем обшивку дверей. Заводская сборка вашего автомобиля останется абсолютно нетронутой.

• Мы используем только проверенные материалы — американскую пленку Rayno. В наличии всегда есть два варианта:
  1. Классическая темная пленка на карбоновой (углеродной) основе. Она не выгорает и дает глубокий черный цвет. Есть любой процент затемнения на ваш выбор: от 5% до 50%.
  2. Керамическая атермальная пленка для передней полусферы. Она надежно защищает салон от нагрева и ультрафиолета.

Чтобы ваш выбор был действительно оправданным, вы можете почитать отзывы наших клиентов на Яндекс Картах (в 2026 году наша студия получила награду Яндекса «Хорошее место»).
Отзывы здесь: https://yandex.com/maps/org/studiya_tonirovaniya_yeleny_zakharovoy/20822113531/?ll=39.504331%2C52.592357&z=13

Если у вас срочный вопрос, вы можете не дожидаться ответа в чате и набрать напрямую мастеру: +7 (915) 858-21-15 (Елена).

Спасибо за ожидание, скоро вернемся к вам с расчетом!`;

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
