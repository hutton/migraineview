/**
 * Created by simonhutton on 26/11/14.
 */

window.MainViewBase = Backbone.View.extend({

    show: function(){
        this.$el.show();
    },

    hide: function(){
        this.$el.hide();
    }
});
