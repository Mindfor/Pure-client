/*
	Mindfor HTML5 file upload library.
	Provides async file uploading using multy-select file field and drag-and-drop.
*/

// extend support
jQuery.support.html5FileUpload = $("<input type='file'>").get(0).files !== undefined;

// file upload manager class
function FileUpload(obj, options) {
	this.obj = obj;
	this.$obj = jQuery(obj);
	this.xhr = new XMLHttpRequest();
	this.queue = [];
	this.uploading = false;
	this.uploadingIndex = null;
	this.uploadingFile = null;
	this.continueAfterAbort = true;

	// set context for options
	this.options = jQuery.extend({}, FileUpload.defaults, options);
	for (var item in this.options) {
		if (typeof (this.options[item]) == "function")
			this.options[item] = $.proxy(this.options[item], this);
	}

	// bind file upload events
	var manager = this;
	this.$obj.bind({
		"fileUpload.start": function() {
			return manager.sendFromInput();
		},
		"fileUpload.cancelOne": function(evt, fileIndex) {
			return manager.cancelOne(fileIndex);
		},
		"fileUpload.cancelAll": function() {
			manager.cancelAll();
		}
	});

	// bind file input
	if (this.$obj.is("input:file")) {
		this.$obj.change(function() {
			if (manager.options.autoStart)
				manager.sendFromInput();
		});
	}
	// bind drop container
	else {
		var dropCollection = $();
		var dropBox = this.$obj;

		dropBox.dragPlaceholder().bind({
			drop: function(e) {
				var files = e.originalEvent.dataTransfer.files;
				manager.send(files);
				$(this).fadeOut("fast");
				dropCollection = $();
				return false;
			}
		});

		$(window).bind({
			dragenter: function (e) {
				if (dropCollection.size() == 0)
					dropBox.dragPlaceholder().dragPlaceholderUpdatePosition().fadeIn("fast");
				dropCollection = dropCollection.add(e.target);
				return false;
			},
			dragleave: function(e) {
				setTimeout(function () {
					dropCollection = dropCollection.not(e.target);
					if (dropCollection.size() == 0)
						dropBox.dragPlaceholder().fadeOut("fast");
				}, 1);
				return false;
			},
			drop: function(e) {
				dropBox.dragPlaceholder().fadeOut("fast");
				dropCollection = $();
				return false;
			},
			dragover: function(e) {
				return false;
			}
		});
	}
}

FileUpload.prototype.remove = function() {
	this.$obj.unbind("fileUpload");
	this.$obj.unbind("change");
}

FileUpload.globalIndex = 0;
FileUpload.defaults = {
	start: function(files) {
		return true;
	},
	finish: function() {
	},
	startPrepare: function(index, file) {
	},
	startOne: function(index, file) {
		return true;
	},
	progress: function(index, file, progress) {
	},
	finishOne: function(index, file, response) {
	},
	cancel: function(index, file) {
	},
	error: function(index, file, error) {
	},
	incompatible: function() {
		alert("Sorry, but your browser is incompatible with uploading files using HTML5 (at least, with current preferences.\n Please install the latest version of Firefox, Safari or Chrome");
	},

	url: null,
	autoStart: true,
	autoClear: true,
	stopOnFirstError: false,
	method: 'post',
	
	headers: {
		"Cache-Control": "no-cache",
		"X-Requested-With": "XMLHttpRequest",
		"X-File-Name": function(index, file) { return encodeURI(file.name) },
		"X-File-Size": function(index, file) { return file.size },
		"X-File-Type": function(index, file) { return file.type },
		"Content-Type": function(index, file) { return file.type },
		"X-CSRF-Token": function(index, file) {
			var token = $('meta[name="csrf-token"]').prop("content");
			if (!token)
				return false;
			return token;
		}
	},

	// file upload default html functions
	$container: null,
	containerStartPrepare: function(index, file) {
		if (this.options.$container) {
			var manager = this;
			var item = $("<li></li>")
				.data("fileIndex", index)
				.appendTo(this.options.$container);
			var content = $("<div class='content'></div>")
				.append("<div class='name'>" + file.name + "</div>")
				.append("<div class='progress'><div class='progress-bar'><div class='progress-bar-value'></div></div> <div class='progress-value'>0%</div></div>")
				.append("<div class='cancel'><a href='#'>Cancel</a></div>")
				.append("<div class='status'></div>")
				.appendTo(item);
			item.find(".cancel a").click(function() {
				manager.cancelOne(index);
				return false;
			});
		}
	},

	containerProgress: function(index, file, progress) {
		if (this.options.$container) {
			var val = Math.floor(progress * 100);
			var item = this.options.$container.find("li:data(fileIndex=" + index + ")")
				.find(".progress-bar-value").css("width", val).end()
				.find(".progress-value").text(val + "%").end();
			if (val == 100)
				item.find(".cancel").hide();
		}
	},

	containerFinishOne: function(index, file, data) {
		if (this.options.$container) {
			var item = this.options.$container.find("li:data(fileIndex=" + index + ")");
			item.replaceWith(data);
		}
	},

	containerError: function(index, file, er) {
		if (this.options.$container) {
			this.options.$container.find("li:data(fileIndex=" + index + ")")
				.find(".progress").hide().end()
				.find(".cancel").hide().end()
				.find(".status").text(er).show();
		}
	},

	containerCancel: function(index, file) {
		if (this.options.$container) {
			this.options.$container.find("li:data(fileIndex=" + index + ")")
				.find(".progress").hide().end()
				.find(".cancel").hide().end()
				.find(".status").text("Canceled").show();
		}
	}
};

