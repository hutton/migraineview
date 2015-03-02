/**
 * Created by simonhutton on 26/11/14.
 */

window.MainViewBase = Backbone.View.extend({

    bodyEl: $('body'),

    scrollPos: 0,

    visible: false,

    show: function(){
        if (!this.visible){
            this.switchToView();

            this.visible = true;
        }
    },

    onShow: function(){
    },

    onHidden: function(){
    },

    hide: function(){
    },

    switchToView: function(){
        var that = this;
        var duration = 100;

        if (!_.isUndefined(App.currentView)){

            if ($(window).width() < 1024){
                App.currentView.$el.hide();

                App.currentView.visible = false;
                App.currentView.onHidden();
                this.$el.show();

                $(window).scrollTop();

                App.currentView = this;

                this.onShow();
            } else {
                App.currentView.$el.velocity("transition.slideLeftOut", {duration: duration, complete: function(){
                    App.currentView.visible = false;
                    App.currentView.onHidden();
                    that.$el.velocity("transition.slideLeftIn", {duration: duration, complete: function(elements){
                        that.$el.removeAttr('style');

                        that.onShow();

                        App.currentView = that;
                    }});
                }});
            }
        } else {
            this.$el.show();

            that.onShow();

            App.currentView = this;
        }
    }
});
