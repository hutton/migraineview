/**
 * Created by simonhutton on 19/11/14.
 */

window.AddView = Backbone.View.extend({
    initialize: function () {
        $("input[type='date']").val(new Date().toDateInputValue());
    },

    el: $('#add_view'),

    render: function(){


        return this;
    }
});
