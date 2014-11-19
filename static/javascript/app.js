/**
 * Created by simonhutton on 03/10/2014.
 */

window.App = Backbone.View.extend({
    initialize: function (){
        var that = this;

        this.addView = new AddView();
        this.eventsView = new EventListView();
        this.statisticsView = new StatisticsView();

        this.tests = {
            fileReader: typeof FileReader != 'undefined',
            dnd: 'draggable' in document.createElement('span'),
            formData: !!window.FormData,
            progress: "upload" in new XMLHttpRequest
        };

        this.uploadContainer.on('drop', function (e) {
            that.onDrop(e);
        });
        this.uploadContainer.on('dragover', function (e) {
            return false;
        });
        this.uploadContainer.on('dragend', function (e) {
            return false;
        });

    },

    el: $("body"),

    uploadContainer: $('.upload-container'),

    uploadingProgress: $('#uploading-message > .progress > span'),

    events: {
        "click #statistics-toggle":     "showStatistics",
        "click #events-toggle":         "showEvents",
        "click #add-toggle":            "showAdd",
        "click #menuLink":              "menuLinkClick",
        "click #menu":                  "closeMenuLink"
    },

    onDrop: function(e){
        e.preventDefault();

        this.sendFiles(e.originalEvent.dataTransfer.files);
    },

    sendFiles: function (files) {
        var that = this;

        var formData = this.tests.formData ? new FormData() : null;

        for (var i = 0; i < files.length; i++) {
            formData.append('file', files[i]);

            //this.setFileInfo({'full_filename': files[i].name});
        }

        this.showUploading();

        $.ajax({
            type: "POST",
            url: "/upload",
            data: formData,
            processData: false,
            contentType: false,
            xhr: function () {
                myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', that.showProgress, false);
                } else {
                    console.log("Upload progress is not supported.");
                }
                return myXhr;
            }
        }).done(function (response) {
            that.showStatistics();

            var data = jQuery.parseJSON(response);

            that.loadData(data);
        }).fail(function (data) {
        });
    },

    loadData: function(data){
        this.populateStats(data);
        this.populateEvents(data);
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

    showProgress: function(evt){

        if (evt.lengthComputable) {
            var percentComplete = (evt.loaded / evt.total) * 100;

            if (percentComplete < 100){
                window.App.uploadingProgress.css("width", percentComplete + "%");
            } else{
                window.App.showProcessing();
            }
        }
    },

    showUploading: function(){
//        this.statusPanel.show();
//
//        this.uploadingMessage.show();
//        this.processingMessage.hide();
//        this.fileMessage.hide();
//        this.fileUploadFailedMessage.hide();
    },

    showProcessing: function(){
//        this.statusPanel.show();
//
//        this.uploadingMessage.hide();
//        this.processingMessage.show();
//        this.fileMessage.hide();
//        this.fileUploadFailedMessage.hide();
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
        ":base/add":        "add",
        "":                 "home"
    },

    homeView: $('#home-view'),

    everythingView: $('#everything-view'),

    statsView: $('#stats-view'),

    eventsView: $('#event_list_container'),

    addView: $('#add-view'),

    home: function() {
        this.homeView.show();
        this.everythingView.hide();

        this.addView.hide();
        this.statsView.hide();
        this.eventsView.hide();
    },

    statistics: function(){
        this.homeView.hide();
        this.everythingView.show();

        this.addView.hide();
        this.statsView.show();
        this.eventsView.hide();

        $('#statistics-toggle').parent().addClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
    },

    list: function(){
        this.homeView.hide();
        this.everythingView.show();

        this.addView.hide();
        this.statsView.hide();
        this.eventsView.show();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().addClass('pure-menu-selected');
        $('#add-toggle').parent().removeClass('pure-menu-selected');
    },

    add: function(){
        this.homeView.hide();
        this.everythingView.show();

        this.addView.show();
        this.statsView.hide();
        this.eventsView.hide();

        $('#statistics-toggle').parent().removeClass('pure-menu-selected');
        $('#events-toggle').parent().removeClass('pure-menu-selected');
        $('#add-toggle').parent().addClass('pure-menu-selected');
    }
});
