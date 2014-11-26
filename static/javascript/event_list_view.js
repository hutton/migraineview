/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventListView = window.MainViewBase.extend({
    initialize: function () {
    },

    el: $('#event_list_container'),

    listLoadingEl: $('#list-loading'),

    tableBodyEl: $('#event_list_container tbody'),

    tableEl: $('#event_list_container table'),

    render: function(){
        var that = this;

        this.listLoadingEl.hide();

        this.tableEl.show();
        this.tableBodyEl.empty();

        _.each(this.collection.models, function(event_model){
            var event_view = new EventView({model: event_model});

            that.tableBodyEl.append(event_view.render().$el);
        });

        return this;
    },

    show: function(){
        this.$el.show();

        App.refreshData();
    }
});
