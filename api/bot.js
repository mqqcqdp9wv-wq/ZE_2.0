// Получаем токен из переменных окружения Vercel
const token = process.env.TELEGRAM_TOKEN;
// ID твоего аккаунта, куда будут приходить заявки
const ADMIN_ID = process.env.ADMIN_ID;

// Приветственное сообщение
const WELCOME_MESSAGE = `Здравствуйте! 👋

Вы обратились в центр автотонирования <b>ZE.Studio</b>.

Чтобы мы могли сразу назвать точную стоимость, пожалуйста, напишите:
• Марку и модель вашего автомобиля
• Какие элементы необходимо затонировать

Специалист присоединится к чату и ответит вам в течение нескольких минут. В ожидании ответа вы можете:
• Ознакомиться с нашими работами <a href="https://vk.com/tonirowka48">ВКонтакте</a>
• Прочитать отзывы и посмотреть адрес на <a href="https://yandex.ru/maps/-/CDu~mGzX">Яндекс Картах</a>

Для связи с мастером напрямую: +7 (915) 858-21-15`;

// Хелпер для отправки сообщений через Telegram API (без сторонних библиотек)
async function sendTelegramMessage(chatId, text, options = {}) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, ...options })
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Telegram API error: ${res.status} ${err}`);
    }
    return res.json();
}

// Это функция, которую будет вызывать Vercel при каждом новом сообщении
module.exports = async (req, res) => {
    try {
        // Проверяем, что это POST запрос
        if (req.method === 'POST') {
            const update = req.body;

            // 0. ЕСЛИ ЭТО ЗАЯВКА С ВЕБ-САЙТА (из формы)
            if (update && update.is_web_form) {
                const msg = `📩 <b>[САЙТ] Новая заявка</b>\n\n👤 Имя: ${update.name}\n📱 Телефон: ${update.phone}\n💬 Удобно: Написать в ${update.contact_method}\n🚗 Авто: ${update.car}`;
                await sendTelegramMessage(ADMIN_ID, msg, { parse_mode: 'HTML' });
                return res.status(200).json({ success: true });
            }

            // ИНАЧЕ ЭТО СТАНДАРТНОЕ СООБЩЕНИЕ ИЗ ТЕЛЕГРАМА
            const message = update.message;

            if (!message || !message.text) {
                return res.status(200).send('OK');
            }

            const chatId = message.chat.id;
            const text = message.text;

            // 1. ЕСЛИ ЭТО НОВОЕ СООБЩЕНИЕ ОТ КЛИЕНТА (команда /start)
            if (text === '/start') {
                await sendTelegramMessage(chatId, WELCOME_MESSAGE, { parse_mode: 'HTML', disable_web_page_preview: true });
                return res.status(200).send('OK');
            }

            // 1b. /start с данными из формы сайта (deeplink: /start form_79XXXXXXXXX)
            if (text.startsWith('/start form_')) {
                const phone = text.replace('/start form_', '');
                const username = message.from.username ? `@${message.from.username}` : message.from.first_name;

                // Отправляем клиенту приветствие
                await sendTelegramMessage(chatId, WELCOME_MESSAGE, { parse_mode: 'HTML', disable_web_page_preview: true });

                // Уведомляем админа — клиент с формы активировал бота
                const adminMsg = `🔗 <b>Клиент с сайта подключился в Telegram!</b>\n\nОт: ${username}\nID: ${message.from.id}\nТелефон из формы: +${phone}\n\n💡 Теперь можно ответить через Reply на это сообщение.`;
                await sendTelegramMessage(ADMIN_ID, adminMsg, { parse_mode: 'HTML' });

                return res.status(200).send('OK');
            }

            // 2. ЕСЛИ ЭТО ОТВЕТ ОТ АДМИНА (тебя) КЛИЕНТУ
            if (chatId.toString() === ADMIN_ID && message.reply_to_message) {
                const originalText = message.reply_to_message.text || '';
                const clientIdMatch = originalText.match(/ID: (\d+)/);

                if (clientIdMatch && clientIdMatch[1]) {
                    const targetClientId = clientIdMatch[1];
                    await sendTelegramMessage(targetClientId, text);
                }
                return res.status(200).send('OK');
            }

            // 3. ЕСЛИ ЭТО ПРОСТО СООБЩЕНИЕ ОТ КЛИЕНТА — ПЕРЕСЫЛАЕМ ТЕБЕ
            if (chatId.toString() !== ADMIN_ID) {
                const username = message.from.username ? `@${message.from.username}` : message.from.first_name;
                const forwardMsg = `Новое обращение!\nОт: ${username}\nID: ${message.from.id}\n\nТекст:\n${text}`;
                await sendTelegramMessage(ADMIN_ID, forwardMsg);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ error: error.message });
    }
};
