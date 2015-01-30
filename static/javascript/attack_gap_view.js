/**
 * Created by simonhutton on 08/01/15.
 */

window.AttackGapView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, "resize");

        this.chartWidth = 1024;
        this.chartHeight = 145;
        this.height = 200;
        this.margin = {top: 30, right: 30, bottom: 50, left: 30};
        this.width = this.chartWidth - (20 /*this.margin.left + this.margin.right*/);
        this.percent = d3.format('%');
        this.initialised = false;

        this.render();
    },

    className: 'stat-section',

    template: _.template($('#attack-gap-view-template').html()),

    render: function(){
        var that = this;

        this.$el.html(this.template(this.model));

        this.reportEl = this.$el.find('.attack-gap-report');

        _.delay(function(){
            that.initialDraw();
        }, 0);
    },

    initialDraw: function () {
        var that = this;

        var data = this.model.overview.timeBetweenAttacks;
        var line_data = [[this.model.overview.timeSinceLastAttack, "Last attack"], [this.model.overview.averageTimeBetweenEvent, "Average"]];

        // scales and axes
        this.xPos = d3.scale.linear()
            .range([0, this.width])
            .domain([0, d3.max([d3.max(data), this.model.overview.timeSinceLastAttack])]); // hard-coding this because I know the data

        var y = d3.scale.ordinal();

        this.y = y;

        this.xAxis = d3.svg.axis()
            .scale(this.xPos);

        // create the chart
        this.chart = d3.select(this.reportEl[0]).append('svg')
            .style('width', (this.width + this.margin.left + this.margin.right) + 'px')
            .append('g')
            .attr('transform', 'translate(' + [this.margin.left, this.margin.top] + ')');

        var barHeight = this.height / data.length;

        // set y domain
        y.domain(d3.range(data.length))
            .rangeBands([0, data.length * barHeight]);

        // set height based on data
        this.height = y.rangeExtent()[1];
        d3.select(this.chart.node().parentNode)
            .style('height', (this.height + this.margin.top + this.margin.bottom) + 'px')

        // render the chart

        // add top and bottom axes

        this.chart.append('g')
            .attr('class', 'x-axis-bottom')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(this.xAxis.orient('bottom'));

        this.chart.append('text')
            .attr('class', 'x-axis-bottom-label')
            .style("text-anchor", "middle")
            .attr('transform', 'translate(' + this.width / 2 + ',' + (this.height + 20) + ')')
            .text("Days");

        var bars = this.chart.selectAll('.bar')
            .data(data)
            .enter().append('g')
            .attr('class', 'bar')
            .attr('transform', function (d, i) {
                return 'translate(0,' + y(i) + ')';
            });

        this.chart.selectAll('.line')
            .data(line_data)
            .enter().append('line')
            .attr('class', 'line')
            .attr('x1', function (d) {
                return that.xPos(d[0]);
            })
            .attr('x2', function (d) {
                return that.xPos(d[0]);
            })
            .attr('y1', function (d, n) {
                return n * 15;
            })
            .attr('y2', this.height);

        this.chart.selectAll('.lineTitle')
            .data(line_data)
            .enter().append('text')
            .text(function (d) {
                return d[1];
            })
            .attr('class', 'lineTitle')
            .style("text-anchor", "middle")
            .attr("transform", function (d, n) {
                return "translate(" + (that.xPos(d[0])) + "," + ((n * 15) -2) + ")";
            });


        bars.append('rect')
            .attr('class', 'percent')
            .attr('height', y.rangeBand())
            .attr('width', function (d) {
                return that.xPos(d);
            });

        // resize
        d3.select(window).on('resize', this.resize);

        this.initialised = true;

        this.resize();
    },

    resize: function(){
        if (!this.initialised){
            return;
        }

        var that = this;
        var width = parseInt(d3.select(this.reportEl[0]).style('width'), 10) - this.margin.left - this.margin.right;

        if (isNaN(width)){
            return;
        }

        // resize the chart
        this.xPos.range([0, width]);
        d3.select(this.chart.node().parentNode)
            .style('height', (that.y.rangeExtent()[1] + this.margin.top + this.margin.bottom) + 'px')
            .style('width', (width + this.margin.left + this.margin.right) + 'px');

        this.chart.selectAll('rect.background')
            .attr('width', width);

        this.chart.selectAll('rect.percent')
            .attr('width', function (d) {
                return that.xPos(d);
            });

        // update median ticks

        this.chart.selectAll('line.line')
            .attr('x1', function (d) {
                return that.xPos(d[0]);
            })
            .attr('x2', function (d) {
                return that.xPos(d[0]);
            });

        this.chart.selectAll('.lineTitle')
            .attr("transform", function (d, n) {
                return "translate(" + (that.xPos(d[0])) + "," + ((n * 15) - 4) + ")";
            });

        // update axes
        this.chart.select('.x-axis-bottom').call(this.xAxis.orient('bottom'));

        this.chart.selectAll('.x-axis-bottom-label')
            .attr('transform', 'translate(' + width / 2 + ',' + (this.height + 40) + ')')

    }

});


