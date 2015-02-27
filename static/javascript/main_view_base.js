/**
 * Created by simonhutton on 26/11/14.
 */

window.MainViewBase = Backbone.View.extend({

    bodyEl: $('body'),

    scrollPos: 0,

    visible: false,

    show: function(){
        if (!this.visible){
            this.switchToView(this);

            this.visible = true;
        }
    },

    onShow: function(){
    },

    onHidden: function(){
    },

    hide: function(){
        if (this.visible){
            this.visible = false;
        }
    },

    switchToView: function(element){
        var that = this;
        var duration = 100;

        if (!_.isUndefined(App.currentView)){

            if ($(window).width() < 1024){
                App.currentView.$el.hide();

                App.currentView.onHidden();
                element.$el.show();

                $(window).scrollTop();

                App.currentView = element;

                this.onShow();
            } else {
                App.currentView.$el.velocity("transition.slideLeftOut", {duration: duration, complete: function(){
                    App.currentView.onHidden();
                    element.$el.velocity("transition.slideLeftIn", {duration: duration, complete: function(elements){
                        element.$el.removeAttr('style');

                        that.onShow();

                        App.currentView = element;
                    }});
                }});
            }
        } else {
            element.$el.show();

            that.onShow();

            App.currentView = element;
        }
    }
});
