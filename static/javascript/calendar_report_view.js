/**
 * Created by simonhutton on 02/01/15.
 */

window.CalendarReportView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    events: {
        "click .calendar-report-12months":      "on12Months",
        "click .calendar-report-all":           "onAll",
        "click .calendar-report-all-stacked":   "onAllStacked"
    },

    className: 'stat-section',

    template: _.template($('#calendar-report-view-template').html()),

    chartWidth: 1024,

    chartHeight: 145,

    render: function () {
        var that = this;

        this.$el.html(this.template(this.model));

        this.calendarReportAllEl = this.$el.find('.calendar-report > .calendar-report-all');
        this.calendarReportLast12MonthsEl = this.$el.find('.calendar-report > .calendar-report-last12months');

        this.calendarData = this.generateData(this.model.events);

        this.renderAllCalendarReport();
        this.renderLast12MonthsCalendarReport();

        this.calendarsEl = this.$el.find("svg");

        this.bindResize();

        _.delay(function(){
            that.doResize();
        }, 100);
    },

    cellSize: 18,

    color: d3.scale.quantize()
            .domain([0, 10])
            .range(d3.range(11).map(function (d) {
                return "q" + d + "-11";
            })),

    renderAllCalendarReport: function(){
        var that = this;

        var firstYear = this.model.firstYear,
            lastYear = this.model.thisYear;

        var day = d3.time.format("%w"),
            week = d3.time.format("%U"),
            percent = d3.format(".1%"),
            month = d3.time.format("%b"),
            long_date = d3.time.format("%A %d %B %Y"),
            format = d3.time.format("%Y-%m-%d");

        var svg = d3.select(this.calendarReportAllEl[0]).selectAll("svg")
            .data(d3.range(firstYear, lastYear + 1))
            .enter().append("svg")
            .attr("width", this.chartWidth)
            .attr("height", this.chartHeight)
            .attr("viewBox", "0 0 " + this.chartWidth + " " + this.chartHeight)
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("class", "RdYlGn")
            .append("g")
            .attr("transform", "translate(" + ((this.chartWidth - that.cellSize * 53) / 2) + "," + (this.chartHeight - that.cellSize * 7 - 1) + ")");

        svg.append("text")
            .attr("transform", "translate(-6," + that.cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .attr("class", "year")
            .text(function (d) {
                return d;
            });

        svg.append("text")
            .attr("transform", "translate(-12," + that.cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .attr("class", "year-stacked")
            .text(function (d) {
                return firstYear + " - " + lastYear;
            });

        var rect = svg.selectAll(".day")
            .data(function (d) {
                return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
            })
            .enter().append("rect")
            .attr("class", "day")
            .attr("width", that.cellSize)
            .attr("height", that.cellSize)
            .attr("x", function (d) {
                return week(d) * that.cellSize;
            })
            .attr("y", function (d) {
                return day(d) * that.cellSize;
            })
            .datum(format);

        rect.append("title")
            .text(function (d) {
                return d;
            });

        svg.selectAll(".month")
            .data(function (d) {
                return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
            })
            .enter().append("path")
            .attr("class", "month")
            .attr("d", monthPath);

        svg.selectAll(".month-text")
            .data(function (d) {
                return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
            })
            .enter().append("text")
            .style("text-anchor", "start")
            .attr("class", "month-text")
            .attr("transform", monthTextTranslate)
            .text(function (d) {
                return month(d);
            });

        rect.filter(function (d) {
                return d in that.calendarData;
            })
                .attr("class", function (d) {
                    return "day " + that.color(that.calendarData[d][0]);
                })
                .select("title")
                .text(function (d) {
                    var date = format.parse(d);
                    var text = long_date(date);

                    if (that.calendarData[d][1].length > 0){
                        text += "\n";
                        text += "\n";
                        text += that.calendarData[d][1];
                    }

                    return text;
                });

        function monthTextTranslate(t0){
            var w0 = +week(t0);

            return "translate(" + (((w0 + (day(t0) == 0 ? 0 : 1)) * that.cellSize) + 2) + ", -3)";
        }

        function monthPath(t0) {
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                d0 = +day(t0), w0 = +week(t0),
                d1 = +day(t1), w1 = +week(t1);
            return "M" + (w0 + 1) * that.cellSize + "," + d0 * that.cellSize
                + "H" + w0 * that.cellSize + "V" + 7 * that.cellSize
                + "H" + w1 * that.cellSize + "V" + (d1 + 1) * that.cellSize
                + "H" + (w1 + 1) * that.cellSize + "V" + 0
                + "H" + (w0 + 1) * that.cellSize + "Z";
        }
    },

    renderLast12MonthsCalendarReport: function(){
        var that = this;

        var lastDate = new Date();
        var firstDate = GetAYearAgoOnSunday(new Date());

        var day = d3.time.format("%w"),
            month = d3.time.format("%b"),
            long_date = d3.time.format("%A %d %B %Y"),
            format = d3.time.format("%Y-%m-%d");

        var svg = d3.select(this.calendarReportLast12MonthsEl[0]).selectAll("svg")
            .data(d3.range(lastDate.getFullYear(), lastDate.getFullYear() + 1))
            .enter().append("svg")
            .attr("width", this.chartWidth)
            .attr("height", this.chartHeight)
            .attr("viewBox", "0 0 " + this.chartWidth + " " + this.chartHeight)
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("class", "RdYlGn")
            .append("g")
            .attr("transform", "translate(" + ((this.chartWidth - that.cellSize * 53) / 2) + "," + (this.chartHeight - that.cellSize * 7 - 1) + ")");

        svg.append("text")
            .attr("transform", "translate(-12," + that.cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .attr("class", "year")
            .text(function (d) {
                return firstDate.getFullYear() + " - " + lastDate.getFullYear();
            });

        var rect = svg.selectAll(".day")
            .data(function (d) {
                return d3.time.days(firstDate, lastDate);
            })
            .enter().append("rect")
            .attr("class", "day")
            .attr("width", that.cellSize)
            .attr("height", that.cellSize)
            .attr("x", function (d, n) {
                return Math.floor(n / 7) * that.cellSize;
            })
            .attr("y", function (d) {
                return day(d) * that.cellSize;
            })
            .datum(format);

        rect.append("title")
            .text(function (d) {
                return d;
            });

        svg.selectAll(".month-text")
            .data(function (d) {
                return d3.time.months(new Date(firstDate.getFullYear(), firstDate.getMonth(), 0), lastDate);
            })
            .enter().append("text")
            .style("text-anchor", "start")
            .attr("class", "month-text")
            .attr("transform", monthTextTranslate)
            .text(function (d) {
                return month(d);
            });

        rect.filter(function (d) {
                return d in that.calendarData;
            })
                .attr("class", function (d) {
                    return "day " + that.color(that.calendarData[d][0]);
                })
                .select("title")
                .text(function (d) {
                    var date = format.parse(d);
                    var text = long_date(date);

                    if (that.calendarData[d][1].length > 0){
                        text += "\n";
                        text += "\n";
                        text += that.calendarData[d][1];
                    }

                    return text;
                });

        function GetAYearAgoOnSunday(date){
            var yearAgo = new Date(date.setDate(date.getDate()-365));

            if (yearAgo.getDay() !== 0){
                yearAgo = new Date(yearAgo.setDate(yearAgo.getDate()-yearAgo.getDay()));
            }

            yearAgo.setHours(0,0,0,0);

            return yearAgo;
        }

        function weeksBetween(date1, date2){
           var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();

            var difference_ms = Math.abs(date1_ms - date2_ms);

            return Math.round(difference_ms/ONE_WEEK);
        }

        function monthTextTranslate(t0, n){
            if (n == 0){
                return "translate(0, -3)";
            }

            var weeksSinceStart = weeksBetween(firstDate, t0) - 1;

            return "translate(" + (((weeksSinceStart + (day(t0) == 0 ? 0 : 1)) * that.cellSize) + 2) + ", -3)";
        }
    },

    bindResize: function(){
        var that = this;

        $(window).on("resize", function() {
            that.doResize();
        });
    },

    doResize: function(){
        var targetWidth = $("#stat-sections-container > .stat-section").width();
        var aspect = this.chartWidth / this.chartHeight;

        this.calendarsEl.attr("width", targetWidth);
        this.calendarsEl.attr("height", targetWidth / aspect);
    },

    generateData: function(events){

        var dates = {};

        _.each(events, function(event){
            if (event.date in dates){
                dates[event.date] = [dates[event.date][0] + 1, dates[event.date][0] + "\n" + event.comment];
            } else {
                dates[event.date] = [1, event.comment];
            }
        });

        return dates;
    },

    on12Months: function(event){
        this.calendarReportLast12MonthsEl.show();
        this.calendarReportAllEl.hide();

        this.$el.find('.calendar-report-buttons > div').removeClass('selected');
        $(event.target).addClass('selected');
    },

    onAll: function(event){
        this.calendarReportLast12MonthsEl.hide();
        this.calendarReportAllEl.show();
        this.calendarReportAllEl.removeClass("stacked");

        this.$el.find('.calendar-report-buttons > div').removeClass('selected');
        $(event.target).addClass('selected');
    },

    onAllStacked: function(event){
        this.calendarReportLast12MonthsEl.hide();
        this.calendarReportAllEl.show();
        this.calendarReportAllEl.addClass("stacked");

        this.$el.find('.calendar-report-buttons > div').removeClass('selected');
        $(event.target).addClass('selected');
    }
});

