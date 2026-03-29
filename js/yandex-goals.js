// Яндекс.Метрика - Отслеживание целей
// Счётчик: 104717172

document.addEventListener('DOMContentLoaded', function() {

    function goal(name) {
        if (typeof ym !== 'undefined') {
            ym(104717172, 'reachGoal', name);
            console.log('Метрика цель:', name);
        }
    }

    // Цель: Клик по кнопке "Позвонить" (все ссылки tel:)
    document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
        link.addEventListener('click', function() { goal('phone_click'); });
    });

    // Цель: Открытие модалки "Связаться"
    document.querySelectorAll('[data-target="#send-request"]').forEach(function(btn) {
        btn.addEventListener('click', function() { goal('message_open'); });
    });

    // Цель: Клик по кнопке Telegram в модалке
    var tgBtn = document.querySelector('.modal-btn-filled[href*="t.me"]');
    if (tgBtn) {
        tgBtn.addEventListener('click', function() { goal('telegram_click'); });
    }

    // Цель: Клик по кнопке ВКонтакте в модалке
    var vkBtn = document.querySelector('.modal-btn-outline[href*="vk.me"]');
    if (vkBtn) {
        vkBtn.addEventListener('click', function() { goal('vk_click'); });
    }

    // Цель: Клик по WhatsApp (если появится на сайте)
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(function(link) {
        link.addEventListener('click', function() { goal('whatsapp_click'); });
    });

    console.log('Яндекс.Метрика цели инициализированы');
});
