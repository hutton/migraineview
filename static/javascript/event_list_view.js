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

    listWelcomeEl: $('#list-welcome'),

    hiddenRows: null,

    welcome: false,

    events: {
        "input #list-search-input": "searchInputChanged",
        "click #list-search-input-clear": "clearInputClicked",
        "click .tl-add-attack":         "addAttack"
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
        if (this.hiddenRows != null){
            this.hiddenRows.show();
        }

        if (this.add){
            this.addAttack();
        }
    },

    onHidden: function(){
        this.hiddenRows = this.listEl.find('.tl-row').slice(4);

        this.hiddenRows.hide();
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
        this.listEl.find('.tl-row').remove();

        var previousModel = null;

        _.each(this.collection.models, function(event_model){
            event_model.set('previousModel', previousModel);
            var event_view = new EventView({model: event_model});

            that.listEl.append(event_view.render().$el);

            previousModel = event_model;
        });

        if (!this.visible){
            this.onHidden();
        }

        this.updateSearchLabel(this.collection.models.length);
    },

    clearInputClicked: function(){
        this.listSearchInputEl.val("");
        this.listSearchInputEl.focus();
        this.searchInputChanged();
    },

    showDetails: function(model){
        this.editAttackView.show(model);
    },

    addAttack: function(){
        if (!App.shared) {
            window.App.newAttackView.show();
        }
    }
});
