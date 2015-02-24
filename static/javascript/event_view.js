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

        templateValues['previous'] = this.getPreviousText();

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
                    modelDict.title = replaceAll(modelDict.title, filter, "<span>" + filter + "</span>");

                    modelDict.day = replaceAll(modelDict.day, filter, "<span>" + filter + "</span>");
                    modelDict.dateText = replaceAll(modelDict.dateText, filter, "<span>" + filter + "</span>");
                    modelDict.year = replaceAll(modelDict.year, filter, "<span>" + filter + "</span>");

                    modelDict.comment = replaceAll(modelDict.comment, filter, "<span>" + filter + "</span>");
                }
            }

            modelDict['previous'] = this.getPreviousText();

            var currentHtml = this.template(modelDict);

            this.$el.html(currentHtml);
        }
    },

    getPreviousText: function(){
        var prev = this.model.get('previousModel');
        var date = this.model.get('date');

        while (prev != null && prev.get('filtered')){
            prev = prev.get('previousModel');
        }

        if (prev != null){
            return date.getDifferenceText(prev.get('date'));
        } else {
            return  date.getDifferenceText((new Date()).convertDateToUTC());
        }
    }
});
