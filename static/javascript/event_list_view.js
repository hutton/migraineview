/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventListView = window.MainViewBase.extend({
    initialize: function () {
    },

    el: $('#event_list_container'),

    listLoadingEl: $('#list-loading'),

    tableBodyEl: $('#event_list_container tbody'),

    tableContainerEl: $('#list-table-container'),

    listNoDataEl: $('#list-no-data'),

    render: function(){
        if (this.collection.models.length > 0){
            this.showAttacks();
        } else {
            this.showNoAttacks();
        }

        return this;
    },

    showNoAttacks: function(){
        this.listNoDataEl.show();
        this.listLoadingEl.hide();
    },

    showAttacks: function() {
        var that = this;

        this.listNoDataEl.hide();
        this.listLoadingEl.hide();

        this.tableContainerEl.show();
        this.tableBodyEl.empty();

        _.each(this.collection.models, function(event_model){
            var event_view = new EventView({model: event_model});

            that.tableBodyEl.append(event_view.render().$el);
        });
    }
});
