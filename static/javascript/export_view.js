/**
 * Created by simonhutton on 27/11/2014.
 */


window.WelcomeView = window.MainViewBase.extend({
    initialize: function () {
    },

    events: {
//        "click #welcome-add-link":  "add",
//        "click #welcome-upload-link":  "upload"
    },

    el: $('#welcome-view'),

    render: function(){

        return this;
    },

    add: function(){
//        window.App.Routes.navigate(window.App.getCurrentBase() + '/timeline?add', {trigger: true});
    },

    upload: function(){
//        window.App.Routes.navigate(window.App.getCurrentBase() + '/account#upload', {trigger: true});
    }

});
