
window.AttackView = Backbone.View.extend({
    initialize: function () {
    },

    events: {
        "change #started":                     "datesChanged",
        "change #started-time":                "datesChanged",
        "change #ended":                       "datesChanged",
        "change #ended-time":                  "datesChanged",
        "input #add-comment-text":             "datesChanged"
    },

    attributes: {},

    render: function(){
        _.bindAll(this, 'durationLabelUpdate');

        this.$el.html(this.template(this.attributes));

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

        this.$el.find('#slider').CircularSlider({radius: 120,
            formLabel : this.durationLabelUpdate,
            min: 0,
            max: 47,
            innerCircleRatio: .9,
            animateDuration: 100
        });

        this.datesChanged();

        return this;
    },

    template: _.template($('#attack-view-template').html()),

    durationMultiplier: 0,

    previousValue: 0,

    durationLabelUpdate: function(value, prefix, suffix) {

        if (this.previousValue > 38 && value < 8){
            this.durationMultiplier += 1;
        }

        if (this.previousValue < 8 && value > 38){
            if (this.durationMultiplier > 0){
                this.durationMultiplier -= 1;
            }
        }

        this.previousValue = value;

        var total = value + (this.durationMultiplier * 48); // Total is number of half hours

        var hours = Math.floor(total / 4);
        var minutes = (total % 4) * 15;

        var content = "";

        if (minutes === 0){
            content = "<span id='duration-total'>" + hours + "</span><span id='duration-hours-label'> hours</span>";
        } else {
            content = "<span id='duration-total'>" + hours + "</span><span id='duration-hours-label'> hours</span><br/><span id='duration-minutes'>" + minutes + "</span><span id='duration-minutes-label'> mins</span>";
        }

        return content;
    },

    dateToTime: function(date){
        return ( "0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
    },

    getStarted: function(){
        var start = this.startedEL.val();
        var started_time = this.startedTimeEL.val();

        return start + " " + started_time;
    },

    getStartedDate: function(){
        var start = this.startedEL.val();
        var started_time = this.startedTimeEL.val();

        return this.convertDateToUTC(new Date(start + "T" + started_time));
    },

    createDateAsUTC: function (date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    },

    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    },

    getEnded: function(){
        var end = this.endedEL.val();
        var end_time = this.endedTimeEL.val();

        return end + " " + end_time;
    },

    getEndedDate: function(){
        var end = this.endedEL.val();
        var end_time = this.endedTimeEL.val();

        return this.convertDateToUTC(new Date(end + "T" + end_time));
    },

    setModel: function(model){
        this.model = model;

        var started_date = model.get('date');
        var ended_date = new Date(started_date.getTime() + (model.get('duration') * 1000));

        this.startedEL.val(started_date.toDateInputValue());
        this.startedTimeEL.val(this.dateToTime(started_date));

        this.endedEL.val(ended_date.toDateInputValue());
        this.endedTimeEL.val(this.dateToTime(ended_date));

        DOM.constructor(this.startedEL[0]).fire("change");
        DOM.constructor(this.endedEL[0]).fire("change");

        this.commentEL.val(model.get('comment'));

        this.datesChanged();
    },

    datesChanged: function(){
        var started = this.getStartedDate();
        var ended = this.getEndedDate();

        var text = this.commentEL.val();

        if (text == "" || started >= ended || App.example) {
            this.submitButtonEl.addClass('pure-button-disabled');
        } else {
            this.submitButtonEl.removeClass('pure-button-disabled');
        }

        if (started >= ended){
            this.durationGroupEl.show();
            this.durationLabelEl.html("");
            this.durationValueEl.html("<i class='fa fa-exclamation-triangle'></i> Recovered time is before started");
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

