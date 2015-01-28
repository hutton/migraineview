
window.EditAttackView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    el: $('#attack-details-popup'),

    popupEl: $('#attack-details-popup'),

    events: {
        "click #submit-button":     "editAttack",
        "click":  "closePopup"
    },

    attackViewContainer: $('#edit-attack-view-container'),

    render: function(){
        this.attackView = new AttackView();

        this.attackView.attributes['submit_button'] = "Update";
        this.attackViewContainer.empty();

        this.attackViewContainer.append(this.attackView.render().$el);

        return this;
    },

    show: function(model){
        this.model = model;

        this.popupEl.fadeIn('fast');

        this.attackView.setModel(model);
    },

    closePopup: function(event){
        var target = $(event.target);

        if (target.hasClass('popup-background')){
            this.hide();
        }
    },

    hide: function(){
        this.popupEl.fadeOut('fast');
    },

    editAttack: function(e){
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
                url: "/report/edit",
                data: {
                    id: this.model.get("id"),
                    started: started_send,
                    ended: ended_send,
                    comment: comment
                }
            }).done(function (response) {
                that.attackView.submitButtonEl.removeClass('pure-button-disabled');
                that.attackView.addMessageLabelEl.html("Attack updated.");

                _.delay(function(){
                    that.hide();
                    that.attackView.addMessageLabelEl.html("");
                }, 600);

                var durationSeconds = (that.attackView.getEndedDate() - that.attackView.getStartedDate()) / 1000;

                if (that.attackView.getStarted() != that.model.get('start') ||
                    durationSeconds != that.model.get('duration')){
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

    }
});