FileUpload.prototype.sendFromInput = function() {
	if (this.$obj.is("input:file") && this.obj.files) {
		var res = this.send(this.obj.files);
		if (res && this.options.autoClear) {
			this.$obj = this.$obj.fileUploadClear();
			this.obj = this.$obj[0];
		}
		return res;
	}
	return false;
};

FileUpload.prototype.send = function(files) {
	// check if start is required
	if (!this.options.start(files))
		return false;

	// get index
	var firstIndex = FileUpload.globalIndex;
	FileUpload.globalIndex += files.length;

	// add to queue
	for (var i = 0; i < files.length; i++) {
		this.queue.push({ file: files[i], index: (firstIndex + i) });
	}

	// call prepare
	if (this.options.startPrepare) {
		for (var i = 0; i < files.length; i++) {
			var index = firstIndex + i;
			this.options.containerStartPrepare(index, files[i]);
			this.options.startPrepare(index, files[i]);
		}
	}

	// start upload
	return this.startQueue();
};

FileUpload.prototype.startQueue = function() {
	// check if already uploading
	if (!jQuery.support.html5FileUpload) {
		this.options.incompatible();
		return false;
	}
	if (this.uploading)
		return true;
	if (this.queue.length == 0)
		return false;

	// start file uploading
	this.uploading = true;
	this.continueAfterAbort = true;
	this.uploadNext();
	return true;
};

FileUpload.prototype.uploadNext = function() {
	var manager = this;
	var options = this.options;

	// if finished uploading => enable file field
	if (manager.queue.length == 0) {
		manager.uploading = false;
		manager.uploadingIndex = null;
		manager.uploadingFile = null;
		options.finish();
		return;
	}

	// get file
	var fileObj = manager.queue.shift();
	var file = fileObj.file;
	var fileIndex = fileObj.index;
	manager.uploadingIndex = fileIndex;
	manager.uploadingFile = file;

	// call start event
	if (!options.startOne(fileIndex, file)) {
		manager.uploadNext();
		return;
	}

	// hook events
	var xhr = manager.xhr;
	xhr.upload['onprogress'] = function(data) {
		var progress = data.loaded / data.total;
		options.containerProgress(fileIndex, file, progress);
		options.progress(fileIndex, file, progress);
	};
	xhr.onload = function(data) {
		manager.uploadingIndex = null;
		if (xhr.status != 200 && xhr.status != 201 && xhr.status != 204) {
			var msg = xhr.status;
			if (xhr.statusText)
				msg += ": " + xhr.statusText;
			options.containerError(fileIndex, file, msg);
			options.error(fileIndex, file, msg);
			if (!options.stopOnFirstError)
				manager.uploadNext();
		}
		else {
			options.containerFinishOne(fileIndex, file, xhr.responseText);
			options.finishOne(fileIndex, file, xhr.responseText);
			manager.uploadNext();
		}
	};
	xhr.onabort = function() {
		manager.uploadingIndex = null;
		manager.uploadingFile = null;
		if (!manager.continueAfterAbort)
			manager.uploading = false;
		options.containerCancel(fileIndex, file);
		options.cancel(fileIndex, file);
		if (manager.continueAfterAbort)
			manager.uploadNext();
	};
	xhr.onerror = function(error) {
		manager.uploadingIndex = null;
		manager.uploadingFile = null;
		if (options.stopOnFirstError)
			manager.uploading = false;
		options.containerError(fileIndx, file, error);
		options.error(fileIndex, file, error);
		if (!options.stopOnFirstError)
			manager.uploadNext();
	};

	// open connection
	var url = typeof (options.url) == "function" ? options.url(fileIndex, file) : options.url;
	xhr.open(options.method, url, true);
	jQuery.each(options.headers, function(key, val) {
		val = typeof (val) == "function" ? val(fileIndex, file) : val; // resolve value
		if (val === false) return true; // if resolved value is boolean false, do not send this header
		xhr.setRequestHeader(key, val);
	});

	// send file
	xhr.send(file);
};

