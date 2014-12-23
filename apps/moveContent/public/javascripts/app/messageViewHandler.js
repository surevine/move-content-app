var messageHandler = {

    displayInfoMessage : function (message) {
        var messageJson = {messageClass : "alert-info", message : message}
        $("#app-message").html(Mustache.render($('#message-template').html() ,messageJson));
    },

    displayErrorMessage : function (message) {
        var messageJson = {messageClass : "alert-danger", message : message}
        $("#app-message").html(Mustache.render($('#message-template').html() ,messageJson));
    },

    resetMessage : function(){
        $("#app-message").html(Mustache.render($('#message-template').html() ,{}));
    }
}

