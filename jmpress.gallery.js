$.jmpress("initStep", function(step, eventData) {
	eventData.stepData.up = eventData.data.up;
	eventData.stepData.down = eventData.data.down;
});
$.jmpress("register", "up", function() {
	var stepData = $(this).jmpress("active").data("stepData");
	if(stepData.up)
		$(this).jmpress("select", stepData.up);
});
$.jmpress("register", "down", function() {
	var stepData = $(this).jmpress("active").data("stepData");
	if(stepData.down)
		$(this).jmpress("select", stepData.down);
});
$.fn.jmpressGallery = function(options) {
	options = options || {};
	options.stepClass = options.stepClass || "jmpress-gallery-item";
	options.cameraClass = options.cameraClass || "jmpress-gallery-camera";
	options.idPrefix = options.idPrefix || "jmpress-gallery-id-" + Math.floor(Math.random() * 100000) + "-";
	options.thumbSize = options.thumbSize || "100%";
	options.fullSize = options.fullSize || "100%";
	options.rows = options.rows || 3;
	var fallback = !$.jmpress("pfx", "perspective")
	// if(fallback)
		// options.rows = 1; // Fallback
	options.stepHeight = options.stepHeight || 2000;
	options.stepWidth = options.stepWidth || 2500;
	options.jmpress = $.extend(true, {
		stepSelector: "." + options.stepClass,
		viewPort: {
			height: options.stepHeight,
			width: options.stepWidth
		},
		keyboard: {
			keys: {
				38: "up",
				40: "down"
			}
		},
		hash: { use: false }
	}, options.jmpress || {});
	var rows = options.rows;
	var cols = Math.floor((options.items.length + options.rows - 1) / options.rows);
	options.distanceX = options.distanceX || (options.stepWidth * cols / Math.PI / 2 * 1.25);
	options.distanceY = options.distanceY || (options.stepHeight * 1.25);
	var colFactor = 2 * Math.PI / cols;
	var centerRow = (rows-1)/2;
	this.each(function(idx) {
		var el = $(this);
		el.addClass("jmpress-gallery");
		for(var i = 0; i < cols; i++) {
			var step = $("<div>").addClass(options.stepClass).addClass(options.cameraClass);
			step.attr("data-x", "" + (Math.sin(colFactor * i) * (options.distanceX + (fallback?centerRow*options.distanceY*1.25:0))));
			step.attr("data-y", "" + (Math.cos(colFactor * i) * (options.distanceX + (fallback?centerRow*options.distanceY*1.25:0))));
			step.attr("data-z", "" + (centerRow * options.distanceY));
			step.attr("data-rotate-x", "" + 90);
			step.attr("data-rotate-y", "" + (-i * 360 / cols));
			step.attr("data-view-port-height", Math.floor(options.distanceY * rows));
			step.attr("data-view-port-width", Math.floor(options.distanceX * rows));
			step.attr("data-prev", "#" + options.idPrefix + "camera-" + (i-1+cols)%cols);
			step.attr("data-next", "#" + options.idPrefix + "camera-" + (i+1)%cols);
			step.attr("data-up", "#" + options.idPrefix + "item-" + (rows-1) + "-" + i);
			step.attr("data-down", "#" + options.idPrefix + "item-" + 0 + "-" + i);
			step.attr("id", options.idPrefix + "camera-" + i);
			el.append(step);
		}
		for(var i = 0, l = options.items.length; i < l; i++) {
			var row = Math.floor(i / cols);
			var col = i % cols;
			var item = options.items[i];
			var step = item.create(options).addClass(options.stepClass);
			step.attr("data-x", "" + (Math.sin(colFactor * col) * (options.distanceX + (fallback?row*options.distanceY*1.25:0))));
			step.attr("data-y", "" + (Math.cos(colFactor * col) * (options.distanceX + (fallback?row*options.distanceY*1.25:0))));
			step.attr("data-z", "" + (row * options.distanceY));
			step.attr("data-rotate-x", "" + 90);
			step.attr("data-rotate-y", "" + (-col * 360 / cols));
			step.attr("data-prev", "#" + options.idPrefix + "item-" + row + "-" + (col-1+cols)%cols);
			step.attr("data-next", "#" + options.idPrefix + "item-" + row + "-" + (col+1)%cols);
			if(row == 0)
				step.attr("data-up", "#" + options.idPrefix + "camera-" + col);
			else
				step.attr("data-up", "#" + options.idPrefix + "item-" + (row-1) + "-" + col);
			if(row == rows-1)
				step.attr("data-down", "#" + options.idPrefix + "camera-" + col);
			else
				step.attr("data-down", "#" + options.idPrefix + "item-" + (row+1) + "-" + col);
			step.attr("id", options.idPrefix + "item-" + row + "-" + col);
			el.append(step);
		}
		el.jmpress(options.jmpress);
		el.jmpress("idle", function(step) {
			$(step).triggerHandler("idleStep");
		});
	});
}

