( function($) {
  'use strict';

  	/* Window Load */
	$(window).on('load',function(){
		$('.loader').fadeOut(200);
	});

    
	/* Aos */
	AOS.init({
	    easing: 'ease-in-out-sine',
	    duration: 700,
	});


	/* Owl Carousel */
    $('.carousel-project-2').owlCarousel({
        loop:true,
        margin:30,
        nav:true,
        navText: ["<i class='ion-ios-arrow-back'></i>","<i class='ion-ios-arrow-forward'></i>"],
        responsive:{
            0:{
                items:1
            },
            768:{
                items:1
            },
            1024:{
                items:2
            }
        }
    });

})( jQuery );
