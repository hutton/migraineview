/**
 * Created by simonhutton on 08/10/2014.
 */

window.EventModel = Backbone.Model.extend({
    initialize: function() {
        var seperator = "º";

        var date = null;

        if (this.has('date')){
            date = this.get('date');
        } else{
            date = (new Date(this.get('start').replace(" ", "T"))).convertDateToUTC();
        }

        var dateValues = {
            'date': date,
            'dateText': date.getMonthNameShort() + " " + date.getDate(),
            'day': date.getWeekday(),
            'year': '' + date.getFullYear(),
            'title': date.getTimeText() + " - " + secondsToText(this.get('duration'))
        };

        this.fullText = (dateValues['dateText'] + seperator + dateValues['day'] + seperator + dateValues['year'] + seperator + dateValues['title'] + seperator + this.get('comment')).toUpperCase();


        this.set(dateValues);
    }
});

