/* ===================================
   CONTACT FORM LOGIC - QUICK VERSION
   =================================== */

(function ($) {
  'use strict';

  // Phone mask
  $('.phone-mask').on('input', function () {
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

  // Modal reset on close
  $('#send-request').on('hidden.bs.modal', function () {
    $('#step-success, #step-error').hide();
    $('#quick-form-wrapper').show();
    $('#form-quick')[0].reset();
  });

  // Retry button
  $('#btn-retry').on('click', function () {
    $('#step-error').hide();
    $('#quick-form-wrapper').show();
  });

  // Form submission handler
  $('#form-quick').on('submit', function (e) {
    e.preventDefault();

    // Check honeypot
    if ($('#form-quick input[name="website"]').val() !== '') {
      console.log('Spam detected');
      return false;
    }

    // Validate phone number
    const phone = $('#form-quick input[name="phone"]').val();
    if (!phone || phone.replace(/\D/g, '').length < 11) {
      alert('Пожалуйста, укажите корректный номер телефона');
      $('#form-quick input[name="phone"]').focus();
      return false;
    }

    const formData = {
      is_web_form: true,
      name: $('#form-quick input[name="name"]').val(),
      phone: $('#form-quick input[name="phone"]').val(),
      car: $('#form-quick input[name="car"]').val(),
      contact_method: $('#form-quick input[name="contact_method"]:checked').val()
    };

    submitForm(formData, '#form-quick');
  });

  function submitForm(data, formSelector) {
    const $btn = $(formSelector + ' button[type="submit"]');
    const originalText = $btn.text();

    // Disable button and show loading
    $btn.prop('disabled', true).text('Отправляем... ⏳');

    // Real AJAX request to Vercel bot
    $.ajax({
      url: 'https://functions.yandexcloud.net/d4ev49clqkt2jnls751u',
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      timeout: 10000,
      success: function () {
        showSuccess();
        $btn.prop('disabled', false).text(originalText);
      },
      error: function (xhr, status, error) {
        console.error('AJAX Error:', status, error);
        showError();
        $btn.prop('disabled', false).text(originalText);
      }
    });
  }

  function showSuccess() {
    $('#quick-form-wrapper').hide();
    $('#step-success').show();

    // Отправка цели в Яндекс.Метрику
    if (typeof ym !== 'undefined') {
      ym(104717172, 'reachGoal', 'form_submit');
      console.log('Яндекс.Метрика: Цель "form_submit" отправлена');
    }
  }

  function showError() {
    $('#quick-form-wrapper').hide();
    $('#step-error').show();
  }

})(jQuery);
