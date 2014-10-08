/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    template: _.template($('#event-view-template').html()),

    render: function(){
        this.$el.html(this.template(this.model));

        return this;
    }
});
