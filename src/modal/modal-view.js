define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/modal/views/gallery-attachment-list-view',
    'hgn!streamhub-sdk/modal/templates/modal-view',
    'streamhub-sdk/util'
], function($, View, GalleryAttachmentListView, ModalTemplate, util) {

    /**
     * A view that overlays over the entire viewport to display some content
     *
     * @param opts {Object} A set of options to config the view with
     * @param opts.createContentView {Function} A function to create a content view to be displayed within the modal view
     * @fires GalleryAttachmentListView#hideModal.hub
     * @exports streamhub-modal/modal-view
     * @constructor
     */
    var ModalView = function (opts) {
        var self = this;
        opts = opts || {};
        this.visible = false;
        this._attached = false;
        this._rendered = false;

        if (opts.createContentView) {
            this._createContentView = opts.createContentView;
        }

        this.modalContentView = this._createContentView();

        View.call(this);

        $(window).keyup(function(e) {
            // Escape
            if (e.keyCode == 27 && self.visible) {
                self.hide();
            }
        });

        $(window).on('mousewheel', function(e) {
            if (self.visible) {
                e.preventDefault();
            }
        });

        ModalView.instances.push(this);
    };
    util.inherits(ModalView, View);


    // Store all instances of modal to ensure that only one is visible
    ModalView.instances = [];


    // A singleton container element houses all modals
    ModalView.$el = $('<div class="hub-modals"></div>')
    ModalView.el = ModalView.$el[0];

    // insert it on domReady
    ModalView.insertEl = function () {
        $('body').append(ModalView.el);
    }
    $(document).ready(ModalView.insertEl);


    ModalView.prototype.template = ModalTemplate;
    ModalView.prototype.elClass = ' hub-modal';


    ModalView.prototype.modalElSelector = '.hub-modal';
    ModalView.prototype.closeButtonSelector = '.hub-modal-close';
    ModalView.prototype.containerElSelector = '.hub-modal-content';


    /**
     * Makes the modal and its content visible
     * @param content {Content} The content to be displayed in the content view by the modal
     * @param opts {Object} The content to be displayed in the content view by the modal
     * @param opts.attachment {Oembed} The attachment to be focused in the content view
     */
    ModalView.prototype.show = function(content, options) {
        if (content) {
            this._setFocus(content, options);
        }

        if ( ! this._rendered) {
            this.render();
        }

        // First hide any other modals
        $.each(ModalView.instances, function (i, modal) {
            modal.hide();
        });

        if ( ! this._attached) {
            this._attach();
        }

        this.$el.show();

        this.visible = true;
    };


    /**
     * Makes the modal and its content not visible
     */
    ModalView.prototype.hide = function() {
        this.$el.hide();
        this._detach();
        this.visible = false;
    };


    /**
     * Creates DOM structure of gallery to be displayed
     */
    ModalView.prototype.render = function () {
        View.prototype.render.call(this);

        this.modalContentView.setElement(this.$el.find(this.containerElSelector));
        this.modalContentView.render(); 

        this._rendered = true;
    };


    /**
     * @private
     * Set the element for the view to render in.
     * ModalView construction takes care of creating its own element in
     *     ModalView.el. You probably don't want to call this manually
     * @param element {HTMLElement} The element to render this View in
     * @returns this
     */
    ModalView.prototype.setElement = function (element) {
        View.prototype.setElement.call(this, element);
        var self = this;

        this.$el.addClass(this.elClass);

        this.$el.on('hideModal.hub', function (e) {
            self.hide();
        });

        this.$el.on('click', this.closeButtonSelector, function (e) {
            self.hide();
        });

        return this;
    };


    /**
     * @private
     * Sets the content object and optional attachment to be displayed in the content view 
     * @param content {Content} The content to be displayed in the content view by the modal
     * @param opts {Object} The content to be displayed in the content view by the modal
     * @param opts.attachment {Oembed} The attachment to be focused in the content view
     */
    ModalView.prototype._setFocus = function (content, opts) {
        opts = opts || {};
        this.modalContentView.setContent(content, opts);
    };


    /**
     * Creates a the content view to display within the modal view
     * @param content {Content} The content to be displayed in the content view by the modal
     * @param opts {Object} The content to be displayed in the content view by the modal
     * @param opts.attachment {Oembed} The attachment to be focused in the content view
     * @private
     */
    ModalView.prototype._createContentView = function (content, opts) {
        opts = opts || {};
        var modalContentView = new GalleryAttachmentListView({
            content: content,
            attachmentToFocus: opts.attachment
        });
        return modalContentView;
    };


    /**
     * @private
     * Attach .el to the DOM
     */
    ModalView.prototype._attach = function () {
        this.$el.appendTo(ModalView.$el);
        this._attached = true;
    }


    /**
     * @private
     * Detach .el from the DOM
     * This may be useful when the modal is hidden, so that
     *     the browser doesn't have to lay it out, and it doesn't
     *     somehow intercept DOM events
     */
    ModalView.prototype._detach = function () {
        this.$el.detach();
        this._attached = false;
    }


    return ModalView;
});