FileUpload.prototype.cancelOne = function(fileIndex) {
	if (this.uploadingIndex == fileIndex) {
		this.xhr.abort();
		return true;
	}
	else {
		for (var i = 0; i < this.queue.length; i++) {
			var file = this.queue[i];
			if (file.index == fileIndex) {
				this.queue.splice(i, 1);
				this.options.cancel(file.index, file.file);
				return true;
			}
		}
	}
	return false;
};

FileUpload.prototype.cancelAll = function() {
	this.continueAfterAbort = false;
	this.xhr.abort();

	var old = this.queue;
	this.queue = [];
	for (var i = 0; i < old.length; i++) {
		var file = old[i];
		this.options.cancel(file.index, file.file);
	}
};

(function($) {
	// add jquery element function
	$.fn.fileUpload = function(options) {
		return this.each(function() {
			var self = this;
			var $self = $(this);
			
			var key = "fileUpload";
			var manager = $self.data(key);
			if (manager)
				manager.remove();
			manager = new FileUpload(self, options);
			$self.data(key, manager);
		});
	};

	// clears file upload
	$.fn.fileUploadClear = function() {
		var inputs = $();
		this.filter("input:file").each(function() {
			var $this = $(this);
			var copy = $this.clone(true);
			$this.replaceWith(copy);
			inputs = inputs.add(copy);
		});
		return inputs;
	};

	// drag placeholder
	$.dragPlaceholder = {
		options: {
			cls: "drag-placeholder",
			dataPlaceholderKey: "drag-placeholder",
			dataOverKey: "drag-overelement",
			text: "Drop files here to upload"
		}
	};
	
	$.fn.dragPlaceholder = function() {
		var placeholders = $();
		var options = $.dragPlaceholder.options;
		this.each(function () {
			// get placeholder
			var $self = $(this);
			var placeholder = $self.data(options.dataPlaceholderKey);
			
			// create placeholder
			if (!placeholder || placeholder.length == 0) {
				placeholder = $("<div></div>")
					.addClass(options.cls)
					.css("display", "none")
					.text(options.text)
					.data(options.dataOverKey, $self)
					.appendTo($("body"));
				$self.data(options.dataPlaceholderKey, placeholder);
				placeholder.dragPlaceholderUpdatePosition();
			}

			// add to collection
			placeholders = placeholders.add(placeholder);
		});
		return placeholders;
	};

	$.fn.dragPlaceholderUpdatePosition = function() {
		return this.each(function() {
			var placeholder = $(this);
			var overElement = placeholder.data($.dragPlaceholder.options.dataOverKey);
			var offset = overElement.offset();
			var width = overElement.outerWidth();
			var height = overElement.outerHeight();
			placeholder
				.css("position", "absolute")
				.css("top", offset.top)
				.css("left", offset.left)
				.css("line-height", height + "px")
				.css("height", height)
				.css("width", width);
		});
	};
})(jQuery);