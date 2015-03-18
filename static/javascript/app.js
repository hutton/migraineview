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
        this.welcomeView = new WelcomeView();

        this.addView.render();

        this.newAttackView = new NewAttackView();
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

        this.eventsView.showDataLoading();
        this.statisticsView.showDataLoading();
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
        var location = window.location.pathname;

        if (location.startsWith("/example")){
            return 'example';
        } else if (location.startsWith("/shared")) {
            var re = new RegExp("/shared/(.*)?/.*");

            var match = location.match(re);

            if (match.length > 1){
                return '/shared/' + match[1];
            } else{
                return '';
            }
        } else {
            return '';
        }
    },

    showStatistics: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/report', {trigger: true});

        event.preventDefault();
    },

    showEvents: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/timeline', {trigger: true});

        event.preventDefault();
    },

    showAdd: function(event){
        if (!App.shared) {
            var selectItem;

            if ($('#statistics-toggle').parent().hasClass('pure-menu-selected')){
                selectItem = $('#statistics-toggle').parent();
            }

            if ($('#events-toggle').parent().hasClass('pure-menu-selected')){
                selectItem = $('#events-toggle').parent();
            }

            if ($('#settings-toggle').parent().hasClass('pure-menu-selected')){
                selectItem = $('#settings-toggle').parent();
            }
            $('#add-toggle').parent().addClass('pure-menu-selected');
            selectItem.removeClass('pure-menu-selected');

            this.newAttackView.show(function(){
                $('#add-toggle').parent().removeClass('pure-menu-selected');
                selectItem.addClass('pure-menu-selected');
            });
        }

//        this.Routes.navigate(this.getCurrentBase() + '/add', {trigger: true});

        event.preventDefault();
    },

    showSettings: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/account', {trigger: true});

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
        ":base/report":         "statistics",
        ":base/timeline":       "timeline",
        ":base/add":            "add",
        ":base/account":        "options",
        ":base/export":         "export",
        "report":               "statistics",
        "timeline":             "timeline",
        "timeline?add":         "timeline",
        "add":                  "add",
        "account":              "options",
        "account?upload":       "options",
        "export":               "export",
        "welcome":               "welcome",
        "shared/:base/report":  "statistics",
        "shared/:base/timeline":    "timeline"
    },

    currentView: null,

    statistics: function(){
        App.refreshData();

        App.statisticsView.show();

        $('#statistics-toggle').parent().addClass('pure-menu-selected');

        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#settings-toggle').parent().removeClass('pure-menu-selected');
        $('#export-toggle').parent().removeClass('pure-menu-selected');
    },

    timeline: function(query){
        App.refreshData();

        if (query === "add"){
            App.eventsView.add = true;
        } else {
            App.eventsView.add = false;
        }

        App.eventsView.show();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().addClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#settings-toggle').parent().removeClass('pure-menu-selected');
        $('#export-toggle').parent().removeClass('pure-menu-selected');
    },

    add: function(){
        App.refreshData();

        App.eventsView.show();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().addClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#settings-toggle').parent().removeClass('pure-menu-selected');
        $('#export-toggle').parent().removeClass('pure-menu-selected');
    },

    options: function(query){
        App.settingsView.show();

        if (query === "upload"){
            App.settingsView.upload = true;
        } else {
            App.settingsView.upload = false;
        }

        $('#settings-toggle').parent().addClass('pure-menu-selected');

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#export-toggle').parent().removeClass('pure-menu-selected');
    },

    welcome: function(){
        App.welcomeView.show();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
        $('#settings-toggle').parent().removeClass('pure-menu-selected');
    }
});
