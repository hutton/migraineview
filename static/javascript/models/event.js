/**
 * Created by simonhutton on 08/10/2014.
 */

window.EventModel = Backbone.Model.extend({
    initialize: function() {


        this.fullText = (this.get('start') + " " + this.get('duration') + " " + this.get('comment')).toUpperCase();
    }
});

