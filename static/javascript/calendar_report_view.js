/**
 * Created by simonhutton on 02/01/15.
 */

window.CalendarReportView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    className: 'stat-section',

    template: _.template($('#calendar-report-view-template').html()),

    chartWidth: 960,

    chartHeight: 136,

    render: function () {
        var that = this;

        this.$el.html(this.template(this.model));

        var json_data = this.generateData(this.model.events);

        var firstYear = 2010,
            lastYear = 2014;

        var cellSize = 17; // cell size

        var day = d3.time.format("%w"),
            week = d3.time.format("%U"),
            percent = d3.format(".1%"),
            format = d3.time.format("%Y-%m-%d");

        var color = d3.scale.quantize()
            .domain([0, 10])
            .range(d3.range(11).map(function (d) {
                return "q" + d + "-11";
            }));

        var svg = d3.select(this.$el[0]).selectAll("svg")
            .data(d3.range(firstYear, lastYear + 1))
            .enter().append("svg")
            .attr("width", this.chartWidth)
            .attr("height", this.chartHeight)
            .attr("viewBox", "0 0 " + this.chartWidth + " " + this.chartHeight)
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("class", "RdYlGn")
            .append("g")
            .attr("transform", "translate(" + ((this.chartWidth - cellSize * 53) / 2) + "," + (this.chartHeight - cellSize * 7 - 1) + ")");

        svg.append("text")
            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .text(function (d) {
                return d;
            });

        var rect = svg.selectAll(".day")
            .data(function (d) {
                return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
            })
            .enter().append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function (d) {
                return week(d) * cellSize;
            })
            .attr("y", function (d) {
                return day(d) * cellSize;
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

//        var data = d3.nest()
//                .key(function (d) {
//                    return d.Date;
//                })
//                .rollup(function (d) {
//                    return d[0].Count;
//                })
//                .map(json_data);

        rect.filter(function (d) {
                return d in json_data;
            })
                .attr("class", function (d) {
                    return "day " + color(json_data[d]);
                })
                .select("title")
                .text(function (d) {
                    return d + ": " + percent(json_data[d]);
                });

        function monthPath(t0) {
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                d0 = +day(t0), w0 = +week(t0),
                d1 = +day(t1), w1 = +week(t1);
            return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                + "H" + w0 * cellSize + "V" + 7 * cellSize
                + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                + "H" + (w1 + 1) * cellSize + "V" + 0
                + "H" + (w0 + 1) * cellSize + "Z";
        }

        d3.select(self.frameElement).style("height", "2910px");

        this.calendarsEl = this.$el.find("svg");

        this.bindResize();

        _.delay(function(){
            that.doResize();
        }, 100);
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
                dates[event.date] = dates[event.date] + 1;
            } else {
                dates[event.date] = 1;
            }
        });

        return dates;
    }
});

