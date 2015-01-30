/**
 * Created by simonhutton on 03/09/2014.
 */

window.MonthsOfYearBarView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    className: 'stat-section',

    template: _.template($('#months-of-year-view-template').html()),

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

        this.$el.find('.graph-mode > div').removeClass('selected');
        $(event.target).addClass('selected');
    },

    yearMode: function(event){
        this.$el.find('.by-year-chart').fadeIn();
        this.$el.find('.all-chart').addClass('faded');

        this.$el.find('.graph-mode > div').removeClass('selected');
        $(event.target).addClass('selected');
    }
});

window.DaysOfWeekBarView = Backbone.View.extend({
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

        this.createChart(this.$el.find('.all-chart'), this.model.daysData);

        this.createChart(this.$el.find('.by-year-chart'), this.model.daysDataByYear);

        return this;
    },

    allMode: function(event){
        this.$el.find('.by-year-chart').fadeOut();
        this.$el.find('.all-chart').removeClass('faded');

        this.$el.find('.graph-mode > div').removeClass('selected');
        $(event.target).addClass('selected');
    },

    yearMode: function(event){
        this.$el.find('.by-year-chart').fadeIn();
        this.$el.find('.all-chart').addClass('faded');

        this.$el.find('.graph-mode > div').removeClass('selected');
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

window.StatisticsView = window.MainViewBase.extend({
    initialize: function () {
    },

    el: $('#stats-view'),

    statsListEl: $("#stat-sections-container"),

    statsLoaderEl: $('#stats-loading'),

    statsNoDataEl: $('#stats-no-data'),

    render: function() {
        if (_.isUndefined(this.model.events)){
            this.showNoAttacks();
        } else {
            this.showAttacks();
        }
    },

    showDataLoading: function(){
        this.statsNoDataEl.hide();
        this.statsLoaderEl.show();

        this.statsListEl.empty();
    },

    showNoAttacks: function(){
        this.statsNoDataEl.show();
        this.statsLoaderEl.hide();
    },

    showAttacks: function(){
        this.statsNoDataEl.hide();
        this.statsLoaderEl.hide();

        Chart.defaults.global.animation = false;
        Chart.defaults.global.scaleBeginAtZero = true;

        this.statsListEl.empty();

        this.overviewView = new OverviewView({model: this.model});
        this.statsListEl.append(this.overviewView.render().el);

        this.attackGapView = new AttackGapView({model: this.model});
        this.statsListEl.append(this.attackGapView.el);

        this.calendarReportView = new CalendarReportView({model: this.model});
        this.statsListEl.append(this.calendarReportView.el);

        this.daysOfWeekViewBarView = new DaysOfWeekBarView({model: this.model.daysOfWeek});
        this.statsListEl.append(this.daysOfWeekViewBarView.el);

        this.monthsOfYearBarView = new MonthsOfYearBarView({model: {'all' : this.model.monthsOfYear.monthsData, 'byYear' : this.model.monthsOfYear.monthsDataByYear}});
        this.statsListEl.append(this.monthsOfYearBarView.el);

        this.hoursOfDayRadarView = new RadarChartView({model: this.model.hoursOfDay});
        this.statsListEl.append(this.hoursOfDayRadarView.el);

        this.triggerResize();
    },

    onShow: function(){
        this.triggerResize();
    },

    triggerResize: function(){
        try{
            window.dispatchEvent(new Event('resize'));
        } catch (err){

        }
    }
});