var bootbox = bootbox || (function() {
    var that = {};

    that.alert = function(/*str, label, cb*/) {
        var str = "";
        var label = "OK";
        var cb = null;

        switch (arguments.length) {
            case 1:
                str = arguments[0];
                break;
            case 2:
                str = arguments[0];
                if (typeof arguments[1] == 'function') {
                    cb = arguments[1];
                } else {
                    label = arguments[1];
                }
                break;
            case 3:
                str = arguments[0];
                label = arguments[1];
                cb = arguments[2];
                break;
            default:
                throw new Error("Incorrect number of arguments: expected 1-3");
                break;
        }

        that.dialog(str, {
            "label": label,
            "callback": cb
        }, {
            "onEscape": cb
        });

    };

    that.confirm = function(/*str, labelCancel, labelOk, cb*/) {
        var str = "";
        var labelCancel = "Cancel";
        var labelOk = "OK";
        var cb = null;

        switch (arguments.length) {
            case 1:
                str = arguments[0];
                break;
            case 2:
                str = arguments[0];
                if (typeof arguments[1] == 'function') {
                    cb = arguments[1];
                } else {
                    labelCancel = arguments[1];
                }
                break;
            case 3:
                str = arguments[0];
                labelCancel = arguments[1];
                if (typeof arguments[2] == 'function') {
                    cb = arguments[2];
                } else {
                    labelOk = arguments[2];
                }
                break;
            case 4:
                str = arguments[0];
                labelCancel = arguments[1];
                labelOk = arguments[2];
                cb = arguments[3];
                break;
            default:
                throw new Error("Incorrect number of arguments: expected 1-4");
                break;
        }

        that.dialog(str, [{
            "label": labelCancel,
            "callback": function() {
                cb(false);
            }
        }, {
            "label": labelOk,
            "callback": function() {
                cb(true);
            }
        }]);
    }

    that.dialog = function(str, handlers, options) {
        var hideSource = null;
        var buttons = "";
        var callbacks = [];
        var options = options || {};

        // check for single object and convert to array if necessary
        if (typeof handlers.length == 'undefined') {
            handlers = [handlers];
        }

        var i = handlers.length;
        while (i--) {
            var label = null;
            var _class = null;
            var callback = null;

            if (typeof handlers[i].label == 'undefined' &&
                typeof handlers[i].class == 'undefined' &&
                typeof handlers[i].callback == 'undefined') {
                // if we've got nothing we expect, check for condensed format
                var propCount = 0;      // condensed will only match if this == 1
                var property = null;    // save the last property we found
                for (var j in handlers[i]) {
                    property = j;
                    propCount ++;
                }

                if (propCount == 1 && typeof handlers[i][j] == 'function') {
                    // matches condensed format of label -> function
                    handlers[i].label = property;
                    handlers[i].callback = handlers[i][j];
                }
            }

            if (typeof handlers[i].callback == 'function') {
                callback = handlers[i].callback;
            }

            if (handlers[i].class) {
                _class = handlers[i].class;
            } else if (i == handlers.length -1 && handlers.length <= 2) {
                _class = 'primary';
            } else if (i == 0 && handlers.length == 2) {
                _class = 'danger';
            }

            if (handlers[i].label) {
                label = handlers[i].label;
            } else {
                label = "Option "+(i+1);
            }

            buttons += "<a data-handler='"+i+"' class='btn "+_class+"' href='#'>"+label+"</a>";

            callbacks[i] = callback;
        }

        var div = $([
            "<div class='bootbox modal hide fade'>",
                "<div class='modal-body'>",
                    str,
                "</div>",
                "<div class='modal-footer'>",
                    buttons,
                "</div>",
            "</div>"
        ].join("\n"));

        div.bind('hidden', function() {
            div.remove();
        });

        div.bind('hide', function() {
            if (hideSource == 'escape' &&
                typeof options.onEscape == 'function') {
                options.onEscape();
            }
        });

        // hook into the modal's keyup trigger to check for the escape key
        $(document).bind('keyup.modal', function ( e ) {
            if (e.which == 27) {
                hideSource = 'escape';
            }
        });

        // well, *if* we have a primary - give the last dom element (first displayed) focus
        div.bind('shown', function() {
            $("a.primary:last", div).focus();
        });

        $("a", div).click(function(e) {
            e.preventDefault();
            hideSource = 'button';
            div.modal("hide");
            var handler = $(this).data("handler");
            var cb = callbacks[handler];
            if (typeof cb == 'function') {
                cb();
            }
        });

        if (options.keyboard == null) {
            options.keyboard = (typeof options.onEscape == 'function');
        }
        div.modal({
            "backdrop" : options.backdrop || "static",
            "show"     : options.show || true,
            "keyboard" : options.keyboard
        });

        $("body").append(div);
    }

    return that;
})();
