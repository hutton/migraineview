
window.AttackView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    events: {
        "change #started":                     "datesChanged",
        "change #started-time":                "datesChanged",
        "change #ended":                       "datesChanged",
        "change #ended-time":                  "datesChanged",
        "input #add-comment-text":             "datesChanged"
    },

    render: function(){

        var attributes = {

            };

        this.$el.html(this.template(attributes));

        this.$el.find("input[type='date']").val(new Date().toDateInputValue());

        this.durationGroupEl = this.$el.find('#add-duration-group');
        this.startedEL = this.$el.find('#started');
        this.startedTimeEL = this.$el.find('#started-time');
        this.endedEL = this.$el.find('#ended');
        this.endedTimeEL = this.$el.find('#ended-time');
        this.commentEL = this.$el.find('#add-comment-text');
        this.durationLabelEl = this.$el.find('#add-duration-group > label');
        this.durationValueEl = this.$el.find('#add-duration-group > span');
        this.submitButtonEl = this.$el.find('#submit-button');
        this.addMessageLabelEl = this.$el.find('#add-message-label');

        this.datesChanged();

        return this;
    },

    template: _.template($('#attack-view-template').html()),

    dateToTime: function(date){
        return ( "0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
    },

    dateToShortDate: function(date){
        return date.getFullYear() + "-" + ( "0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    },

    getStarted: function(){
        var start = this.startedEL.val();
        var started_time = this.startedTimeEL.val();

        return start + " " + started_time;
    },

    getEnded: function(){
        var end = this.endedEL.val();
        var end_time = this.endedTimeEL.val();

        return end + " " + end_time;
    },

    setModel: function(model){
        this.model = model;

        var started_date = new Date(model.get('start').replace(" ", "T"));
        var ended_date = new Date(started_date.getTime() + (model.get('duration') * 1000));

        this.startedEL.val(this.dateToShortDate(started_date));
        this.startedTimeEL.val(this.dateToTime(started_date));

        this.endedEL.val(this.dateToShortDate(ended_date));
        this.endedTimeEL.val(this.dateToTime(ended_date));

        this.commentEL.val(model.get('comment'));

        this.datesChanged();
    },

    datesChanged: function(){
        var start = this.startedEL.val();
        var started_time = this.startedTimeEL.val();
        var end = this.endedEL.val();
        var ended_time = this.endedTimeEL.val();

        var started = new Date(start + "T" + started_time);
        var ended = new Date(end + "T" + ended_time);

        var text = this.commentEL.val();

        if (text == "" || started >= ended) {
            this.submitButtonEl.addClass('pure-button-disabled');
        } else {
            this.submitButtonEl.removeClass('pure-button-disabled');
        }

        if (started >= ended){
            this.durationGroupEl.show();
            this.durationLabelEl.html("");
            this.durationValueEl.html("Select a valid duration");
        } else {

            var timeDiff = Math.abs(ended.getTime() - started.getTime());
            var diffHours = timeDiff / (1000 * 60);

            var hours = Math.floor(diffHours/60);
            var minutes = diffHours % 60;

            var result = "";

            if (hours == 1){
                result = "1 hour ";
            } else if (hours > 1){
                result = hours + " hours ";
            }

            if (minutes == 1){
                result += "1 minute";
            } else if (minutes > 1){
                result += minutes + " minutes";
            }

            if (result == ""){
                this.durationGroupEl.hide();
                this.durationLabelEl.html("");
            } else {
                this.durationGroupEl.show();
                this.durationLabelEl.html("Duration");

                this.durationValueEl.html(result);
            }
        }
    }

});

