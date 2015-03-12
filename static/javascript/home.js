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

    rootEl.find('#ani-timeline-text > .ani-header').velocity('transition.slideDownIn', {duration: 1800, delay: 600});
    rootEl.find('#ani-timeline-text > .ani-body').velocity('transition.slideUpBigIn', {duration: 1800, delay: 1400});

    rootEl.find('.ani-iphone-image-container').velocity('transition.slideUpBigIn', {delay: 3000, duration: 2000});
    rootEl.find('.ani-iphone-content-image').velocity({'background-position-y': -100}, {duration: 500, delay: 4400, easing: 'ease-in-out', complete: function(){
        rootEl.find('.ani-iphone-content-image').velocity({'background-position-y': 0}, {duration: 200, delay: 100, easing: 'ease-in-out'});
    }});

    rootEl.find('#ani-timeline-text').velocity('transition.slideRightOut', {duration: 400, delay: 6000, complete: function(){
        rootEl.find('#ani-report-text').velocity('transition.slideLeftIn', {duration: 400});
    }});

    rootEl.find('.ani-iphone-report-content-image').velocity('transition.slideLeftIn', {duration: 400, delay: 6000, complete: function(){
        rootEl.find('.ani-iphone-report-content-image').velocity({'background-position-y': -100}, {duration: 500, delay: 1400, easing: 'ease-in-out', complete: function(){
            rootEl.find('.ani-iphone-report-content-image').velocity({'background-position-y': 0}, {duration: 200, delay: 100, easing: 'ease-in-out'});
        }});
    }});

    rootEl.find('.ani-buttons').velocity('transition.slideDownIn', {delay: 9000});
}

function bindScroll(){
    var timelineHeight = 780;
    var reportHeight = 1100;

    var timelineContent = $('.ani-iphone-content-image');
    var reportContent = $('.ani-iphone-report-content-image');

    $(window).scroll(function() {
        var scrollPos = $(window).scrollTop();
        var imageTopOffset = $('.ani-iphone-image').offset().top + 200;

        var percentScroll = scrollPos / imageTopOffset;

        var timelineScrollPos =  Math.min(timelineHeight * percentScroll, timelineHeight);
        var reportScrollPos =  Math.min(reportHeight * percentScroll, reportHeight);

        timelineContent.css("background-position-y", -timelineScrollPos);
        reportContent.css("background-position-y", -reportScrollPos);
    });

}

$(document).ready(function(){
    setDimensions();

    //when resizing the site, we adjust the heights of the sections
    $(window).resize(function() {
        setDimensions();
    });

    bindScroll();

    $('#login-link').click(function(){
      showLogin();
    });

    $('#logon').click(function(){
      hideLogin();
    });

    animateTimeline();


});
