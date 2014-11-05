/**
 * Created by simonhutton on 03/10/2014.
 */

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}

(function (window, document) {

    var layout   = document.getElementById('layout'),
        menu     = document.getElementById('menu'),
        menuLink = document.getElementById('menuLink');

    function toggleClass(element, className) {
        var classes = element.className.split(/\s+/),
            length = classes.length,
            i = 0;

        for(; i < length; i++) {
          if (classes[i] === className) {
            classes.splice(i, 1);
            break;
          }
        }
        // The className is not found
        if (length === classes.length) {
            classes.push(className);
        }

        element.className = classes.join(' ');
    }

    menuLink.onclick = function (e) {
        var active = 'active';

        e.preventDefault();
        toggleClass(layout, active);
        toggleClass(menu, active);
        toggleClass(menuLink, active);
    };

}(this, this.document));

window.App = Backbone.View.extend({
    initialize: function (){
        var that = this;

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
        "click #statistics-toggle":   "showStatistics",
        "click #events-toggle":   "showEvents"
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
        } else {
            return 'uploaded';
        }
    },

    showStatistics: function(){
        this.Routes.navigate(this.getCurrentBase() + '/stats', {trigger: true});
    },

    showEvents: function(){
        this.Routes.navigate(this.getCurrentBase() + '/events', {trigger: true});
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
    }
});

window.Workspace = Backbone.Router.extend({

    routes: {
        ":base/stats":   "stats",
        ":base/events":  "events",
        "":                 "home"
    },

    homeView: $('#home-view'),

    everythingView: $('#everything-view'),

    statsView: $('#stats-view'),

    eventsView: $('#event_list_container'),

    home: function() {
        this.homeView.show();
        this.everythingView.hide();

        this.statsView.hide();
        this.eventsView.hide();
    },

    stats: function(){
        this.homeView.hide();
        this.everythingView.show();

        this.statsView.show();
        this.eventsView.hide();

        $('#statistics-toggle').addClass('selected');
        $('#events-toggle').removeClass('selected');
    },

    events: function(){
        this.homeView.hide();
        this.everythingView.show();

        this.statsView.hide();
        this.eventsView.show();

        $('#statistics-toggle').removeClass('selected');
        $('#events-toggle').addClass('selected');
    }
});
