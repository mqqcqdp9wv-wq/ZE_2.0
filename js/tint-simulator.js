/**
 * ИНТЕРАКТИВНЫЙ СИМУЛЯТОР ТОНИРОВКИ
 * ZE-STUDIO - Rayno Film Interactive Selector
 * 
 * Функционал:
 * - Визуальное изменение тонировки стёкол
 * - Обновление характеристик плёнки
 * - Анимированные переходы
 * - Детальная информация о каждой плёнке
 */

(function() {
  'use strict';

  // Данные плёнок
  const filmsData = {
    80: {
      name: 'RAYNO Centum 80',
      type: 'Керамическая атермальная плёнка',
      vlt: 80,
      tser: 39,
      uv: 99,
      ir: 80,
      opacity: 0.15, // 15% затемнения для 80% VLT
      description: '<p><strong>RAYNO Centum 80</strong> — это атермальная пленка для автомобилей на основе керамики, созданная с использованием передовой нанотехнологии Rayno, без красителей и металлов.</p><p>Керамическая пленка позволяет достичь сочетания высокого светопропускания и мощного отражения солнечной энергии. Плюс вы получите повышенную защиту от ультрафиолетовых лучей, потрясающую видимость и комфортную температуру в салоне без дополнительных затрат!</p>',
      features: [
        'Двухслойная конструкция без красителей и металлов',
        'Nano-Ceramic технология для долговечности',
        'Выцветание менее 1% за 10 лет',
        'Идеальна для лобового стекла',
        'Максимальное светопропускание с защитой'
      ]
    },
    50: {
      name: 'RAYNO Monocarbon 50',
      type: 'Углеродная тонировочная плёнка',
      vlt: 50,
      tser: 28,
      uv: 99.9,
      glare: 42,
      opacity: 0.40, // 40% затемнения для 50% VLT
      description: '<p><strong>RAYNO Monocarbon</strong> — это тонировочная пленка на основе настоящего углерода (карбона), созданная с использованием передовой нанотехнологии Rayno, без красителей и металлов.</p><p>Углерод (карбон) — это стабильная частица, обеспечивающая длительный срок службы в насыщенном угольном оттенке. Выцветание пленки на вашем автомобиле в течение 10 лет составит не более 1%!</p>',
      features: [
        'Настоящий углерод (карбон) в составе',
        'Без красителей — стабильный цвет',
        'Выцветание менее 1% за 10 лет',
        'Универсальная средняя тонировка',
        'Отличная видимость днём и ночью'
      ]
    },
    35: {
      name: 'RAYNO Monocarbon 35',
      type: 'Углеродная тонировочная плёнка',
      vlt: 35,
      tser: 35,
      uv: 99.9,
      glare: 59,
      opacity: 0.65, // 65% затемнения для 35% VLT
      description: '<p><strong>RAYNO Monocarbon 35</strong> — популярный выбор для комфортной тонировки, обеспечивающий хороший баланс приватности и видимости.</p><p>Идеально подходит для боковых и задних стёкол. Углеродная технология гарантирует насыщенный чёрный оттенок без выгорания на протяжении всего срока службы.</p>',
      features: [
        'Оптимальный баланс приватности и видимости',
        'Популярный выбор для боковых стёкол',
        'Nano-Carbon технология',
        'Повышенная защита от UV и тепла',
        'Насыщенный чёрный оттенок'
      ]
    },
    15: {
      name: 'RAYNO Monocarbon 15',
      type: 'Углеродная тонировочная плёнка',
      vlt: 15,
      tser: 45,
      uv: 99.9,
      glare: 80,
      opacity: 0.80, // 80% затемнения для 15% VLT
      description: '<p><strong>RAYNO Monocarbon 15</strong> — тёмная тонировка для максимальной приватности и защиты от солнца.</p><p>Рекомендуется для задних стёкол. Обеспечивает высокий уровень защиты салона от выгорания и перегрева, создавая комфортные условия для пассажиров.</p>',
      features: [
        'Высокая степень приватности',
        'Максимальная защита от UV (99.9%)',
        'Эффективное снижение бликов',
        'Защита салона от выгорания',
        'Стильный тёмный вид автомобиля'
      ]
    },
    5: {
      name: 'RAYNO Monocarbon 05',
      type: 'Углеродная тонировочная плёнка',
      vlt: 5,
      tser: 54,
      uv: 99.9,
      glare: 95,
      opacity: 1.0, // 100% затемнения для 5% VLT - полностью чёрное
      description: '<p><strong>RAYNO Monocarbon 05</strong> — лимузинная тонировка, обеспечивающая максимальный уровень приватности и защиты.</p><p>Почти полное затемнение стёкол создаёт эффект премиум-класса и максимально защищает салон от солнечных лучей. Рекомендуется только для задних стёкол.</p>',
      features: [
        'Максимальная приватность (лимузинная тонировка)',
        'Наивысшая защита от тепла и UV',
        'Премиальный внешний вид',
        'Почти полное блокирование бликов (95%)',
        'Только для задних стёкол'
      ]
    }
  };

  // Инициализация после загрузки DOM
  document.addEventListener('DOMContentLoaded', function() {
    initSimulator();
  });

  function initSimulator() {
    // Находим элементы
    const buttons = document.querySelectorAll('.vlt-btn');
    const tintOverlay = document.querySelector('.tint-overlay');
    const vltIndicator = document.querySelector('.vlt-indicator');
    const filmDetails = document.querySelector('.film-details');

    if (!buttons.length || !tintOverlay) {
      console.warn('Tint simulator elements not found');
      return;
    }

    // По умолчанию БЕЗ выбора - пользователь должен выбрать сам
    // Скрываем тонировку
    if (tintOverlay) {
      tintOverlay.style.opacity = 0;
    }
    
    // Скрываем индикатор VLT
    if (vltIndicator) {
      vltIndicator.style.display = 'none';
    }
    
    // Характеристики останутся скрытыми (opacity: 0 в CSS)

    // Обработчики кликов на кнопки
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const vlt = parseInt(this.dataset.vlt);
        
        // Убираем активный класс со всех кнопок
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Добавляем активный класс к текущей кнопке
        this.classList.add('active');
        
        // Обновляем симулятор
        updateSimulator(vlt);

        // Яндекс Метрика цель (если подключена)
        if (typeof ym !== 'undefined') {
          ym(104717172, 'reachGoal', 'film_select', {vlt: vlt});
        }
      });
    });

    function updateSimulator(vlt) {
      const filmData = filmsData[vlt];
      
      if (!filmData) {
        console.error('Film data not found for VLT:', vlt);
        return;
      }

      // Показываем индикатор VLT при первом выборе
      if (vltIndicator && vltIndicator.style.display === 'none') {
        vltIndicator.style.display = 'block';
      }

      // Обновляем тонировку
      updateTint(filmData.opacity);
      
      // Обновляем индикатор VLT
      updateVltIndicator(filmData.vlt);
      
      // Обновляем характеристики
      updateSpecs(filmData);
      
      // Обновляем детальную информацию
      updateDetails(filmData);
    }

    function updateTint(opacity) {
      // Применяем затемнение к маске
      if (tintOverlay) {
        tintOverlay.style.opacity = opacity;
        
        // Debug: выводим в консоль для проверки
        console.log('Tint opacity set to:', opacity);
        
        // Фоллбэк для браузеров без поддержки mask
        if (!CSS.supports('mask-image', 'url(test.png)') && !CSS.supports('-webkit-mask-image', 'url(test.png)')) {
          console.warn('Browser does not support CSS masks. Using fallback.');
          // Можно добавить альтернативный метод
        }
      }
    }

    function updateVltIndicator(vlt) {
      if (vltIndicator) {
        vltIndicator.innerHTML = `Подробнее`;
      }
    }

    function updateSpecs(filmData) {
      // Обновляем компактные характеристики с анимацией
      const specsWrapper = document.querySelector('.specs-wrapper');
      const specsCompact = document.querySelector('.specs-compact');
      const vltIndicator = document.querySelector('.vlt-indicator');
      
      if (specsCompact) {
        // Скрываем обертку перед обновлением
        if (specsWrapper) {
          specsWrapper.classList.remove('show');
        }
        
        setTimeout(() => {
          let specsHTML = `
          <div class="spec-compact-item">
            <span class="spec-compact-value">${filmData.vlt}%</span>
            <div class="spec-compact-label">VLT</div>
            <div class="spec-compact-desc">Светопропускание</div>
          </div>
          <div class="spec-compact-item">
            <span class="spec-compact-value">${filmData.tser}%</span>
            <div class="spec-compact-label">TSER</div>
            <div class="spec-compact-desc">Отражение энергии</div>
          </div>
          <div class="spec-compact-item">
            <span class="spec-compact-value">${filmData.uv}%</span>
            <div class="spec-compact-label">UV</div>
            <div class="spec-compact-desc">Защита от UV</div>
          </div>
        `;

        // Добавляем IR или Блики в зависимости от типа плёнки
        if (filmData.ir !== undefined) {
          specsHTML += `
            <div class="spec-compact-item">
              <span class="spec-compact-value">${filmData.ir}%</span>
              <div class="spec-compact-label">IR</div>
              <div class="spec-compact-desc">Инфракрасное</div>
            </div>
          `;
        } else if (filmData.glare !== undefined) {
          specsHTML += `
            <div class="spec-compact-item">
              <span class="spec-compact-value">${filmData.glare}%</span>
              <div class="spec-compact-label">Блики</div>
              <div class="spec-compact-desc">Снижение бликов</div>
            </div>
          `;
        }

        specsCompact.innerHTML = specsHTML;
        
        // Показываем обертку и индикатор
        if (specsWrapper) {
          specsWrapper.style.display = 'flex';
        }
        if (vltIndicator) {
          vltIndicator.style.display = 'block';
        }
        
        // Показываем с анимацией
        setTimeout(() => {
          if (specsWrapper) {
            specsWrapper.classList.add('show');
          }
        }, 50);
      }, 150);
      }

      // Обновляем название плёнки и показываем блок - ОТКЛЮЧЕНО
      // const filmNameBlock = document.querySelector('.film-name-block');
      // if (filmNameBlock) {
      //   // Показываем блок при первом выборе
      //   if (filmNameBlock.style.display === 'none') {
      //     filmNameBlock.style.display = 'block';
      //   }
      //   
      //   const titleEl = filmNameBlock.querySelector('.film-name-title');
      //   const subtitleEl = filmNameBlock.querySelector('.film-type-subtitle');
      //   
      //   if (titleEl) titleEl.textContent = filmData.name;
      //   if (subtitleEl) subtitleEl.textContent = filmData.type;
      // }
    }

    function updateDetails(filmData) {
      // Обновляем содержимое модального окна
      const modalBody = document.getElementById('filmModalBody');
      if (modalBody) {
        let featuresHTML = '<ul>';
        filmData.features.forEach(feature => {
          featuresHTML += `<li>${feature}</li>`;
        });
        featuresHTML += '</ul>';

        modalBody.innerHTML = `
          <h4>О плёнке ${filmData.name}</h4>
          ${filmData.description}
          <h4>Преимущества:</h4>
          ${featuresHTML}
          <h4>Рекомендации:</h4>
          <p>${getRecommendations(filmData.vlt)}</p>
        `;
      }
    }

    function getRecommendations(vlt) {
      switch(vlt) {
        case 80:
          return 'Идеально подходит для лобового стекла. Соответствует ГОСТу для передних стёкол (светопропускание более 70%). Обеспечивает отличную защиту от тепла и UV при максимальной видимости.';
        case 50:
          return 'Универсальный выбор для боковых стёкол. Хороший баланс между приватностью и видимостью. Комфортное вождение в любое время суток.';
        case 35:
          return 'Популярный вариант для боковых и задних стёкол. Обеспечивает хорошую приватность, сохраняя достаточную видимость изнутри автомобиля.';
        case 15:
          return 'Рекомендуется для задних боковых и заднего стекла. Высокий уровень приватности и защиты салона. Ночью видимость изнутри ограничена.';
        case 5:
          return 'Только для задних стёкол. Лимузинная тонировка с максимальной приватностью. Создаёт премиальный вид автомобиля. Запрещена на передних стёклах.';
        default:
          return 'Проконсультируйтесь с мастером для выбора оптимального варианта тонировки для вашего автомобиля.';
      }
    }
  }

  // Модальное окно для детальной информации
  function initModal() {
    const modal = document.getElementById('filmModal');
    const vltIndicator = document.querySelector('.vlt-indicator');
    const closeBtn = document.getElementById('filmModalClose');
    const overlay = document.getElementById('filmModalOverlay');

    if (!modal) return;

    // Открытие модального окна по клику на VLT индикатор
    if (vltIndicator) {
      vltIndicator.addEventListener('click', function() {
        // Открываем только если индикатор видим
        if (vltIndicator.style.display !== 'none') {
          modal.classList.add('show');
          document.body.style.overflow = 'hidden'; // Блокируем скролл
        }
      });
    }

    // Закрытие по кнопке X
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Закрытие по клику на overlay
    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });

    function closeModal() {
      modal.classList.remove('show');
      document.body.style.overflow = ''; // Разблокируем скролл
    }
  }

  // Инициализация модального окна после загрузки DOM
  document.addEventListener('DOMContentLoaded', initModal);
})();
