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
            this.scrollPos = this.bodyEl.scrollTop();

//            this.$el.hide();

            this.visible = false;
        }
    },

    switchToView: function(element){
        var that = this;
        var duration = 100;

        if (!_.isUndefined(App.currentView)){
            App.currentView.$el.velocity("transition.slideLeftOut", {duration: duration, complete: function(){
                element.$el.velocity("transition.slideLeftIn", {duration: duration, complete: function(){
                    that.onShow();
                    that.bodyEl.scrollTop(that.scrollPos);
                }});
            }});
        } else {
            element.$el.show();

            that.onShow();
            that.bodyEl.scrollTop(that.scrollPos);
        }

        this.currentView = element;
    }
});
