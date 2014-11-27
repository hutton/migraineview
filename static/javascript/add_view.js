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
        "click #single-upload-form-button":     "addSingleAttack"
    },

    el: $('#add-view'),

    uploadContainer: $('.upload-container'),

    uploadingProgress: $('#uploading-message > .progress > span'),

    singleUploadFormEl: $('#single-upload-form'),

    render: function(){

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

    statusPanel: $('#add-status-panel'),

    uploadingMessage: $('#add-uploading-message'),

    processingMessage: $('#add-processing-message'),

    uploadedMessage: $('#add-uploaded-message'),

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
    },

    addSingleAttack: function(e){
        this.singleUploadFormEl.submit(function( event ) {
          if (true) {
            return;
          }

          event.preventDefault();
        });
    },

    singleUploadFinished: function(){
        App.dataChanged();
    }
});
