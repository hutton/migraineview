/**
 * Created by simonhutton on 27/11/2014.
 */


window.SettingsView = window.MainViewBase.extend({
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
    },

    el: $('#settings-view'),

    settingsClearAllEl : $('#settings-clear-all'),

    settingsButtonsMessageEl: $('#settings-buttons-message'),

    yesButton: $('#clear-all-yes'),

    clearAllAttacksPopupBackgroundEl: $('#clear-all-attacks-popup'),

    clearAllAttacksPopupEl: $('#clear-all-attacks-popup > .popup'),

    statusPanel: $('#add-status-panel'),

    uploadingMessage: $('#add-uploading-message'),

    processingMessage: $('#add-processing-message'),

    uploadedMessage: $('#add-uploaded-message'),

    uploadContainer: $('.upload-container'),

    uploadingProgress: $('#uploading-message > .progress > span'),

    events: {
        "click #settings-clear-all":  "showClearAllPopup",
        "click #clear-all-cancel":   "hideClearAllPopup",
        "click #clear-all-yes":   "settingsClearAll"
    },

    render: function(){

        return this;
    },

    showClearAllPopup: function(){
        if (!this.settingsClearAllEl.hasClass('pure-button-disabled')) {

            this.clearAllAttacksPopupBackgroundEl.velocity({backgroundColor: ["#000000", "#000000"] ,backgroundColorAlpha: [0.6, 0.0] },
                {duration: 300, display: "block"});

            this.clearAllAttacksPopupEl.velocity(
                { opacity: 1.0, top: [60, 200], scaleX: [1.0, 0.8], scaleY: [1.0, 0.8] },
            { display: "inline-block", duration: 300, easing: [0.175, 0.885, 0.32, 1.275] });

            this.yesButton.removeClass('pure-button-disabled');
        }
    },

    hideClearAllPopup: function(){
        this.clearAllAttacksPopupBackgroundEl.velocity("reverse", {display: "none"});
        this.clearAllAttacksPopupEl.velocity("reverse", {display: "none"});
    },

    settingsClearAll: function(){
        var that = this;

        if (!this.yesButton.hasClass('pure-button-disabled')){
            this.yesButton.addClass('pure-button-disabled');

            $.ajax({
                url: "/service/clearAllEvents"
            }).done(function(response) {

                var data = jQuery.parseJSON(response);

                that.showButtonFinished(data);
                that.hideClearAllPopup();

                App.dataChanged();
            }).fail(function (response) {

                var data = jQuery.parseJSON(response.responseText);
                that.showButtonFinished(data);
            });
        }
    },

    showButtonFinished: function(data){
        var that = this;

        this.settingsButtonsMessageEl.show();

        this.settingsButtonsMessageEl.html(data.message);

        _.delay(function(){
            that.settingsButtonsMessageEl.fadeOut()
        }, 5000);
    },

        onDrop: function(e){
        e.preventDefault();

        if (!App.example){
            this.sendFiles(e.originalEvent.dataTransfer.files);
        }
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
    }
});
