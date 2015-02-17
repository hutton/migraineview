/**
 * Created by simonhutton on 17/02/15.
 */


function messageChanged(){
    var text = $('#message-text')[0].value;

    var count = 0;

    if (text !== undefined){
        count = text.length;
    }

    $('#message-length').html(count);
};

$(document).ready(function(){
    $('#message-text').on('input', function(){
        messageChanged();
    });

    messageChanged();
});