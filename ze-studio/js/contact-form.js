/* ===================================
   CONTACT FORM LOGIC - HYBRID VERSION
   =================================== */

(function($) {
  'use strict';

  // LocalStorage keys
  const STORAGE_KEY = 'ze_studio_form_data';
  const STORAGE_TIMESTAMP = 'ze_studio_form_timestamp';
  const STORAGE_EXPIRY_DAYS = 30;

  // Current active goal
  let currentGoal = '';

  // Initialize when modal opens
  $('#send-request').on('show.bs.modal', function() {
    resetToSelection();
    loadSavedData();
  });

  // Goal card click handler
  $('.goal-card').on('click', function() {
    currentGoal = $(this).data('goal');
    showForm(currentGoal);
  });

  // Form submission handlers
  $('#form-booking').on('submit', handleBookingSubmit);
  $('#form-pricing').on('submit', handlePricingSubmit);
  $('#form-question').on('submit', handleQuestionSubmit);

  // Retry button
  $('#btn-retry').on('click', function() {
    resetToSelection();
  });

  // Phone mask
  $('.phone-mask').on('input', function() {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 0 && value[0] !== '7') {
      value = '7' + value;
    }
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    let formatted = '+7';
    if (value.length > 1) {
      formatted += ' (' + value.slice(1, 4);
    }
    if (value.length >= 5) {
      formatted += ') ' + value.slice(4, 7);
    }
    if (value.length >= 8) {
      formatted += '-' + value.slice(7, 9);
    }
    if (value.length >= 10) {
      formatted += '-' + value.slice(9, 11);
    }
    
    this.value = formatted;
  });

  // Save form data on input
  $('#form-booking input, #form-booking select, #form-booking textarea').on('change', function() {
    saveFormData();
  });

  /* ===================================
     FORM DISPLAY FUNCTIONS
     =================================== */

  function showForm(goal) {
    // Hide selection
    $('#step-selection').hide();
    
    // Show appropriate form
    if (goal === 'booking') {
      $('#modal-title').text('Запись на тонировку');
      $('#step-booking').show();
    } else if (goal === 'pricing') {
      $('#modal-title').text('Расчет стоимости');
      $('#step-pricing').show();
    } else if (goal === 'question') {
      $('#modal-title').text('Напишите ваше сообщение');
      $('#step-question').show();
    }
  }

  function resetToSelection() {
    // Hide all forms
    $('#step-booking, #step-pricing, #step-question, #step-success, #step-error').hide();
    
    // Show selection
    $('#step-selection').show();
    $('#modal-title').text('Давайте поговорим');
    
    // Reset forms
    $('#form-booking')[0].reset();
    $('#form-pricing')[0].reset();
    $('#form-question')[0].reset();
    
    currentGoal = '';
  }

  /* ===================================
     FORM SUBMISSION HANDLERS
     =================================== */

  function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Check honeypot
    if ($('#form-booking input[name="website"]').val() !== '') {
      console.log('Spam detected');
      return false;
    }
    
    // Validate phone number
    const phone = $('#form-booking input[name="phone"]').val();
    if (!phone || phone.replace(/\D/g, '').length < 11) {
      alert('Пожалуйста, укажите корректный номер телефона');
      $('#form-booking input[name="phone"]').focus();
      return false;
    }
    
    const formData = {
      goal: 'Запись на тонировку',
      name: $('#form-booking input[name="name"]').val(),
      phone: $('#form-booking input[name="phone"]').val(),
      car: $('#form-booking input[name="car"]').val(),
      services: getCheckedValues('#form-booking input[name="service[]"]:checked'),
      old_film: $('#form-booking input[name="old_film"]:checked').val(),
      when: $('#form-booking select[name="when"]').val(),
      comment: $('#form-booking textarea[name="comment"]').val(),
      source: $('#form-booking select[name="source"]').val(),
      has_photo: $('#form-booking input[name="has_photo"]').is(':checked') ? 'Да' : 'Нет',
      contact_method: $('#form-booking input[name="contact_method"]:checked').val()
    };
    
    submitForm(formData, '#form-booking');
  }

  function handlePricingSubmit(e) {
    e.preventDefault();
    
    // Check honeypot
    if ($('#form-pricing input[name="website"]').val() !== '') {
      console.log('Spam detected');
      return false;
    }
    
    // Validate phone number
    const phone = $('#form-pricing input[name="phone"]').val();
    if (!phone || phone.replace(/\D/g, '').length < 11) {
      alert('Пожалуйста, укажите корректный номер телефона');
      $('#form-pricing input[name="phone"]').focus();
      return false;
    }
    
    const formData = {
      goal: 'Узнать цены',
      name: $('#form-pricing input[name="name"]').val(),
      phone: $('#form-pricing input[name="phone"]').val(),
      car: $('#form-pricing input[name="car"]').val(),
      services: getCheckedValues('#form-pricing input[name="service[]"]:checked'),
      notes: $('#form-pricing textarea[name="notes"]').val() || 'Не указано',
      contact_method: $('#form-pricing input[name="contact_method"]:checked').val()
    };
    
    submitForm(formData, '#form-pricing');
  }

  function handleQuestionSubmit(e) {
    e.preventDefault();
    
    // Check honeypot
    if ($('#form-question input[name="website"]').val() !== '') {
      console.log('Spam detected');
      return false;
    }
    
    // Validate phone number
    const phone = $('#form-question input[name="phone"]').val();
    if (!phone || phone.replace(/\D/g, '').length < 11) {
      alert('Пожалуйста, укажите корректный номер телефона');
      $('#form-question input[name="phone"]').focus();
      return false;
    }
    
    const formData = {
      goal: 'Задать вопрос',
      name: $('#form-question input[name="name"]').val(),
      phone: $('#form-question input[name="phone"]').val(),
      car: $('#form-question input[name="car"]').val() || 'Не указано',
      message: $('#form-question textarea[name="message"]').val(),
      contact_method: $('#form-question input[name="contact_method"]:checked').val()
    };
    
    submitForm(formData, '#form-question');
  }

  /* ===================================
     FORM SUBMISSION
     =================================== */

  function submitForm(data, formSelector) {
    const $btn = $(formSelector + ' button[type="submit"]');
    const originalText = $btn.text();
    
    // Disable button and show loading
    $btn.prop('disabled', true).text('Отправляем... ⏳');
    
    // Log to console
    console.log('Form Data:', data);
    console.log('Formatted Message:', formatTelegramMessage(data));
    
    // Real AJAX request to Telegram backend
    $.ajax({
      url: 'https://9001-itdase4sprh4qjvfj3yg6-0e616f0a.sandbox.novita.ai',
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      timeout: 10000,
      success: function(response) {
        console.log('Success:', response);
        if (response.success) {
          showSuccess();
          clearSavedData();
        } else {
          console.error('Backend error:', response.error);
          showError();
        }
        $btn.prop('disabled', false).text(originalText);
      },
      error: function(xhr, status, error) {
        console.error('AJAX Error:', status, error);
        console.error('Response:', xhr.responseText);
        showError();
        $btn.prop('disabled', false).text(originalText);
      }
    });
  }

  function showSuccess() {
    $('#step-booking, #step-pricing, #step-question').hide();
    $('#step-success').show();
  }

  function showError() {
    $('#step-booking, #step-pricing, #step-question').hide();
    $('#step-error').show();
  }

  /* ===================================
     HELPER FUNCTIONS
     =================================== */

  function getCheckedValues(selector) {
    const values = [];
    $(selector).each(function() {
      values.push($(this).val());
    });
    return values.length > 0 ? values.join(', ') : 'Не выбрано';
  }

  function formatTelegramMessage(data) {
    let message = '🎯 НОВАЯ ЗАЯВКА: ' + data.goal + '\n';
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    message += '👤 Имя: ' + data.name + '\n';
    message += '📞 Телефон: ' + data.phone + '\n';
    
    if (data.car && data.car !== 'Не указано') {
      message += '🚗 Авто: ' + data.car + '\n';
    }
    
    if (data.services) {
      message += '\n🎨 Услуги:\n';
      const services = data.services.split(', ');
      services.forEach(function(service) {
        message += '✅ ' + service + '\n';
      });
    }
    
    if (data.old_film) {
      message += '\n🔧 Старая пленка: ' + data.old_film + '\n';
    }
    
    if (data.when) {
      message += '⏰ Когда: ' + data.when + '\n';
    }
    
    if (data.message) {
      message += '\n💬 Сообщение:\n' + data.message + '\n';
    }
    
    if (data.comment) {
      message += '\n📝 Комментарий:\n' + data.comment + '\n';
    }
    
    if (data.notes && data.notes !== 'Не указано') {
      message += '\n📝 Уточнения:\n' + data.notes + '\n';
    }
    
    if (data.source && data.source !== '') {
      message += '\n📍 Источник: ' + data.source + '\n';
    }
    
    if (data.has_photo === 'Да') {
      message += '\n📷 Клиент хочет отправить фото\n';
    }
    
    message += '\n💬 Предпочитает: ' + data.contact_method + '\n';
    message += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    message += '⏱ Отправлено: ' + new Date().toLocaleString('ru-RU') + '\n';
    message += '🌐 Источник: ze-studio.ru';
    
    return message;
  }

  /* ===================================
     LOCALSTORAGE FUNCTIONS
     =================================== */

  function saveFormData() {
    const data = {
      name: $('#form-booking input[name="name"]').val(),
      phone: $('#form-booking input[name="phone"]').val(),
      car: $('#form-booking input[name="car"]').val()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_TIMESTAMP, new Date().getTime());
  }

  function loadSavedData() {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP);
    
    if (!timestamp) return;
    
    // Check if data is expired (30 days)
    const now = new Date().getTime();
    const age = now - parseInt(timestamp);
    const maxAge = STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    if (age > maxAge) {
      clearSavedData();
      return;
    }
    
    // Load saved data
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        $('#form-booking input[name="name"]').val(data.name || '');
        $('#form-booking input[name="phone"]').val(data.phone || '');
        $('#form-booking input[name="car"]').val(data.car || '');
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }

  function clearSavedData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP);
  }

})(jQuery);
