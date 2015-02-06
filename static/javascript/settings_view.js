/**
 * Created by simonhutton on 27/11/2014.
 */


window.SettingsView = window.MainViewBase.extend({
    initialize: function () {
    },

    el: $('#settings-view'),

    settingsClearAllEl : $('#settings-clear-all'),

    settingsButtonsMessageEl: $('#settings-buttons-message'),

    clearAllAttacksPopupEl: $('#clear-all-attacks-popup'),

    yesButton: $('#clear-all-yes'),

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
            this.clearAllAttacksPopupEl.fadeIn('fast');
            this.yesButton.removeClass('pure-button-disabled');
        }
    },

    hideClearAllPopup: function(){
        this.clearAllAttacksPopupEl.fadeOut('fast');
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
    }
});
