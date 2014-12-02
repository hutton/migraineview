/**
 * Created by simonhutton on 03/10/2014.
 */

window.App = Backbone.View.extend({
    initialize: function (){
        var that = this;

        this.addView = new AddView();
        this.eventsView = new EventListView();
        this.statisticsView = new StatisticsView();
        this.settingsView = new SettingsView();
        this.exportView = new ExportView();
    },

    el: $("body"),

    events: {
        "click #statistics-toggle":     "showStatistics",
        "click #events-toggle":         "showEvents",
        "click #add-toggle":            "showAdd",
        "click #settings-toggle":       "showSettings",
        "click #export-toggle":         "showExport",
        "click #menuLink":              "menuLinkClick",
        "click #menu":                  "closeMenuLink"
    },

    dataLoaded: false,

    loadData: function(data){
        this.populateStats(data);
        this.populateEvents(data);

        this.dataLoaded = true;
    },

    dataChanged: function(){
        this.dataLoaded = false;
    },

    refreshData: function(){
        if (!this.dataLoaded){
            var that = this;

            $.ajax({
                dataType: "json",
                url: "/service/stats"
            }).done(function(response) {

                that.loadData(response);
            });
        }
    },

    getCurrentBase: function(){
        if (window.location.pathname.startsWith("/example")){
            return 'example';
        } else {
            return '';
        }
    },

    showStatistics: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/report', {trigger: true});

        event.preventDefault();
    },

    showEvents: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/list', {trigger: true});

        event.preventDefault();
    },

    showAdd: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/add', {trigger: true});

        event.preventDefault();
    },

    showSettings: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/settings', {trigger: true});

        event.preventDefault();
    },

    showExport: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/export', {trigger: true});

        event.preventDefault();
    },

    closeMenuLink: function(){
        if ($('#menuLink').is(':visible') && $('#menu').hasClass('active')){
            $('#layout').toggleClass('active');
            $('#menu').toggleClass('active');
            $('#menulink').toggleClass('active');
        }
    },

    populateStats: function(response){
        this.statisticsView.model = response;

        this.statisticsView.render();
    },

    populateEvents: function(response){
        var models = [];

        _.each(response.events, function(event){
            event['filtered'] = false;
            var eventModel = new window.EventModel(event);

            models.push(eventModel);
        });

        this.eventsView.collection = new EventsCollection(models);

        this.eventsView.render();
    },

    menuLinkClick: function(event){
        event.preventDefault();

        $('#layout').toggleClass('active');
        $('#menu').toggleClass('active');
        $('#menulink').toggleClass('active');
    }
});

window.Workspace = Backbone.Router.extend({

    routes: {
        ":base/report": "statistics",
        ":base/list":       "list",
        ":base/add":        "add",
        ":base/settings":   "settings",
        ":base/export":     "export",
        "report": "statistics",
        "list":       "list",
        "add":        "add",
        "settings":   "settings",
        "export":     "export"
    },

    statistics: function(){
        App.refreshData();

        App.addView.hide();
        App.eventsView.hide();
        App.settingsView.hide();
        App.exportView.hide();

        App.statisticsView.show();

        $('#statistics-toggle').parent().addClass('pure-menu-selected');

        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#settings-toggle').parent().removeClass('pure-menu-selected');
        $('#export-toggle').parent().removeClass('pure-menu-selected');
    },

    list: function(){
        App.refreshData();

        App.addView.hide();
        App.statisticsView.hide();
        App.settingsView.hide();
        App.exportView.hide();

        App.eventsView.show();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().addClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#settings-toggle').parent().removeClass('pure-menu-selected');
        $('#export-toggle').parent().removeClass('pure-menu-selected');
    },

    add: function(){
        App.statisticsView.hide();
        App.eventsView.hide();
        App.settingsView.hide();
        App.exportView.hide();

        App.addView.show();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().addClass('pure-menu-selected');
        $('#settings-toggle').parent().removeClass('pure-menu-selected');
        $('#export-toggle').parent().removeClass('pure-menu-selected');
    },

    settings: function(){
        App.statisticsView.hide();
        App.eventsView.hide();
        App.addView.hide();
        App.exportView.hide();

        App.settingsView.show();

        $('#settings-toggle').parent().addClass('pure-menu-selected');

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#export-toggle').parent().removeClass('pure-menu-selected');
    },

    export: function(){
        App.statisticsView.hide();
        App.eventsView.hide();
        App.addView.hide();
        App.settingsView.hide();

        App.exportView.show();

        $('#export-toggle').parent().addClass('pure-menu-selected');

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#settings-toggle').parent().removeClass('pure-menu-selected');
    }
});
