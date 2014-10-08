/**
 * Created by simonhutton on 03/10/2014.
 */

window.App = Backbone.View.extend({
    initialize: function (){
        var that = this;

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

    statsListEl: $("#stat-sections-container"),

    uploadContainer: $('.upload-container'),

    uploadingProgress: $('#uploading-message > .progress > span'),

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
        }).done(function (data) {
            var response = jQuery.parseJSON(data);

            that.Routes.navigate('uploaded/events', {trigger: true});

            that.showStats(response);
            that.showEvents(response);
        }).fail(function (data) {
        });
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

    showStats: function(response){
        var that = this;

        that.statsListEl.empty();

        var overviewView = new OverviewView({model: response});

        that.statsListEl.append(overviewView.el);

        var monthsOfYear = new FrequencyBarView({model: {'all' : response.daysOfWeek, 'byYear' : response.weekdaysByYearData}});

        that.statsListEl.append(monthsOfYear.el);

        var daysOfWeekView = new FrequencyBarView({model: {'all' : response.monthsOfYear, 'byYear' : response.monthsByYearData}});

        that.statsListEl.append(daysOfWeekView.el);

        var hoursOfDay = new RadarChartView({model: response.hoursOfDay});

        that.statsListEl.append(hoursOfDay.el);
    },

    showEvents: function(response){
        var models = [];

        _.each(response.events, function(event){
            var eventModel = new window.EventModel(event);

            models.push(eventModel);
        });

        this.eventsCollecton = new EventsCollection(models);

        this.eventsView = new EventListView({model :this.eventsCollecton});
    }
});

window.Workspace = Backbone.Router.extend({

    routes: {
        "uploaded/stats":   "stats",
        "uploaded/events":  "events",
        "":                 "home"
    },

    homeView: $('#home-view'),

    statsView: $('#stats-view'),

    eventsView: $('#event_list_container'),

    home: function() {
        this.homeView.show();

        this.statsView.hide();
        this.eventsView.hide();
    },

    stats: function(){
        this.homeView.hide();

        this.statsView.show();
        this.eventsView.hide();
    },

    events: function(){
        this.homeView.hide();

        this.statsView.hide();
        this.eventsView.show();
    }
});

$(document).ready(function(){
    window.App = new App();

    window.App.Routes = new Workspace();

    Backbone.history.start({pushState: true});
});

