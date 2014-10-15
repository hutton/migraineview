/**
 * Created by simonhutton on 03/09/2014.
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
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: this.model.yearlyTrend.frequencies[0]
            }
        ]};

        this.yearTrendChart = new Chart(ctx).Bar(data, {responsive: true,
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

window.FrequencyBarView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    className: 'stat-section',

    template: _.template($('#days-of-week-view-template').html()),

    events: {
        "click .graph-mode-all":    "allMode",
        "click .graph-mode-year":    "yearMode"
    },

    createChart: function(element, data){
        var ctx = element.get(0).getContext("2d");

        var datasets = [];

        var colors = ["151,187,205","151,205,187","205,187,151"];

        var count = 0;

        _.each(data.frequencies, function(item){
            var color = colors[count % colors.length];

            var dataSet = {
                label: "Uploads",
                fillColor: "rgba(" + color + ",0.5)",
                strokeColor: "rgba(" + color + ",0.8)",
                highlightFill: "rgba(" + color + ",0.75)",
                highlightStroke: "rgba(" + color + ",1)",
                data: item
            };

            datasets.push(dataSet);

            count++;
        });

        var chartData = {
            labels: data.keys,
            datasets: datasets
        };

        new Chart(ctx).Bar(chartData, {responsive: true,
                                  maintainAspectRatio: false});
    },

    render: function(){
        this.$el.html(this.template(this.model));

        this.createChart(this.$el.find('.all-chart'), this.model.all);

        this.createChart(this.$el.find('.by-year-chart'), this.model.byYear);

        return this;
    },

    allMode: function(event){
        this.$el.find('.by-year-chart').fadeOut();
        this.$el.find('.all-chart').removeClass('faded');

        this.$el.find('.graph-mode > span').removeClass('selected');
        $(event.target).addClass('selected');
    },

    yearMode: function(event){
        this.$el.find('.by-year-chart').fadeIn();
        this.$el.find('.all-chart').addClass('faded');

        this.$el.find('.graph-mode > span').removeClass('selected');
        $(event.target).addClass('selected');
    }
});

window.RadarChartView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    template: _.template($('#radar-chart-view-template').html()),

    render: function(){
        this.$el.html(this.template(this.model));

        this.chartEl = this.$el.find('canvas');

        var ctx = this.chartEl.get(0).getContext("2d");

        var data = {
            labels: this.model.keys,
            datasets: [
            {
                label: "Uploads",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: this.model.frequencies[0]
            }
        ]};

        new Chart(ctx).Radar(data);

        return this;
    },

    className: 'stat-section'
});

window.StatisticsView = Backbone.View.extend({
    initialize: function () {
    },

    statsListEl: $("#stat-sections-container"),

    render: function() {
        this.statsListEl.empty();

        this.overviewView = new OverviewView({model: this.model});

        this.statsListEl.append(this.overviewView.render().el);

        this.monthsOfYearBarView = new FrequencyBarView({model: {'all' : this.model.daysOfWeek, 'byYear' : this.model.weekdaysByYearData}});

        this.statsListEl.append(this.monthsOfYearBarView.el);

        this.daysOfWeekViewBarView = new FrequencyBarView({model: {'all' : this.model.monthsOfYear, 'byYear' : this.model.monthsByYearData}});

        this.statsListEl.append(this.daysOfWeekViewBarView.el);

        this.hoursOfDayRadarView = new RadarChartView({model: this.model.hoursOfDay});

        this.statsListEl.append(this.hoursOfDayRadarView.el);

        window.dispatchEvent(new Event('resize'));
    }
});