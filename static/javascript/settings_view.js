/**
 * Created by simonhutton on 27/11/2014.
 */


window.SettingsView = window.MainViewBase.extend({
    initialize: function () {
    },

    el: $('#settings-view'),

    settingsButtonsMessageEl: $('#settings-buttons-message'),

    events: {
        "click #settings-clear-all":  "settingsClearAll"
    },

    render: function(){

        return this;
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
