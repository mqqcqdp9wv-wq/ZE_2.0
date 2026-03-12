const TelegramBot = require('node-telegram-bot-api');

// Получаем токен из переменных окружения Vercel
const token = process.env.TELEGRAM_TOKEN;
// ID твоего аккаунта, куда будут приходить заявки
const ADMIN_ID = process.env.ADMIN_ID;

// Создаем бота в режиме webhook (без polling)
const bot = new TelegramBot(token);

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

// Это функция, которую будет вызывать Vercel при каждом новом сообщении
module.exports = async (req, res) => {
    try {
        // Проверяем, что это POST запрос от Telegram
        if (req.method === 'POST') {
            const update = req.body;
            const message = update.message;

            if (!message || !message.text) {
                return res.status(200).send('OK');
            }

            const chatId = message.chat.id;
            const text = message.text;

            // 1. ЕСЛИ ЭТО НОВОЕ СООБЩЕНИЕ ОТ КЛИЕНТА (команда /start)
            if (text === '/start') {
                const firstName = message.from.first_name || 'клиент';
                const msg = WELCOME_MESSAGE.replace('${firstName}', firstName);

                await bot.sendMessage(chatId, msg, { parse_mode: 'HTML', disable_web_page_preview: true });
                return res.status(200).send('OK');
            }

            // 2. ЕСЛИ ЭТО ОТВЕТ ОТ АДМИНА (тебя) КЛИЕНТУ
            // Если сообщение пришло от админа и это "ответ" (Reply) на сообщение бота
            if (chatId.toString() === ADMIN_ID && message.reply_to_message) {
                // Достаем ID клиента из пересланного сообщения
                const originalText = message.reply_to_message.text || '';
                const clientIdMatch = originalText.match(/ID: (\d+)/);

                if (clientIdMatch && clientIdMatch[1]) {
                    const targetClientId = clientIdMatch[1];
                    // Отправляем твой ответ клиенту
                    await bot.sendMessage(targetClientId, text);
                }
                return res.status(200).send('OK');
            }

            // 3. ЕСЛИ ЭТО ПРОСТО СООБЩЕНИЕ ОТ КЛИЕНТА ПЕРЕСЫЛАЕМ ЕГО ТЕБЕ
            if (chatId.toString() !== ADMIN_ID) {
                const username = message.from.username ? `@${message.from.username}` : message.from.first_name;
                const forwardMsg = `Новое обращение!\nОт: ${username}\nID: ${message.from.id}\n\nТекст:\n${text}`;

                // Пересылаем тебе
                await bot.sendMessage(ADMIN_ID, forwardMsg);
            }

        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Error');
    }
};
