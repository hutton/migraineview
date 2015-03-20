
window.AttackView = Backbone.View.extend({
    initialize: function () {
    },

    events: {
        "change #started":                     "startOrDurationDateChanged",
        "change #started-time":                "startOrDurationDateChanged",
        "change #recovered":                   "recoveredDateChanged",
        "change #recovered-time":              "recoveredDateChanged",
        "input #add-comment-text":             "startOrDurationDateChanged"
    },

    attributes: {},

    render: function(){
        _.bindAll(this, 'durationLabelUpdate');

        this.$el.html(this.template(this.attributes));

        this.$el.find("input[type='date']").val(new Date().toDateInputValue());

        this.startedEL = this.$el.find('#started');
        this.startedTimeEL = this.$el.find('#started-time');

        this.recoveredEL = this.$el.find('#recovered');
        this.recoveredTimeEL = this.$el.find('#recovered-time');

        this.commentEL = this.$el.find('#add-comment-text');
        this.submitButtonEl = this.$el.find('#submit-button');
        this.addMessageLabelEl = this.$el.find('#add-message-label');

        this.addRecoveredGroupValueEl = this.$el.find('#add-recovered-group > span');

        this.circularSlider = this.$el.find('#slider').CircularSlider({
            radius: 100,
            formLabel : this.durationLabelUpdate,
            min: 0,
            max: 23,
            value: 8,
            innerCircleRatio: .9,
            animateDuration: 100
        });

        this.startOrDurationDateChanged();

        return this;
    },

    template: _.template($('#attack-view-template').html()),

    durationMultiplier: 0,

    previousValue: 0,

    durationLabelUpdate: function(value, prefix, suffix) {

        if (this.previousValue > 18 && value < 6){
            this.durationMultiplier += 1;
        }

        if (this.previousValue < 6 && value > 18){
            if (this.durationMultiplier >= 0){
                this.durationMultiplier -= 1;
            }
        }

        this.previousValue = value;

        var total = Math.max(value + (this.durationMultiplier * 24), 0); // Total is number of half hours

        var hours = Math.floor(total / 2);
        var minutes = (total % 2) * 30;

        var content = "";

        if (minutes === 0){
            content = "<span id='duration-total'>" + hours + "</span><span id='duration-hours-label'> hours</span>";
        } else {
            content = "<span id='duration-total'>" + hours + "</span><span id='duration-hours-label'> hours</span><br/><span id='duration-minutes'>" + minutes + "</span><span id='duration-minutes-label'> mins</span>";
        }

        this.startOrDurationDateChanged();

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

    getRecoveredDate: function(){
        var recover = this.recoveredEL.val();
        var recovered_time = this.recoveredTimeEL.val();

        return this.convertDateToUTC(new Date(recover + "T" + recovered_time));
    },

    createDateAsUTC: function (date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    },

    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    },

    setModel: function(model){
        this.model = model;

        var started_date = model.get('date');

        this.startedEL.val(started_date.toDateInputValue());
        this.startedTimeEL.val(this.dateToTime(started_date));

        var duration = model.get('duration');

        var ended_date = new Date(started_date.getTime() + (duration * 1000));

        this.recoveredEL.val(ended_date.toDateInputValue());
        this.recoveredTimeEL.val(this.dateToTime(ended_date));

        var numberOf30Mins = duration / (60 * 30);

        this.durationMultiplier = Math.floor(numberOf30Mins / 24);

        this.circularSlider.setValue(numberOf30Mins % 24);

        DOM.constructor(this.startedEL[0]).fire("change");

        this.commentEL.val(model.get('comment'));

        this.startOrDurationDateChanged();
    },

    getDuration: function(){
        if (_.isUndefined(this.circularSlider)){
            return 0;
        }

        var sliderValue = this.circularSlider.getValue();

        var totalSeconds = Math.max((sliderValue + (this.durationMultiplier * 24)) * 30 * 60, 0);

        return totalSeconds;
    },


    startOrDurationDateChanged: function(){
        var started = this.getStartedDate();
        var duration = this.getDuration();

        var ended_date = new Date(started.getTime() + (duration * 1000));

        this.recoveredEL.val(ended_date.toDateInputValue());
        this.recoveredTimeEL.val(this.dateToTime(ended_date));

        var text = this.commentEL.val();

        if (text == "" || App.example) {
            this.submitButtonEl.addClass('pure-button-disabled');
        } else {
            this.submitButtonEl.removeClass('pure-button-disabled');
        }
    },

    recoveredDateChanged: function(){
        var started = this.getStartedDate();
        var ended = this.getRecoveredDate();

        if (ended < started){
            this.recoveredEL.val(started.toDateInputValue());
            this.recoveredTimeEL.val(this.dateToTime(started));

            ended = started;
        }

        var duration = (ended - started) / 1000;

        var numberOf30Mins = duration / (60 * 30);

        this.durationMultiplier = Math.floor(numberOf30Mins / 24);

        this.circularSlider.setValue(numberOf30Mins % 24);
    }
});

