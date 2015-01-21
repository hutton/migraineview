/**
 * Created by simonhutton on 27/11/2014.
 */


window.SettingsView = window.MainViewBase.extend({
    initialize: function () {
        var that = this;
        $('#clear-all-cancel').click(function(){
            that.hideClearAllPopup();
        });
    },

    el: $('#settings-view'),

    settingsButtonsMessageEl: $('#settings-buttons-message'),

    clearAllAttacksPopupEl: $('#clear-all-attacks-popup'),

    events: {
        "click #settings-clear-all":  "showClearAllPopup",
        "click #clear-all-cancel":   "hideClearAllPopup",
        "click #clear-all-yes":   "settingsClearAll"
    },

    render: function(){

        return this;
    },

    showClearAllPopup: function(){
        this.clearAllAttacksPopupEl.fadeIn('fast');
    },

    hideClearAllPopup: function(){
        this.clearAllAttacksPopupEl.fadeOut('fast');
    },

    settingsClearAll: function(){
        var that = this;

        $.ajax({
            url: "/service/clearAllEvents"
        }).done(function(response) {

            var data = jQuery.parseJSON(response);

            that.showButtonFinished(data);

            App.dataChanged();
        }).fail(function (response) {

            var data = jQuery.parseJSON(response.responseText);
            that.showButtonFinished(data);
        });
    },

    showButtonFinished: function(data){
        var that = this;

        this.settingsButtonsMessageEl.show();

        this.settingsButtonsMessageEl.html(data.message);

        _.delay(function(){
            that.settingsButtonsMessageEl.fadeOut()
        }, 5000);
    }
});
