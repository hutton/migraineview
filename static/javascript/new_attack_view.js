
window.NewAttackView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    el: $('#add-attack-popup'),

    popupBackgroundEl: $('#add-attack-popup'),

    popupEl: $('#add-attack-popup > .popup'),

    showing: false,

    events: {
        "click #submit-button":     "addAttack",
        "click #cancel-button":     "cancel",
        "click .fa-close":          "cancel",
        "click":                    "closePopup"
    },

    attackViewContainer: $('#add-attack-view-container'),

    render: function(){
        this.attackView = new AttackView();

        this.attackView.attributes['submit_button'] = "Add";

        this.attackView.attributes['show_cancel'] = true;
        this.attackView.attributes['show_delete'] = false;

        this.attackViewContainer.empty();

        this.attackViewContainer.append(this.attackView.render().$el);

        this.deleteButton = this.$el.find('#delete-button');

        return this;
    },

    show: function(complete){
        this.showing = true;

        var newDate = (new Date).convertDateToUTC();

        newDate.setMinutes(0);

        this.complete = complete;

        this.model = new EventModel({'date': newDate,
                                'duration': 60 * 60 * 4});

        this.popupBackgroundEl.velocity({backgroundColor: ["#000000", "#000000"] ,backgroundColorAlpha: [0.6, 0.0] },
            {duration: 300, display: "block"});

        this.popupEl.velocity(
            { opacity: 1.0, top: [60, 200], scaleX: [1.0, 0.8], scaleY: [1.0, 0.8] },
            { display: "block", duration: 300, easing: [0.175, 0.885, 0.32, 1.275] });

        this.attackView.setModel(this.model);
        this.deleteButton.removeClass('delete-sure');
    },

    closePopup: function(event){
        var target = $(event.target);

        if (target.hasClass('popup-background')){
            this.hide();
        }
    },

    hide: function(){
        if (!this.showing){
            return;
        }

        this.popupBackgroundEl.velocity("reverse", {display: "none"});
        this.popupEl.velocity("reverse", {display: "none"});

        if (!_.isUndefined(this.complete)){
            this.complete();
        }

        this.showing = false;
    },

    addAttack: function(e){
        e.preventDefault();

        var that = this;

        var started_send = this.attackView.getStarted();
        var ended_send = this.attackView.getEnded();
        var comment = this.attackView.commentEL.val();

        if (!this.attackView.submitButtonEl.hasClass('pure-button-disabled')) {
            this.attackView.submitButtonEl.addClass('pure-button-disabled');

            this.attackView.addMessageLabelEl.html("Saving attack...");

            $.ajax({
                type: "POST",
                url: "/report/add",
                data: {
                    id: this.model.get("id"),
                    started: started_send,
                    ended: ended_send,
                    comment: comment
                }
            }).done(function (response) {
                that.attackView.submitButtonEl.removeClass('pure-button-disabled');
                that.attackView.addMessageLabelEl.html("Attack added.");

                _.delay(function(){
                    that.hide();
                    that.attackView.addMessageLabelEl.html("");
                }, 10);

                App.dataChanged();
                App.refreshData();
            }).fail(function (data) {
                that.attackView.addMessageLabelEl.html("Failed to add attack.");

                that.attackView.submitButtonEl.removeClass('pure-button-disabled');
            });
        }
    },

    cancel: function(event){
        event.preventDefault();

        this.hide();
    }
});
