/**
 * Created by simonhutton on 08/01/15.
 */

window.OverviewView = Backbone.View.extend({
    initialize: function () {
    },

    template: _.template($('#overview-view-template').html()),

    render: function(){
        this.$el.html(this.template(this.model));

        this.chartEl = this.$el.find('.year-trend-chart');

        var ctx = this.chartEl.get(0).getContext("2d");

        var data = {
            labels: this.model.yearlyTrend.keys,
            datasets: [
            {
                label: "Uploads",
                fillColor: "rgba(151,187,205,0.15)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: this.model.yearlyTrend.frequencies[0]
            }
        ]};

        this.yearTrendChart = new Chart(ctx).Line(data, {responsive: true,
                                  maintainAspectRatio: false});

        this.chartEl = this.$el.find('.overview-trend-chart');

        var ctx = this.chartEl.get(0).getContext("2d");

        var data = {
            labels: this.model.monthYears.keys,
            datasets: [
            {
                label: "Uploads",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: this.model.monthYears.frequencies[0]
            }
        ]};

        this.monthYearChart = new Chart(ctx).Bar(data,
            {
                barValueSpacing: false,
                scaleShowGridLines: false,
                barShowStroke: false,
                showScale: false,
                responsive: true,
                maintainAspectRatio: false
            });

        return this;
    },

    className: 'stat-section'
});

