/**
 * Created by simonhutton on 03/10/2014.
 */

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

            var overviewView = new OverviewView({model: response});

            that.statsListEl.append(overviewView.el);

            var monthsOfYear = new FrequencyBarView({model: {'all' : response.daysOfWeek, 'byYear' : response.weekdaysByYearData}});

            that.statsListEl.append(monthsOfYear.el);

            var daysOfWeekView = new FrequencyBarView({model: {'all' : response.monthsOfYear, 'byYear' : response.monthsByYearData}});

            that.statsListEl.append(daysOfWeekView.el);

            var hoursOfDay = new RadarChartView({model: response.hoursOfDay});

            that.statsListEl.append(hoursOfDay.el);
        });
    }
});

$(document).ready(function(){
    window.App = new App();
});