function JmpressGalleryImage(fullUrl, thumbUrl, options) {
	if(typeof fullUrl == "object") {
		options = fullUrl;
	} else if(typeof thumbUrl == "object") {
		options = thumbUrl;
		options.fullUrl = fullUrl;
	} else {
		options = options || {};
		options.fullUrl = fullUrl;
		options.thumbUrl = thumbUrl;
	}
	this.options = options
}
JmpressGalleryImage.prototype.create = function(opts) {
	var options = this.options;
	var el = $("<div>");
	var elThumb = $("<div>").addClass("jmpress-gallery-image");
	elThumb.css({
		position: "absolute",
		backgroundImage: "url(" + options.thumbUrl + ")",
		backgroundRepeat: "no-repeat",
		backgroundSize: opts.thumbSize, 
		backgroundPosition: "50% 50%"
	});
	el.on("idleStep", function() {
		if(el.children().length == 1) {
			var image = new Image();
			image.src = options.fullUrl;
			image.onload = function() {
				var elFull = $("<div>").addClass("jmpress-gallery-image");
				elFull.css({
					position: "absolute",
					backgroundImage: "url(" + options.fullUrl + ")",
					backgroundRepeat: "no-repeat",
					backgroundSize: opts.fullSize, 
					backgroundPosition: "50% 50%"
				});
				el.prepend(elFull);
				elThumb.fadeOut("slow");
			}
		}
	});
	el.on("leaveStep", function() {
		if(el.children().length > 1) {
			el.children().first().remove();
			elThumb.fadeIn(0);
		}
	});
	el.append(elThumb);
	return el;
}

function JmpressGalleryHtml(fullHtml, thumbHtml, options) {
	if(typeof fullHtml == "object") {
		options = fullHtml;
	} else if(typeof thumbHtml == "object") {
		options = thumbHtml;
		options.fullHtml = fullHtml;
	} else {
		options = options || {};
		options.fullHtml = fullHtml;
		options.thumbHtml = thumbHtml;
	}
	this.options = options
}
JmpressGalleryHtml.prototype.create = function(opts) {
	var options = this.options;
	var el = $("<div>");
	var elThumb = $("<div>").addClass("jmpress-gallery-html");
	elThumb.html(options.thumbHtml);
	el.on("idleStep", function() {
		if(el.children().length == 1) {
			var elFull = $("<div>").addClass("jmpress-gallery-html");
			elFull.html(options.fullHtml);
			el.prepend(elFull);
			elThumb.hide();
		}
	});
	el.on("leaveStep", function() {
		if(el.children().length > 1) {
			el.children().first().remove();
			elThumb.show();
		}
	});
	el.append(elThumb);
	return el;
}

$.jmpressGallery = $.jmpressGallery || {};
$.jmpressGallery.Image = JmpressGalleryImage;
$.jmpressGallery.Html = JmpressGalleryHtml;