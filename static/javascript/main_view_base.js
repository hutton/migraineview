/**
 * Created by simonhutton on 26/11/14.
 */

window.MainViewBase = Backbone.View.extend({

    bodyEl: $('body'),

    scrollPos: 0,

    visible: false,

    show: function(){
        if (!this.visible){
            this.$el.show();

            this.bodyEl.scrollTop(this.scrollPos);

            this.visible = true;
        }
    },

    hide: function(){
        if (this.visible){
            this.scrollPos = this.bodyEl.scrollTop();

            this.$el.hide();

            this.visible = false;
        }
    }
});
