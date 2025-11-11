// Яндекс.Метрика - Отслеживание целей
// Счётчик: 104717172

document.addEventListener('DOMContentLoaded', function() {
    
    // Цель 1: Клик по кнопке "Позвонить" (все ссылки tel:)
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (typeof ym !== 'undefined') {
                ym(104717172, 'reachGoal', 'phone_click');
                console.log('Яндекс.Метрика: Цель "phone_click" отправлена');
            }
        });
    });

    // Цель 2: Клик по кнопке "Оставить сообщение" (открытие модального окна)
    const messageButtons = document.querySelectorAll('[data-target="#send-request"]');
    messageButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            if (typeof ym !== 'undefined') {
                ym(104717172, 'reachGoal', 'message_open');
                console.log('Яндекс.Метрика: Цель "message_open" отправлена');
            }
        });
    });

    // Цель 3: Успешная отправка формы
    // Отслеживается в contact-form.js после успешной отправки
    // Добавим обработчик на событие успешной отправки
    window.addEventListener('formSuccess', function() {
        if (typeof ym !== 'undefined') {
            ym(104717172, 'reachGoal', 'form_submit');
            console.log('Яндекс.Метрика: Цель "form_submit" отправлена');
        }
    });
    
    console.log('Яндекс.Метрика цели инициализированы');
});
