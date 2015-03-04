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

    rootEl.find('.ani-header').velocity('transition.slideDownIn', {complete: function(){
        rootEl.find('.ani-body').velocity('transition.slideUpBigIn', {complete: function(){
            rootEl.find('.ani-buttons').velocity('transition.fadeIn', {delay: 400});
        }});
    }});

    rootEl.find('.ani-iphone-image-container').velocity('transition.slideUpBigIn', {complete: function(){
        rootEl.find('.ani-iphone-content-image').velocity({'background-position-y': -750}, {duration: 2000, delay: 1000, easing: 'ease-out', complete: function(){
            rootEl.find('.ani-iphone-content-image').velocity({'background-position-y': 0}, {duration: 1000, delay: 500, easing: 'ease-in-out'});
        }});
    }, delay: 3500});
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
