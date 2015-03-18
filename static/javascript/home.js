/**
 * Created by simonhutton on 04/03/15.
 */


function showLogin(){
    $("#logon").fadeIn('fast');
}

function hideLogin(){
    $("#logon").fadeOut('fast');
}

function animate(){
    var rootEl = $('#ani-timeline');

    rootEl.find('#ani-timeline-text > .ani-header').velocity('transition.slideDownIn', {duration: 1800, delay: 600});
    rootEl.find('#ani-timeline-text > .ani-body').velocity('transition.slideUpBigIn', {duration: 1800, delay: 1400});

    rootEl.find('.ani-iphone-image-container').velocity('transition.slideUpBigIn', {delay: 2000, duration: 2000});

    window.setTimeout(function(){
        switchToReport();
    }, 4000);

    rootEl.find('.ani-buttons').velocity('transition.slideDownIn', {delay: 4000});

    rootEl.find('.ani-switch-container > div').velocity('transition.slideDownIn', {delay: 4500, display: 'inline-block'});
}

function switchToReport(){
    var rootEl = $('#ani-timeline');

    rootEl.find('#ani-timeline-text').velocity('transition.slideRightOut', {duration: 200, complete: function(){
        rootEl.find('#ani-report-text').velocity('transition.slideLeftIn', {duration: 200});
    }});

    rootEl.find('.ani-iphone-report-content-image > div').velocity('transition.slideLeftIn', {duration: 400});
    rootEl.find('.ani-iphone-content-image > div').velocity('transition.slideRightOut', {duration: 400});
}

function switchToTimeline(){
    var rootEl = $('#ani-timeline');

    rootEl.find('#ani-report-text').velocity('transition.slideLeftOut', {duration: 200, complete: function(){
        rootEl.find('#ani-timeline-text').velocity('transition.slideRightIn', {duration: 200});
    }});

    rootEl.find('.ani-iphone-content-image > div').velocity('transition.slideRightIn', {duration: 400});
    rootEl.find('.ani-iphone-report-content-image > div').velocity('transition.slideLeftOut', {duration: 400});
}

function bindScroll(){
    var timelineHeight = 780;
    var reportHeight = 1100;

    var timelineContent = $('.ani-iphone-content-image > div > div');
    var reportContent = $('.ani-iphone-report-content-image > div > div');

    $(window).scroll(function() {
        var scrollPos = $(window).scrollTop();
        var imageTopOffset = $('.ani-iphone-image').offset().top + 200;

        var percentScroll = scrollPos / imageTopOffset;

        var timelineScrollPos =  Math.min(timelineHeight * percentScroll, timelineHeight);
        var reportScrollPos =  Math.min(reportHeight * percentScroll, reportHeight);

        timelineContent.velocity("stop");
        reportContent.velocity("stop");

        timelineContent.velocity({"background-position-y": -timelineScrollPos}, {duration: 60});
        reportContent.velocity({"background-position-y": -reportScrollPos}, {duration: 60});
    });
}

$(document).ready(function(){
    bindScroll();

    $('#login-link').click(function(){
      showLogin();
    });

    $('#logon').click(function(){
      hideLogin();
    });

    animate();

    $('#track').click(function(event){
        var el = $(event.target);

        if (!el.hasClass('selected')){
            $('#understand').removeClass('selected');
            el.addClass('selected');
            switchToTimeline();
        }
    });

    $('#understand').click(function(event){
        var el = $(event.target);

        if (!el.hasClass('selected')){
            $('#track').removeClass('selected');
            el.addClass('selected');
            switchToReport();
        }
    });
});
