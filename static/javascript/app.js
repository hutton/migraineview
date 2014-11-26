/**
 * Created by simonhutton on 03/10/2014.
 */

window.App = Backbone.View.extend({
    initialize: function (){
        var that = this;

        this.addView = new AddView();
        this.eventsView = new EventListView();
        this.statisticsView = new StatisticsView();
    },

    el: $("body"),

    events: {
        "click #statistics-toggle":     "showStatistics",
        "click #events-toggle":         "showEvents",
        "click #add-toggle":            "showAdd",
        "click #menuLink":              "menuLinkClick",
        "click #menu":                  "closeMenuLink"
    },

    dataLoaded: false,

    loadData: function(data){
        if (!this.dataLoaded){
            this.populateStats(data);
            this.populateEvents(data);

            this.dataLoaded = true;
        }
    },

    refreshData: function(){
        var that = this;

        $.ajax({
            dataType: "json",
            url: "/service/stats"
        }).done(function(response) {

            that.loadData(response);
        });
    },

    getCurrentBase: function(){
        if (window.location.pathname.startsWith("/example")){
            return 'example';
        } else if (window.location.pathname.startsWith("/report")) {
            return 'report';
        } else {
            return 'uploaded';
        }
    },

    showStatistics: function(event){
        this.Routes.navigate(this.getCurrentBase() + '/statistics', {trigger: true});

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
        ":base/statistics": "statistics",
        ":base/list":       "list",
        ":base/add":        "add"
    },

    statistics: function(){
        App.addView.hide();
        App.statisticsView.show();
        App.eventsView.hide();

        $('#statistics-toggle').parent().addClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
    },

    list: function(){
        App.addView.hide();
        App.statisticsView.hide();
        App.eventsView.show();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().addClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
    },

    add: function(){
        App.addView.show();
        App.statisticsView.hide();
        App.eventsView.hide();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().addClass('pure-menu-selected');
    }
});
