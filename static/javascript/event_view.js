/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "change", this.changed);
    },

    tagName: 'tr',

    template: _.template($('#event-view-template').html()),

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },

    changed: function(){
        if (this.model.get('filtered')){
            this.$el.hide();
        } else {
            this.$el.show();

            var modelDict = this.model.toJSON();

            var filter = this.model.get('filter');

            if (filter.length > 0) {
                modelDict.start = replaceAll(modelDict.start, "<br/>", "º");
                modelDict.start = replaceAll(modelDict.start, filter, "<span>" + filter + "</span>");
                modelDict.start = replaceAll(modelDict.start, "º", "<br/>");

                modelDict.duration = replaceAll(modelDict.duration, filter, "<span>" + filter + "</span>");
                modelDict.comment = replaceAll(modelDict.comment, filter, "<span>" + filter + "</span>");
            }

            var currentHtml = this.template(modelDict);

            this.$el.html(currentHtml);
        }
    }
});
