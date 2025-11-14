( function($) {
  'use strict';
  	

  	/* Window Load */
	$(window).on('load',function(){
		$('.loader').fadeOut(200);
	});


	/* Parallax - отключен на мобильных устройствах */
	if ($(window).width() > 767) {
		$('.jarallax').jarallax({
		    speed: 0.75
		});
	}

    
	/* Aos */
	AOS.init({
	    easing: 'ease-in-out-sine',
	    duration: 700,
	});


	/* Navbar Fixed */
	var navbarDesctop = $('.navbar-desctop');
    var origOffsetY = navbarDesctop.offset().top;

    $(window).on('scroll',function(){
    	if ($(window).scrollTop() > origOffsetY) {
            navbarDesctop.addClass('fixed');
        } else {
            navbarDesctop.removeClass('fixed');
        }
    });


    /* Navbar scroll*/
    $('body:not(.fullpage) .navbar ul li a').on('click', function() {
        var target = $(this.hash);
        if (target.length) {
            $('html,body').animate({
                scrollTop: (target.offset().top)
            }, 1000);
            $('body').removeClass('menu-is-opened').addClass('menu-is-closed');
            return false;
        }
    });

    /* Scrollspy*/
    $('body:not(.fullpage)').scrollspy({ target: '#scrollspy' });

    /* Full page scroll*/
    if ($('#pagepiling').length > 0){

        $('#pagepiling').pagepiling({
            scrollingSpeed: 280,
     
            menu: '.navbar-nav',
            anchors: ['home', 'about', 'video', 'experience', 'specialization', 'projects', 'partners', 'news'],
            afterRender: function(anchorLink, index){ 
              NavbarColor();
            },
            afterLoad: function(anchorLink, index){
                $('.pp-section .intro').removeClass('animate');
               $('.active .intro').addClass('animate');
                NavbarColor();

            }
        });

        $( ".pp-scrollable .intro" ).wrapInner( "<div class='scroll-wrap'>");

        function NavbarColor(){
         if ($('.pp-section.active').hasClass('navbar-is-white')){
                $('.navbar-desctop').addClass('navbar-white');
                $('#pp-nav').addClass('pp-nav-white');
            }
            else{
                $('.navbar-desctop').removeClass('navbar-white');
                $('#pp-nav').removeClass('pp-nav-white');
            }
        }
    }


    /* Navbar toggler */
    $('.toggler').on('click',function(){
    	$('body').addClass('menu-is-open');
    });

    $('.close, .click-capture').on('click',function(){
    	$('body').removeClass('menu-is-open');
    });


    /* Navbar mobile */
    $('.navbar-nav-mobile li a').on('click', function(){
    	$('body').removeClass('menu-is-open');
    	$('.navbar-nav-mobile li a').removeClass('active');
    	$(this).addClass('active');
    });

    /* Pop up*/
    // Magnific Popup с блокировкой прокрутки фона
    let modalOpening = false;
    let scrollPosition = 0;
    
    $('.popup-with-zoom-anim').magnificPopup({
      type: 'inline',
      fixedContentPos: false,
      fixedBgPos: false,
      overflowY: 'auto',
      closeBtnInside: true,
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: 'my-mfp-zoom-in',
      closeOnBgClick: true,
      enableEscapeKey: true,
      
      callbacks: {
        beforeOpen: function() {
          if (modalOpening) return false;
          modalOpening = true;
          
          // Останавливаем все видео
          document.querySelectorAll('.news-card video').forEach(function(video) {
            if (!video.paused) video.pause();
          });
          
          // Отключаем scroll-snap
          const carousel = document.querySelector('.news-carousel');
          if (carousel) carousel.style.scrollSnapType = 'none';
        },
        
        open: function() {
          // Сохраняем текущую позицию скролла
          scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          
          // Добавляем класс для блокировки скролла
          document.documentElement.classList.add('mfp-no-scroll');
          document.body.classList.add('mfp-no-scroll');
          
          // Блокируем прокрутку фона - ЖЕСТКАЯ блокировка
          document.documentElement.style.overflow = 'hidden';
          document.documentElement.style.height = '100%';
          document.body.style.overflow = 'hidden';
          document.body.style.height = '100%';
          document.body.style.position = 'fixed';
          document.body.style.top = '-' + scrollPosition + 'px';
          document.body.style.width = '100%';
          document.body.style.left = '0';
          document.body.style.right = '0';
          
          // Блокируем touch события на фоне
          document.body.style.touchAction = 'none';
          document.documentElement.style.touchAction = 'none';
          
          // На мобильных: добавляем возможность закрыть двойным тапом на контент
          if (window.innerWidth <= 767) {
            $('.mfp-content').off('dblclick').on('dblclick', function(e) {
              // Не закрываем если кликнули на ссылку или кнопку
              if (!$(e.target).is('a, button, input, select, textarea')) {
                $.magnificPopup.close();
              }
            });
          }
          
          setTimeout(function() { modalOpening = false; }, 500);
        },
        
        beforeClose: function() {
          const carousel = document.querySelector('.news-carousel');
          if (carousel) carousel.style.scrollSnapType = 'x mandatory';
        },
        
        close: function() {
          // Снимаем блокировку прокрутки
          document.documentElement.classList.remove('mfp-no-scroll');
          document.body.classList.remove('mfp-no-scroll');
          
          // Восстанавливаем стили
          document.documentElement.style.overflow = '';
          document.documentElement.style.height = '';
          document.documentElement.style.touchAction = '';
          document.body.style.overflow = '';
          document.body.style.height = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.touchAction = '';
          
          // Восстанавливаем позицию скролла
          window.scrollTo(0, scrollPosition);
          
          modalOpening = false;
        }
      }
    });
    /* Pop up Youtube*/
    $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false
    });


    /* Carousel project */
    $('.carousel-project').owlCarousel({
	    loop:true,
	    margin:10,
	    nav:true,
	    dots:true,
	    items:1
	});

    /* Carousel project2 */
    $('.carousel-project-2').owlCarousel({
        loop:true,
        margin:0,
        nav:true,
        dots:true,
        responsive:{
            0:{
                items:1,
                margin:0,
                dots:true
            },
            992:{
                items:2,
                margin:0,
                dots:true
            }
        }
    });

    /* Carousel testimonials */
    $('.carousel-testimonials').owlCarousel({
	    loop:true,
	    margin:10,
	    dots:true,
	    responsive:{
	        0:{
	            items:1
	        },
	        992:{
	            items:2,
	            margin:20,
	            dots:true
	        }
	    }
	});

    /* Carousel testimonials */
    $('.carousel-testimonials-2').owlCarousel({
        loop:true,
        margin:10,
        dots:true,
        responsive:{
            0:{
                items:1
            }
        }
    });

    /* Subscribe Form */
	$('.js-subscribe-form').ajaxChimp({
        language: 'cm',
        url: 'http://csmthemes.us3.list-manage.com/subscribe/post?u=9666c25a337f497687875a388&id=5b881a50fb'
            //http://xxx.xxx.list-manage.com/subscribe/post?u=xxx&id=xxx
    });
    $.ajaxChimp.translations.cm = {
        'submit': 'Submitting...',
        0: 'Awesome! We have sent you a confirmation email',
        1: 'Please enter a value',
        2: 'An email address must contain a single @',
        3: 'The domain portion of the email address is invalid (the portion after the @: )',
        4: 'The username portion of the email address is invalid (the portion before the @: )',
        5: 'This email address looks fake or invalid. Please enter a real email address'
    };

    /* Send form */
	if ($('.js-ajax-form').length) {
		$('.js-ajax-form').each(function(){
			$(this).validate({
				errorClass: 'error',
			    submitHandler: function(form){
		        	$.ajax({
			            type: "POST",
			            url:"mail.php",
			            data: $(form).serialize(),
			            success: function() {
		                	$('#success-message').show();
		                },

		                error: function(){
		                	$('#error-message').show();
			            }
			        });
			    }
			});
		});
	}

})(jQuery);
