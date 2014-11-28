/**
 * Created by simonhutton on 27/11/2014.
 */


window.SettingsView = window.MainViewBase.extend({
    initialize: function () {
    },

    el: $('#settings-view'),

    events: {
        "click #settings-clear-all":  "settingsClearAll"
    },

    render: function(){

        return this;
    },

    settingsClearAll: function(){
        $.ajax({
            url: "/service/clearAllEvents"
        }).done(function(response) {

            App.dataChanged();
        });

    }
});
