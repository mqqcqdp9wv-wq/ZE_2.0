/**
 * Cloudflare Worker для ZE-Studio Contact Form
 * Отправка заявок в Telegram Bot
 */

// ============================================
// CONFIGURATION
// ============================================
const TELEGRAM_BOT_TOKEN = '8223297194:AAGrxlYqx67E4FqjMCd_3m_BWNAD-Lxd59A';
const TELEGRAM_CHAT_ID = '8141249044'; // Владислав (@I9006)

// ============================================
// MAIN HANDLER
// ============================================
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only accept POST
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.phone) {
      return jsonResponse({ 
        success: false, 
        error: 'Missing required fields: name or phone' 
      }, 400);
    }

    // Format message
    const message = formatTelegramMessage(data);

    // Send to Telegram
    const result = await sendToTelegram(message);

    if (result.success) {
      return jsonResponse({
        success: true,
        message: 'Заявка успешно отправлена в Telegram',
        message_id: result.message_id
      });
    } else {
      return jsonResponse({
        success: false,
        error: result.error
      }, 500);
    }

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message
    }, 500);
  }
}

// ============================================
// FORMAT MESSAGE
// ============================================
function formatTelegramMessage(data) {
  const goal = data.goal || 'Новая заявка';
  let message = `🎯 <b>${goal}</b>\n\n`;

  // Basic info
  if (data.name) {
    message += `👤 <b>Имя:</b> ${escapeHtml(data.name)}\n`;
  }

  if (data.phone) {
    message += `📱 <b>Телефон:</b> ${escapeHtml(data.phone)}\n`;
  }

  if (data.car) {
    message += `🚗 <b>Автомобиль:</b> ${escapeHtml(data.car)}\n`;
  }

  // Service details
  if (data.service) {
    message += `\n💼 <b>Услуга:</b> ${escapeHtml(data.service)}\n`;
  }

  if (data.services) {
    const servicesList = Array.isArray(data.services) 
      ? data.services.join(', ') 
      : data.services;
    message += `\n💼 <b>Услуги:</b> ${escapeHtml(servicesList)}\n`;
  }

  if (data.old_film) {
    message += `🔄 <b>Старая пленка:</b> ${escapeHtml(data.old_film)}\n`;
  }

  if (data.film) {
    message += `🎞 <b>Пленка:</b> ${escapeHtml(data.film)}\n`;
  }

  if (data.timing) {
    message += `⏰ <b>Когда:</b> ${escapeHtml(data.timing)}\n`;
  }

  if (data.when) {
    message += `⏰ <b>Когда:</b> ${escapeHtml(data.when)}\n`;
  }

  if (data.source) {
    message += `📍 <b>Откуда узнали:</b> ${escapeHtml(data.source)}\n`;
  }

  if (data.has_photo) {
    message += `📷 <b>Есть фото:</b> ${escapeHtml(data.has_photo)}\n`;
  }

  if (data.contact_method) {
    message += `📞 <b>Как связаться:</b> ${escapeHtml(data.contact_method)}\n`;
  }

  // Comments
  if (data.comment) {
    message += `\n💬 <b>Комментарий:</b>\n${escapeHtml(data.comment)}\n`;
  }

  if (data.notes) {
    message += `\n📝 <b>Уточнения:</b>\n${escapeHtml(data.notes)}\n`;
  }

  if (data.message) {
    message += `\n✉️ <b>Сообщение:</b>\n${escapeHtml(data.message)}\n`;
  }

  // Timestamp
  const now = new Date();
  const timestamp = now.toLocaleString('ru-RU', { 
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  message += `\n🕐 ${timestamp}`;

  return message;
}

// ============================================
// SEND TO TELEGRAM
// ============================================
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result.ok) {
      return {
        success: true,
        message_id: result.result.message_id
      };
    } else {
      return {
        success: false,
        error: result.description || 'Unknown Telegram API error'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// HELPERS
// ============================================
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
