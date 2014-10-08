/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventListView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    el: $('#event_list_container'),

    render: function(){
        var that = this;

        _.each(this.model.models, function(event_model){
            var event_view = new EventView(event_model);

            that.el.append(event_view.el);
        });

        return this;
    }
});
