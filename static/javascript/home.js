/**
 * Created by simonhutton on 04/03/15.
 */


function setDimensions(){
  var windowsHeight = $(window).height();
  $('.splash-container').css('min-height', windowsHeight + 'px');
}

function showLogin(){
    $("#logon").fadeIn('fast');
}

function hideLogin(){
    $("#logon").fadeOut('fast');
}

function animateTimeline(){
    var rootEl = $('#ani-timeline');

    rootEl.find('.ani-header').velocity('transition.slideDownIn', {duration: 1800, delay: 600});
    rootEl.find('.ani-body').velocity('transition.slideUpBigIn', {duration: 1800, delay: 1400});

    rootEl.find('.ani-iphone-image-container').velocity('transition.slideUpBigIn', {delay: 3000, duration: 1000});
    rootEl.find('.ani-iphone-content-image').velocity({'background-position-y': -750}, {duration: 3000, delay: 4000, easing: 'ease-in-out', complete: function(){
        rootEl.find('.ani-iphone-content-image').velocity({'background-position-y': 0}, {duration: 600, delay: 800, easing: 'ease-in-out'});
    }});
    rootEl.find('.ani-buttons').velocity('transition.slideDownIn', {delay: 8000});
}

$(document).ready(function(){
    setDimensions();

    //when resizing the site, we adjust the heights of the sections
    $(window).resize(function() {
        setDimensions();
    });

    $('#login-link').click(function(){
      showLogin();
    });

    $('#logon').click(function(){
      hideLogin();
    });

    animateTimeline();
});
