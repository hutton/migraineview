/**
 * Created by simonhutton on 07/10/2014.
 */


window.EventView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "change", this.changed);
    },

    tagName: 'tr',

    className: 'tl-row',

    template: _.template($('#event-view-template').html()),

    events: {
        "click":        "showDetails"
    },

    render: function(){
        var templateValues = this.model.toJSON();

        var prev = this.model.get('previousModel');
        var date = this.model.get('date');

        if (prev != null){
            templateValues['previous'] = date.getDifferenceText(prev.get('date'));
        } else {
            templateValues['previous'] = date.getDifferenceText((new Date()).convertDateToUTC());
        }

        this.$el.html(this.template(templateValues));

        return this;
    },

    showDetails: function(){
        window.App.eventsView.showDetails(this.model);
    },

    changed: function(){
        if (this.model.get('filtered')){
            this.$el.hide();
//            this.$el.velocity('transition.slideRightBigOut', {duration: 200});
        } else {
            this.$el.show();
//            this.$el.velocity('transition.slideRightBigIn', {duration: 200});

            var modelDict = this.model.toJSON();

            if (!this.model.get('filtered')){
                var filter = this.model.get('filter');

                if (!_.isUndefined(filter) && filter.length > 0) {
                    modelDict.start_text = replaceAll(modelDict.start_text, "<br/>", "º");
                    modelDict.start_text = replaceAll(modelDict.start_text, filter, "<span>" + filter + "</span>");
                    modelDict.start_text = replaceAll(modelDict.start_text, "º", "<br/>");

                    modelDict.duration_text = replaceAll(modelDict.duration_text, filter, "<span>" + filter + "</span>");
                    modelDict.comment = replaceAll(modelDict.comment, filter, "<span>" + filter + "</span>");
                }
            }

            var currentHtml = this.template(modelDict);

            this.$el.html(currentHtml);
        }
    }
});
