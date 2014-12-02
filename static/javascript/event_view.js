/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventView = Backbone.View.extend({
    initialize: function () {
    },

    tagName: 'tr',

    template: _.template($('#event-view-template').html()),

    initialize: function() {
        this.listenTo(this.model, "change", this.changed);
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },

    changed: function(){
        if (this.model.get('filtered')){
            this.$el.hide();
        } else {
            this.$el.show();

            var currentHtml = this.template(this.model.toJSON());

            var filter = this.model.get('filter');

            if (filter.length > 0){
                currentHtml = replaceAll(currentHtml, filter, "<span>" + filter + "</span>");
            }

            this.$el.html(currentHtml);
        }
    }
});
