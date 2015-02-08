// create namespace
window.mf = window.mf || {};

(function($) {
	var dataKey = "mfAffix";
	
	// extend jquery
	$.fn.mfAffix = function(options) {
		return this.each(function () {
			var self = this;
			var $self = $(this);
			
			var affix = $self.data(dataKey);
			if (affix){
				if (typeof options == "string" && typeof affix[options] == "function")
					affix[options]();
			}
			else {
				affix = new mf.Affix(self, options);
				$self.data(dataKey, affix);
			}
		});
	};
	
	// mf affix class
	window.mf.Affix = function(obj, options) {
		var affix = this;
		this.obj = obj;
		this.options = $.extend({}, mf.Affix.defaults, options);
		
		this.$obj = $(obj);	
		this.$stop = this.$obj.closest(".mf-affix-stop");
		this.timer = null;
		
		// set start css
		this.$obj.css(this.options.css);
		
		// create functions
		this.updateWithTimer = function() {
			if (affix.timer)
				clearTimeout(affix.timer);
			affix.timer = setTimeout(function () {
				affix.update();
			}, affix.options.updateTimeout);
		};
		
		// set start position
		this.update();
		
		// bind to scroll event
		$(window).bind({
			scroll: this.updateWithTimer,
			resize: this.updateWithTimer
		});
	};
	
	window.mf.Affix.defaults = {
		marginTop: 20,
		updateTimeout: 150,
		css: {
			overflow: "auto",
			position: "relative",
			top: 0,
			transition: "top 0.5s"
		},
		animateFunc: function ($obj, top) {
			$obj.css({
				top: top
			});
		},
		makeNormal: function ($obj) {
			$obj.css({
				position: "static",
				top: "auto",
				transition: ""
			});		
		}
	};
	
	window.mf.Affix.prototype.destroy = function () {
		this.options.makeNormal(this.$obj);
		$(window).unbind({
			scroll: this.updateWithTimer,
			resize: this.updateWithTimer
		});
		this.$obj.removeData(dataKey);
	}
	
	window.mf.Affix.prototype.update = function () {
		// get affix top offset
		var windowTop = $(window).scrollTop();
		var topStart = this.$obj.offset().top - parseInt(this.$obj.css("top"));
		var topOffset = windowTop - topStart + this.options.marginTop;
		if (topOffset < 0) {
			topOffset = 0;
		}
		else if (this.$stop.length > 0) {
			var topOffsetMax = this.$stop.height() - this.$obj.outerHeight(true);
			if (topOffset > topOffsetMax)
				topOffset = topOffsetMax;
		}
									
		// move affix
		this.options.animateFunc(this.$obj, topOffset);
	}
})(jQuery);