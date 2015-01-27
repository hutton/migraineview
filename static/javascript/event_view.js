/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "change", this.changed);
    },

    tagName: 'tr',

    template: _.template($('#event-view-template').html()),

    events: {
        "click":        "showDetails"
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },

    showDetails: function(){
        window.App.eventsView.showDetails(this.model);
    },

    changed: function(){
        if (this.model.get('filtered')){
            this.$el.hide();
        } else {
            this.$el.show();

            var modelDict = this.model.toJSON();

            var filter = this.model.get('filter');

            if (filter.length > 0) {
                modelDict.start_text = replaceAll(modelDict.start_text, "<br/>", "º");
                modelDict.start_text = replaceAll(modelDict.start_text, filter, "<span>" + filter + "</span>");
                modelDict.start_text = replaceAll(modelDict.start_text, "º", "<br/>");

                modelDict.duration_text = replaceAll(modelDict.duration_text, filter, "<span>" + filter + "</span>");
                modelDict.comment = replaceAll(modelDict.comment, filter, "<span>" + filter + "</span>");
            }

            var currentHtml = this.template(modelDict);

            this.$el.html(currentHtml);
        }
    }
});
