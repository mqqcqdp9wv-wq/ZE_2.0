/**
 * ZE Studio VK Bot — JSON ENGINE v2
 * Работает на базе vk-bot-menu-structure.json
 *
 * Схема потоков:
 * 1. Новый пользователь → кнопка «Начать» в VK → welcome + fixed keyboard
 * 2. Старый пользователь → нажал «☰ Меню» (fixed keyboard) → welcome
 * 3. Написал триггер («привет», «меню», «начать») → welcome
 * 4. Нажал inline-кнопку бота (payload) → навигация по узлу
 * 5. Написал свободный текст → уведомление Елене в Telegram + «передали мастеру»
 */

const fs = require('fs');
const path = require('path');

const VK_TOKEN        = process.env.VK_TOKEN_TEST;
const VK_CONFIRMATION = process.env.VK_CONFIRMATION_TEST;
const TELEGRAM_TOKEN  = process.env.TELEGRAM_TOKEN;
const ADMIN_ID        = process.env.ADMIN_ID;

// Загрузка структуры меню
const menuStructure = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'vk-bot-menu-structure.json'), 'utf8')
);

// ─── VK API ──────────────────────────────────────────────────────────────────

async function vkRequest(method, params) {
    const body = new URLSearchParams({ ...params, access_token: VK_TOKEN, v: '5.199' });
    try {
        const res = await fetch(`https://api.vk.com/method/${method}`, { method: 'POST', body });
        return res.json();
    } catch (e) {
        console.error(`VK error [${method}]:`, e);
    }
}

async function sendVk(userId, text, keyboard, attachment, template) {
    const params = {
        user_id:   userId,
        random_id: Math.floor(Math.random() * 1e9),
        message:   text || ' ',
    };
    if (keyboard)                              params.keyboard   = JSON.stringify(keyboard);
    if (attachment?.startsWith('photo-'))      params.attachment = attachment;
    if (template)                              params.template   = JSON.stringify(template);
    await vkRequest('messages.send', params);
}

async function answerCallbackEvent(eventId, userId, peerId) {
    await vkRequest('messages.sendMessageEventAnswer', {
        event_id: eventId, user_id: userId, peer_id: peerId
    });
}

async function getFirstName(userId) {
    try {
        const body = new URLSearchParams({ user_ids: userId, access_token: VK_TOKEN, v: '5.199' });
        const res  = await fetch('https://api.vk.com/method/users.get', { method: 'POST', body });
        const json = await res.json();
        return json.response?.[0]?.first_name || '';
    } catch (e) { return ''; }
}

// ─── Telegram уведомление ────────────────────────────────────────────────────

async function notifyElena(userId, userText) {
    if (!TELEGRAM_TOKEN || !ADMIN_ID) return;
    const vkLink = `https://vk.com/id${userId}`;
    const msg = `💬 <b>[ВК] Сообщение клиента</b>\n\n👤 <a href="${vkLink}">Профиль в ВК</a>\n\n📝 ${userText}`;
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_ID,
                text: msg,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
    } catch (e) {
        console.error('Telegram notify error:', e);
    }
}

// ─── Фиксированная клавиатура ────────────────────────────────────────────────
// Висит внизу чата у пользователя всегда — независимо от истории переписки.
// Кнопка type: 'text' — при нажатии отправляет «☰ Меню» как текст,
// бот ловит это как триггер и открывает welcome.

const FIXED_KEYBOARD = {
    inline:   false,
    one_time: false,
    buttons: [[{
        action: { type: 'text', label: '☰ Меню' },
        color: 'secondary'
    }]]
};

// Убрать фиксированную клавиатуру (если нужно сбросить)
const REMOVE_KEYBOARD = { buttons: [], one_time: true };

// ─── JSON Движок ─────────────────────────────────────────────────────────────

function renderKeyboard(jsonKeyboard) {
    if (!jsonKeyboard) return null;
    return {
        inline: !!jsonKeyboard.inline,
        buttons: jsonKeyboard.buttons.map(row => row.map(btn => {
            if (btn.action === 'open_link') {
                return {
                    action: { type: 'open_link', label: btn.label, link: btn.target },
                };
            }
            return {
                action: {
                    type:    'text',
                    label:   btn.label,
                    payload: JSON.stringify({ target: btn.target })
                },
                color: btn.color || 'secondary'
            };
        }))
    };
}

