/**
 * Created by simonhutton on 08/10/2014.
 */

window.EventModel = Backbone.Model.extend({
    initialize: function() {
        var seperator = "º";

        this.fullText = (this.get('duration_text') + seperator + replaceAll(this.get('start_text'),"<br/>",seperator) + seperator + this.get('comment')).toUpperCase();
    }
});

