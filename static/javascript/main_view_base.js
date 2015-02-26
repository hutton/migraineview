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

            App.currentView = this;
        }
    },

    onShow: function(){

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
                element.$el.show();

                element.$el.scrollTop();

                this.onShow();
            } else {
                App.currentView.$el.velocity("transition.slideLeftOut", {duration: duration, complete: function(){
                    element.$el.velocity("transition.slideLeftIn", {duration: duration, complete: function(elements){
                        element.$el.removeAttr('style');

                        that.onShow();
                    }});
                }});
            }
        } else {
            element.$el.show();

            that.onShow();
        }

        this.currentView = element;
    }
});
