/**
 * Created by simonhutton on 03/09/2014.
 */

window.DaysOfWeekView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    template: _.template($('#days-of-week-view-template').html()),

    render: function(){
        this.$el.html(this.template(this.model));

        this.chartEl = this.$el.find('canvas');

        var ctx = this.chartEl.get(0).getContext("2d");

        var data = {
            labels: this.model.daysOfWeek,
            datasets: [
            {
                label: "Uploads",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: this.model.frequencies
            }
        ]};

        new Chart(ctx).Bar(data);

        return this;
    },

    className: 'stat-section'
});


window.App = Backbone.View.extend({
    initialize: function (){

        this.fetchData();
    },

    el: $("body"),

    statsListEl: $("#stat-sections-container"),

    fetchData: function(){
        var that = this;

        $.get( "migraine-data", function( data ) {

            var response = jQuery.parseJSON(data);

            that.statsListEl.empty();

            var daysOfWeekView = new DaysOfWeekView({model: response.daysOfWeek})

            that.statsListEl.append(daysOfWeekView.el);

            var trendView = new DaysOfWeekView({model: response.monthsOfYear})

            that.statsListEl.append(trendView.el);
        });
    }
});

$(document).ready(function(){
    window.App = new App();
});