function renderCarousel(elements) {
    return {
        type: 'carousel',
        elements: elements.map(el => {
            const item = {
                title:       el.title.substring(0, 80),
                description: el.description.substring(0, 80),
                action:      { type: 'open_photo' },
                buttons: el.buttons.map(btn => ({
                    action: {
                        type:    'callback',
                        label:   btn.label.substring(0, 40),
                        payload: JSON.stringify({ target: btn.target })
                    }
                }))
            };
            if (el.image?.startsWith('photo-')) {
                item.photo_id = el.image.replace('photo', '');
            }
            return item;
        })
    };
}

async function executeNode(nodeId, userId, userName = '') {
    const node = menuStructure.nodes.find(n => n.id === nodeId);
    if (!node) {
        await sendVk(userId, `Раздел не найден: ${nodeId}`);
        return;
    }

    let text = (node.text || node.question || '').replace('{name}', userName);
    if (nodeId === 'welcome' && userName) {
        text = text.replace('Здравствуйте!', `Здравствуйте, ${userName}!`);
    }

    let keyboard = renderKeyboard(node.keyboard);
    const attachment = node.image?.startsWith('photo-') ? node.image : null;
    let template = null;

    if (node.type === 'carousel' && node.elements) {
        template = renderCarousel(node.elements);
        text = text || 'Смахните влево, чтобы посмотреть все варианты:';
    }

    // faq_node и text_node без своей клавиатуры — автокнопка «Назад»
    if ((node.type === 'faq_node' || node.type === 'text_node') && !keyboard && node.back_target) {
        keyboard = {
            inline: true,
            buttons: [[{
                action: { type: 'text', label: '◀ Назад', payload: JSON.stringify({ target: node.back_target }) },
                color: 'negative'
            }]]
        };
    }

    if (!keyboard) keyboard = REMOVE_KEYBOARD;

    await sendVk(userId, text, keyboard, attachment, template);

    // После welcome — устанавливаем фиксированную клавиатуру «☰ Меню»
    // Она останется внизу чата навсегда, пока бот её не уберёт
    if (nodeId === 'welcome') {
        await sendVk(userId, 'Кнопка «☰ Меню» внизу экрана — открывает это меню в любой момент.', FIXED_KEYBOARD);
    }
}

// ─── Главный обработчик ──────────────────────────────────────────────────────

module.exports.handler = async (event) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        // Подтверждение Callback URL
        if (body.type === 'confirmation') {
            return { statusCode: 200, body: VK_CONFIRMATION };
        }

        // ── Входящее сообщение ──────────────────────────────────────────────
        if (body.type === 'message_new') {
            const msg    = body.object?.message || body.object;
            const userId = msg?.from_id || msg?.user_id;
            const rawText = (msg?.text || '').trim();
            const text    = rawText.toLowerCase();

            // 1. Проверяем payload (нажатие кнопки бота)
            let targetNode = null;
            try {
                if (msg?.payload) {
                    const p = JSON.parse(msg.payload);
                    targetNode = p.target || p.cmd;
                }
            } catch (e) {}

            // 2. Триггеры → welcome
            // Включает «☰ меню» — это нажатие фиксированной кнопки снизу экрана
            const triggers = ['начать', 'start', 'привет', 'меню', 'в начало', 'начало', '☰ меню'];
            const isTrigger = triggers.some(t => text.includes(t));

            if (!targetNode && isTrigger) {
                targetNode = 'welcome';
            }

            if (targetNode === 'start') targetNode = 'welcome';

            // 3. Выполняем навигацию или уведомляем Елену
            if (targetNode) {
                const firstName = targetNode === 'welcome' ? await getFirstName(userId) : '';
                await executeNode(targetNode, userId, firstName);
            } else if (rawText) {
                // Свободный текст — человек не хочет идти через бота
                // Уведомляем Елену и отвечаем пользователю
                await notifyElena(userId, rawText);
                await sendVk(
                    userId,
                    'Получили ваш вопрос! Елена ответит в ближайшее время 🙂',
                    FIXED_KEYBOARD
                );
            }

            return { statusCode: 200, body: 'ok' };
        }

        // ── Нажатие callback-кнопки (inline) ───────────────────────────────
        if (body.type === 'message_event') {
            const { user_id: userId, peer_id: peerId, event_id: eventId, payload } = body.object;

            // Обязательно тушим спиннер на кнопке
            await answerCallbackEvent(eventId, userId, peerId);

            if (payload?.target) {
                const target = payload.target === 'start' ? 'welcome' : payload.target;
                await executeNode(target, userId);
            }

            return { statusCode: 200, body: 'ok' };
        }

        return { statusCode: 200, body: 'ok' };

    } catch (e) {
        console.error('Global error:', e);
        return { statusCode: 200, body: 'ok' };
    }
};
