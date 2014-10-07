/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventListView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    template: _.template($('#radar-chart-view-template').html()),

    el: $('#event_list_container'),

    render: function(){
        this.$el.html(this.template(this.model));

        return this;
    }
});
