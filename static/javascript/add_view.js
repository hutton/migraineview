/**
 * Created by simonhutton on 19/11/14.
 */

window.AddView = window.MainViewBase.extend({
    initialize: function () {
        $("input[type='date']").val(new Date().toDateInputValue());

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

        this.singleUploadFormEl.bind('ajax:complete', function() {
            that.singleUploadFinished();
        });
    },

    events: {
        "click #single-upload-form-button":     "addSingleAttack",
        "change #started":                     "datesChanged",
        "change #started-time":                "datesChanged",
        "change #ended":                       "datesChanged",
        "change #ended-time":                  "datesChanged",
        "input #add-comment-text":             "datesChanged"
    },

    el: $('#add-view'),

    statusPanel: $('#add-status-panel'),

    uploadingMessage: $('#add-uploading-message'),

    processingMessage: $('#add-processing-message'),

    uploadedMessage: $('#add-uploaded-message'),

    durationGroupEl: $('#add-duration-group'),

    uploadContainer: $('.upload-container'),

    uploadingProgress: $('#uploading-message > .progress > span'),

    singleUploadFormEl: $('#single-upload-form'),

    startedEL: $('#started'),

    startedTimeEL: $('#started-time'),

    endedEL: $('#ended'),

    endedTimeEL: $('#ended-time'),

    commentEL: $('#add-comment-text'),

    durationLabelEl: $('#add-duration-group > label'),

    durationValueEl: $('#add-duration-group > span'),

    addMessageLabelEl: $('#add-message-label'),

    singleUploadFormButtonEl: $('#single-upload-form-button'),

    render: function(){

        this.datesChanged();

        return this;
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
            // App.showStatistics();

            var data = jQuery.parseJSON(response);

            that.showUploadedFinished(data);
        }).fail(function (data) {
        });
    },

    showUploading: function(){
        this.statusPanel.show();

        this.uploadingMessage.show();
        this.processingMessage.hide();
        this.uploadedMessage.hide();
    },

    showProgress: function(evt){

        if (evt.lengthComputable) {
            var percentComplete = (evt.loaded / evt.total) * 100;

            if (percentComplete < 100){
                window.App.uploadingProgress.css("width", percentComplete + "%");
            } else{
                window.App.addView.showProcessing();
            }
        }
    },

    showProcessing: function(){
        this.statusPanel.show();

        this.uploadingMessage.hide();
        this.processingMessage.show();
        this.uploadedMessage.hide();
    },

    showUploadedFinished: function(data){
        var that = this;

        this.statusPanel.show();

        this.uploadingMessage.hide();
        this.processingMessage.hide();
        this.uploadedMessage.show();

        this.uploadedMessage.html(data.message);

        _.delay(function(){
            that.uploadedMessage.fadeOut()
        }, 5000);

        App.dataChanged();
    },

    addSingleAttack: function(e){
        e.preventDefault();

        var that = this;

        var start = this.startedEL.val();
        var started_time = this.startedTimeEL.val();
        var end = this.endedEL.val();
        var end_time = this.endedTimeEL.val();

        var started_send = start + " " + started_time;
        var ended_send = end + " " + end_time;

        var commentEL = this.commentEL.val();

        if (!this.singleUploadFormButtonEl.hasClass('pure-button-disabled')) {
            this.singleUploadFormButtonEl.addClass('pure-button-disabled');

            this.addMessageLabelEl.html("Saving attack...");

            $.ajax({
                type: "POST",
                url: "/report/add",
                data: {
                    started: started_send,
                    ended: ended_send,
                    comment: commentEL
                }
            }).done(function (response) {
                that.singleUploadFormButtonEl.removeClass('pure-button-disabled');
                that.addMessageLabelEl.html("Attack logged.");

                _.delay(function(){
                    that.addMessageLabelEl.html("");
                }, 2500);

                App.dataChanged();

            }).fail(function (data) {
                that.addMessageLabelEl.html("Failed to log attack.");

                that.singleUploadFormButtonEl.removeClass('pure-button-disabled');
            });
        }

    },

    singleUploadFinished: function(){
        App.dataChanged();
    },

    datesChanged: function(){
        var start = this.startedEL.val();
        var started_time = this.startedTimeEL.val();
        var end = this.endedEL.val();
        var ended_time = this.endedTimeEL.val();

        var started = new Date(start + "T" + started_time);
        var ended = new Date(end + "T" + ended_time);

        var text = this.commentEL.val();

        if (text == "" || started >= ended) {
            this.singleUploadFormButtonEl.addClass('pure-button-disabled');
        } else {
            this.singleUploadFormButtonEl.removeClass('pure-button-disabled');
        }

        if (started >= ended){
            this.durationGroupEl.show();
            this.durationLabelEl.html("");
            this.durationValueEl.html("Select a valid duration");
        } else {

            var timeDiff = Math.abs(ended.getTime() - started.getTime());
            var diffHours = timeDiff / (1000 * 60);

            var hours = Math.floor(diffHours/60);
            var minutes = diffHours % 60;

            var result = "";

            if (hours == 1){
                result = "1 hour ";
            } else if (hours > 1){
                result = hours + " hours ";
            }

            if (minutes == 1){
                result += "1 minute";
            } else if (minutes > 1){
                result += minutes + " minutes";
            }

            if (result == ""){
                this.durationGroupEl.hide();
                this.durationLabelEl.html("");
            } else {
                this.durationGroupEl.show();
                this.durationLabelEl.html("Duration");

                this.durationValueEl.html(result);
            }
        }
    }
});
