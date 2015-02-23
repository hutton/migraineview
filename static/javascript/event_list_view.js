/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventListView = window.MainViewBase.extend({
    initialize: function () {
        this.editAttackView = new EditAttackView();
    },

    el: $('#event_list_container'),

    listLoadingEl: $('#list-loading'),

    listEl: $('#event_list_container table'),

    tableContainerEl: $('#list-table-container'),

    listNoDataEl: $('#list-no-data'),

    listSearchInputEl: $('#list-search-input'),

    listCountEl: $('#list-count'),

    listSearchInputClearEl: $('#list-search-input-clear'),

    events: {
        "input #list-search-input": "searchInputChanged",
        "click #list-search-input-clear": "clearInputClicked"
    },

    render: function(){
        if (this.collection.models.length > 0){
            this.showAttacks();
        } else {
            this.showNoAttacks();
        }

        return this;
    },

    onShow: function(){
        //this.listSearchInputEl.focus();
    },

    searchInputChanged: function(){
        var searchTerm = this.listSearchInputEl.val();
        var searchTermUpper = searchTerm.toUpperCase();

        if (searchTerm.length == 0){
            this.listSearchInputClearEl.hide();
        } else{
            this.listSearchInputClearEl.show();
        }

        var shown = 0;

        _.each(this.collection.models, function(model){
            if (model.fullText.indexOf(searchTermUpper) == -1){
                model.set({filtered: true});
            } else {
                model.set({filtered: false, filter: searchTerm});
                shown++;
            }
        });

        this.updateSearchLabel(shown);
    },

    updateSearchLabel: function(shown){
        if (this.collection.models.length == shown){
            this.listCountEl.html("Showing all " + shown + " attacks");
        } else if (shown > 0){
            this.listCountEl.html("Showing " + shown + " of " + this.collection.models.length + " attacks");
        } else{
            this.listCountEl.html("No matching attacks");
        }
    },

    showDataLoading: function(){
        this.listNoDataEl.hide();
        this.listLoadingEl.show();

        this.tableContainerEl.hide();
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
        this.listEl.empty();

        _.each(this.collection.models, function(event_model){
            var event_view = new EventView({model: event_model});

            that.listEl.append(event_view.render().$el);
        });

        this.updateSearchLabel(this.collection.models.length);
    },

    clearInputClicked: function(){
        this.listSearchInputEl.val("");
        this.listSearchInputEl.focus();
        this.searchInputChanged();
    },

    showDetails: function(model){
        this.editAttackView.show(model);
    }
});
