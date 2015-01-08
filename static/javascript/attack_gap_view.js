/**
 * Created by simonhutton on 08/01/15.
 */

window.AttackGapView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, "resize");
        this.render();
    },

    className: 'stat-section',

    template: _.template($('#attack-gap-view-template').html()),

    chartWidth: 1024,

    chartHeight: 145,

    render: function () {
        var that = this;

        this.$el.html(this.template(this.model));

        this.reportEl = this.$el.find('.attack-gap-report');

        var json_data = this.model.overview.timeBetweenAttacks;

        var margin = {top: 30, right: 10, bottom: 30, left: 10}
            , width = this.chartWidth
            , width = width - margin.left - margin.right
            , height = 180
            , percent = d3.format('%');

        this.margin = margin;

        // scales and axes
        this.x = d3.scale.linear()
            .range([0, width])
            .domain([0, d3.max(json_data)]); // hard-coding this because I know the data

        var x = this.x;

        var y = d3.scale.ordinal();

        this.y = y;

        this.xAxis = d3.svg.axis()
            .scale(x);

        // create the chart
        this.chart = d3.select(this.reportEl[0]).append('svg')
            .style('width', (width + margin.left + margin.right) + 'px')
            .append('g')
            .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

        data = json_data;

        line_data = [6, 8, 12];

        barHeight = height / data.length;

        // set y domain
        y.domain(d3.range(data.length))
            .rangeBands([0, data.length * barHeight]);

        // set height based on data
        height = y.rangeExtent()[1];
        d3.select(this.chart.node().parentNode)
            .style('height', (height + margin.top + margin.bottom) + 'px')

        // render the chart

        // add top and bottom axes

        this.chart.append('g')
            .attr('class', 'x axis bottom')
            .attr('transform', 'translate(0,' + height + ')')
            .call(this.xAxis.orient('bottom'));

        var bars = this.chart.selectAll('.bar')
            .data(data)
            .enter().append('g')
            .attr('class', 'bar')
            .attr('transform', function (d, i) {
                return 'translate(0,' + y(i) + ')';
            });

        var lines = this.chart.selectAll('.line')
            .data(line_data)
            .enter().append('line')
            .attr('class', 'line')
            .attr('x1', function (d) {
                return x(d);
            })
            .attr('x2', function (d) {
                return x(d);
            })
            .attr('y1', 0)
            .attr('y2', height);

        var lines = this.chart.selectAll('.lineTitle')
            .data(line_data)
            .enter().append('text')
            .text(function (d) {
                return d;
            })
            .attr('class', 'lineTitle')
            .attr("transform", function (d) {
                return "translate(" + x(d) + ",0)";
            });


        bars.append('rect')
            .attr('class', 'percent')
            .attr('height', y.rangeBand())
            .attr('width', function (d) {
                return x(d);
            })

        // resize
        d3.select(window).on('resize', this.resize);

        function resize() {
            // update width

        }
    },

    resize: function(){
        var that = this;
        var width = parseInt(d3.select(this.reportEl[0]).style('width'), 10);
        width = width - this.margin.left - this.margin.right;

        // resize the chart
        this.x.range([0, width]);
        d3.select(this.chart.node().parentNode)
            .style('height', (that.y.rangeExtent()[1] + this.margin.top + this.margin.bottom) + 'px')
            .style('width', (width + this.margin.left + this.margin.right) + 'px');

        this.chart.selectAll('rect.background')
            .attr('width', width);

        this.chart.selectAll('rect.percent')
            .attr('width', function (d) {
                return that.x(d);
            });

        // update median ticks

        this.chart.selectAll('line.line')
            .attr('x1', function (d) {
                return that.x(d);
            })
            .attr('x2', function (d) {
                return that.x(d);
            });

        this.chart.selectAll('.lineTitle')
            .attr("transform", function (d) {
                return "translate(" + that.x(d) + ",0)";
            });

        // update axes
        this.chart.select('.x.axis.bottom').call(this.xAxis.orient('bottom'));
    }

});


