/**
 * Created by simonhutton on 19/11/14.
 */

window.AddView = window.MainViewBase.extend({
    initialize: function () {
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
        "click #submit-button":     "addSingleAttack"
    },

    el: $('#add-view'),

    statusPanel: $('#add-status-panel'),

    uploadingMessage: $('#add-uploading-message'),

    processingMessage: $('#add-processing-message'),

    uploadedMessage: $('#add-uploaded-message'),

    uploadContainer: $('.upload-container'),

    uploadingProgress: $('#uploading-message > .progress > span'),

    singleUploadFormEl: $('#single-upload-form'),

    submitButtonEl: $('#submit-button'),

    singleUploadAttackViewContainer: $('#single-upload-attack-view-container'),

    render: function(){
        this.attackView = new AttackView();
        this.attackView.attributes['submit_button'] = "Add";
        this.attackView.attributes['show_cancel'] = false;
        this.attackView.attributes['show_delete'] = false;

        this.singleUploadAttackViewContainer.append(this.attackView.render().$el);

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
        }).fail(function (response) {

            var data = jQuery.parseJSON(response.responseText);
            that.showUploadedFinished(data);
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

        var started_send = this.attackView.getStarted();
        var ended_send = this.attackView.getEnded();
        var commentEL = this.attackView.commentEL.val();

        if (!this.attackView.submitButtonEl.hasClass('pure-button-disabled')) {
            this.attackView.submitButtonEl.addClass('pure-button-disabled');

            this.attackView.addMessageLabelEl.html("Saving attack...");

            $.ajax({
                type: "POST",
                url: "/report/add",
                data: {
                    started: started_send,
                    ended: ended_send,
                    comment: commentEL
                }
            }).done(function (response) {
                that.attackView.submitButtonEl.removeClass('pure-button-disabled');
                that.attackView.addMessageLabelEl.html("Attack logged.");

                _.delay(function(){
                    that.attackView.addMessageLabelEl.html("");
                }, 2500);

                App.dataChanged();

            }).fail(function (data) {
                that.attackView.addMessageLabelEl.html("Failed to log attack.");

                that.attackView.submitButtonEl.removeClass('pure-button-disabled');
            });
        }
    },

    singleUploadFinished: function(){
        App.dataChanged();
    },

});
