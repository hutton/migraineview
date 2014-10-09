/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventListView = Backbone.View.extend({
    initialize: function () {
    },

    el: $('#event_list_container'),

    tableBodyEl: $('#event_list_container tbody'),

    render: function(){
        var that = this;

        _.each(this.collection.models, function(event_model){
            var event_view = new EventView({model: event_model});

            that.tableBodyEl.append(event_view.render().$el);
        });

        return this;
    }
});
