
window.EditAttackView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    el: $('#attack-details-popup'),

    popupBackgroundEl: $('#attack-details-popup'),

    popupEl: $('#attack-details-popup > .popup'),

    events: {
        "click #submit-button":     "editAttack",
        "click #cancel-button":     "cancel",
        "click #delete-button":     "deleteAttack",
        "click .fa-close":          "cancel",
        "click":                    "closePopup"
    },

    attackViewContainer: $('#edit-attack-view-container'),

    render: function(){
        this.attackView = new AttackView();

        this.attackView.attributes['submit_button'] = "Update";
        this.attackView.attributes['show_cancel'] = true;
        this.attackView.attributes['show_delete'] = true;

        this.attackViewContainer.empty();

        this.attackViewContainer.append(this.attackView.render().$el);

        this.deleteButton = this.$el.find('#delete-button');

        return this;
    },

    show: function(model){
        this.model = model;

        this.popupBackgroundEl.velocity({backgroundColor: ["#000000", "#000000"] ,backgroundColorAlpha: [0.6, 0.0] },
            {duration: 300, display: "block"});

        this.popupEl.velocity(
            { opacity: 1.0, top: [60, 200], scaleX: [1.0, 0.8], scaleY: [1.0, 0.8] },
            { display: "block", duration: 300, easing: [0.175, 0.885, 0.32, 1.275] });

        this.attackView.setModel(model);
        this.deleteButton.removeClass('delete-sure');
    },

    closePopup: function(event){
        var target = $(event.target);

        if (target.hasClass('popup-background')){
            this.hide();
        }
    },

    hide: function(){
        this.popupBackgroundEl.velocity("reverse", {display: "none"});
        this.popupEl.velocity("reverse", {display: "none"});
    },

    editAttack: function(e){
        e.preventDefault();

        var that = this;

        var started_send = this.attackView.getStarted();
        var duration_send = this.attackView.getDuration();
        var comment = this.attackView.commentEL.val();

        if (!this.attackView.submitButtonEl.hasClass('pure-button-disabled')) {
            this.attackView.submitButtonEl.addClass('pure-button-disabled');

            this.attackView.addMessageLabelEl.html("Saving attack...");

            $.ajax({
                type: "POST",
                url: "/report/edit",
                data: {
                    id: this.model.get("id"),
                    started: started_send,
                    duration: duration_send,
                    comment: comment
                }
            }).done(function (response) {
                that.attackView.submitButtonEl.removeClass('pure-button-disabled');
                that.attackView.addMessageLabelEl.html("Attack updated.");

                _.delay(function(){
                    that.hide();
                    that.attackView.addMessageLabelEl.html("");
                }, 100);

                if (that.attackView.getStarted() != that.model.get('start') ||
                    that.attackView.getDuration() != that.model.get('duration')){
                    App.dataChanged();
                    App.refreshData();
                } else {
                    that.model.set({'comment': comment});
                }

            }).fail(function (data) {
                that.attackView.addMessageLabelEl.html("Failed to update attack.");

                that.attackView.submitButtonEl.removeClass('pure-button-disabled');
            });
        }
    },

    cancel: function(event){
        event.preventDefault();

        this.hide();
    },

    deleteAttack: function(event){
        event.preventDefault();

        var that = this;

        if (this.deleteButton.hasClass('delete-sure')){
            if (!this.deleteButton.hasClass('pure-button-disabled')) {
                this.deleteButton.addClass('pure-button-disabled');

                this.attackView.addMessageLabelEl.html("Removing attack...");

                $.ajax({
                    type: "POST",
                    url: "/report/delete",
                    data: {
                        id: this.model.get("id")
                    }
                }).done(function (response) {
                    that.deleteButton.removeClass('pure-button-disabled');
                    that.attackView.addMessageLabelEl.html("Attack deleted.");

                    _.delay(function(){
                        that.hide();
                        that.attackView.addMessageLabelEl.html("");
                    }, 600);

                    App.dataChanged();
                    App.refreshData();

                }).fail(function (data) {
                    that.attackView.addMessageLabelEl.html("Failed to delete attack.");

                    that.deleteButton.removeClass('pure-button-disabled');
                });
            }
        } else if (!App.example){
            this.deleteButton.addClass('delete-sure');

            _.delay(function(){
                that.deleteButton.removeClass('delete-sure');
            }, 4000);
        }
    }
});
