/**
 * ZE Studio VK Bot — JSON ENGINE 
 * Работает на базе vk-bot-menu-structure.json
 */
const fs = require('fs');
const path = require('path');

const VK_TOKEN = process.env.VK_TOKEN_TEST;
const VK_CONFIRMATION = process.env.VK_CONFIRMATION_TEST;

// Загрузка структуры меню
const menuStructure = JSON.parse(fs.readFileSync(path.join(__dirname, 'vk-bot-menu-structure.json'), 'utf8'));

// ─── Хелперы API ─────────────────────────────────────────────────────────────

async function vkRequest(method, params) {
    const body = new URLSearchParams({
        ...params,
        access_token: VK_TOKEN,
        v: '5.199'
    });
    try {
        await fetch(`https://api.vk.com/method/${method}`, { method: 'POST', body });
    } catch (e) {
        console.error(`VK error [${method}]:`, e);
    }
}

async function sendVk(userId, text, keyboard, attachment, template) {
    const params = {
        user_id: userId,
        random_id: Math.floor(Math.random() * 1e9),
        message: text || 'Выберите действие:',
    };
    if (keyboard) params.keyboard = JSON.stringify(keyboard);
    if (attachment && attachment.startsWith('photo-')) params.attachment = attachment;
    if (template) params.template = JSON.stringify(template);
    
    await vkRequest('messages.send', params);
}

async function answerCallbackEvent(eventId, userId, peerId) {
    await vkRequest('messages.sendMessageEventAnswer', {
        event_id: eventId,
        user_id: userId,
        peer_id: peerId
    });
}

async function getFirstName(userId) {
    try {
        const body = new URLSearchParams({ user_ids: userId, access_token: VK_TOKEN, v: '5.199' });
        const res = await fetch('https://api.vk.com/method/users.get', { method: 'POST', body });
        const json = await res.json();
        return json.response?.[0]?.first_name || '';
    } catch (e) { return ''; }
}

// ─── JSON Движок (Рендер нод) ─────────────────────────────────────────────────

function renderKeyboard(jsonKeyboard) {
    if (!jsonKeyboard) return null;
    return {
        inline: !!jsonKeyboard.inline,
        buttons: jsonKeyboard.buttons.map(row => row.map(btn => {
            const actionObj = {};
            if (btn.action === 'navigate' || btn.action === 'callback') {
                // Всегда используем type: 'text' для максимальной надежности (работает через message_new)
                actionObj.type = 'text';
                actionObj.label = btn.label;
                actionObj.payload = JSON.stringify({ target: btn.target });
            } else if (btn.action === 'open_link') {
                actionObj.type = 'open_link';
                actionObj.label = btn.label;
                actionObj.link = btn.target;
            }
            return {
                action: actionObj,
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
                title: el.title.substring(0, 80),
                description: el.description.substring(0, 80),
                action: { type: 'open_photo' },
                buttons: el.buttons.map(btn => ({
                    action: {
                        // Карусели в VK строго требуют type: 'callback' (или open_link). 
                        // Но если включен text, бот отрендерит их не как карусель, если VK ругнется. 
                        // Для каруселей оставляем callback.
                        type: 'callback',
                        label: btn.label.substring(0, 40),
                        payload: JSON.stringify({ target: btn.target })
                    }
                }))
            };
            if (el.image && el.image.startsWith('photo-')) {
                item.photo_id = el.image.replace('photo', ''); // для карусели нужен формат: -123_456
            }
            return item;
        })
    };
}

async function executeNode(nodeId, userId, userName = '') {
    const node = menuStructure.nodes.find(n => n.id === nodeId);
    if (!node) {
        await sendVk(userId, `Ошибка: Раздел ${nodeId} не найден.`);
        return;
    }

    let text = (node.text || node.question || '').replace('{name}', userName);
    if (nodeId === 'welcome' && userName) {
        text = text.replace('Здравствуйте!', `Здравствуйте, ${userName}!`);
    }

    const keyboard = renderKeyboard(node.keyboard);
    const attachment = (node.image && node.image.startsWith('photo-')) ? node.image : null;
    let template = null;

    if (node.type === 'carousel' && node.elements) {
        template = renderCarousel(node.elements);
        text = text || 'Смахните влево, чтобы посмотреть все варианты:';
    }

    let finalKeyboard = keyboard;

    // Если это FAQ или простой текст и нет своей клавиатуры, добавляем Назад
    if ((node.type === 'faq_node' || node.type === 'text_node') && !keyboard && node.back_target) {
        finalKeyboard = {
            inline: true,
            buttons: [[{ action: { type: 'text', label: '◀ Назад', payload: JSON.stringify({ target: node.back_target }) }, color: 'negative' }]]
        };
    }

    // Если клавиатуры вообще нет (и не сгенерена), всё равно отправляем пустую (inline: false), чтобы сбросить старое меню
    if (!finalKeyboard) {
        finalKeyboard = { buttons: [], one_time: true };
    }

    await sendVk(userId, text, finalKeyboard, attachment, template);
}

// ─── Главный обработчик ──────────────────────────────────────────────────────

module.exports.handler = async (event) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        if (body.type === 'confirmation') return { statusCode: 200, body: VK_CONFIRMATION };

        // Обработка текстовых сообщений
        if (body.type === 'message_new') {
            const msg = body.object?.message || body.object;
            const userId = msg?.from_id || msg?.user_id;
            const text = (msg?.text || '').trim().toLowerCase();
            
            let targetNode = null;
            try {
                if (msg?.payload) {
                    const p = JSON.parse(msg.payload);
                    targetNode = p.target || p.cmd;
                }
            } catch (e) {}

            const triggers = ['начать', 'start', 'привет', 'меню', 'в начало', 'начало'];
            const isTrigger = triggers.some(t => text.includes(t));

            if (!targetNode && isTrigger) {
                // Принудительно уничтожаем старую кнопочную клавиатуру внизу экрана
                await sendVk(userId, "✅ Загружаем смарт-меню ZE.Studio...", { buttons: [], one_time: true });
                targetNode = 'welcome';
            }
            
            if (targetNode === 'start') {
                targetNode = 'welcome';
            }

            if (targetNode) {
                const firstName = targetNode === 'welcome' ? await getFirstName(userId) : '';
                await executeNode(targetNode, userId, firstName);
            } else if (text) {
                 // Если человек просто написал текст (любой другой), возвращаем его в главное меню
                 await executeNode('welcome', userId);
            }
            return { statusCode: 200, body: 'ok' };
        }

        // Обработка кликов по Inline-клавиатурам
        if (body.type === 'message_event') {
            const userId = body.object.user_id;
            const peerId = body.object.peer_id;
            const eventId = body.object.event_id;
            const payload = body.object.payload;

            // Всегда тушим спиннер загрузки на кнопке
            await answerCallbackEvent(eventId, userId, peerId);

            if (payload && payload.target) {
                let target = payload.target;
                if (target === 'start') target = 'welcome';
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
