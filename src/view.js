define(['jquery', 'streamhub-sdk/event-emitter'], function($, EventEmitter) {
    
    /**
     * Defines a base view object that listens to a set streams, adds objects to an 
     * internal collection when received from the streams, and then emits an 'add' event.
     * Subclasses are responsible for listening to the "add" events and using them to 
     * display streamed content.
     * @param opts {Object} A set of options to config the view with
     * @param opts.streams {Object.<string, Stream>} A dictionary of streams to listen to
     * @param opts.el {HTMLElement} The element in which to render the streamed content
     * @constructor
     */
    var View = function(opts) {
        EventEmitter.call(this);
        this.opts = opts || {};
        this.streams = opts.streams;
        this.el = opts.el;
        this.content = [];
        
        var keys = Object.keys(this.streams);
        for (i in keys) {
            var stream = this.streams[keys[i]];
            
            stream.on('readable', function() {
                var content = stream.read();
                this.emit('add', content, stream);
            });
        }
    };
    $.extend(View.prototype, EventEmitter.prototype);
    
    /**
     * Triggers the view's streams to start.
     * @param streamNames {[Array.<string>|string]?} A list of (or singular) stream names to call
     *     .start() on (Defaults to ["main"]). Also accepts "*" for all streams. 
     */
    View.prototype.startStreams = function(streamNames) {
        if (!streamNames) {
            streamNames = ["main"];
        } else if (typeof streamNames == "string") {
            if (streamNames == "*") {
                streamNames = Object.keys(this.streams); 
            } else {
                streamNames = [streamNames];
            }
        }
        
        for (i in streamNames) {
            if (this.streams[streamNames[i]]) {
	            this.streams[streamNames[i]].start();
            }
        }
    };

    /**
     * Triggers the view's reverse stream to start, if present.
     */
    View.prototype.streamOlder = function() {
        this.startStreams("reverse");
    };

    return View;
});