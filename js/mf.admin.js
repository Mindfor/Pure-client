// create namespace
window.mf = window.mf || {};

(function ($) {

	// on ready
	$(function () {
		// enable admin history dropdown
		var $history = $("#AdminHistory");
		var $historyBtn = $("#AdminHistoryBtn");
		var historyOver = false;
		var historyAnimating = false;
		
		$historyBtn.hover(
			function () {
				historyOver = true;
				showHistory();
			},
			function () {
				historyOver = false;
			});
		$history.hover(
			function () {
				historyOver = true;
			},
			function () {
				historyOver = false;
				hideHistory();
			});

		function showHistory() {
			if (historyAnimating || !historyOver)
				return;

			historyAnimating = true;
			$history.css({
				display: "inline-block",
				marginLeft: -$history.outerWidth(),
				opacity: 0,
			});

			$historyBtn.hide("normal");
			$history.animate(
				{
					marginLeft: 0,
					opacity: 1
				},
				function () {
					historyAnimating = false;
					if (!historyOver)
						hideHistory();
				});
		}

		function hideHistory() {
			if (historyAnimating || historyOver)
				return;

			historyAnimating = true;
			$historyBtn.show("normal");
			$history.animate(
				{
					marginLeft: -$history.outerWidth(),
					opacity: 0
				},
				function () {
					$history.css({ display: "none" });
					historyAnimating = false;
					if (historyOver)
						showHistory();
				});
		}

		// enabled admin panel
		$(".mf-form > .pure-controls:last-child").each(function () {
			var panel = new mf.AdminPanel(this);
			$(this).data("admin-panel", panel);
		});

		// focus to the first field on load
		var $formMain = $("form.mf-form-focus:eq(0)");
		if (!$formMain.length)
			$formMain = $("form:eq(0)");
		var $formMainInput = $formMain.find("input[type!=hidden]").eq(0);
		$formMainInput.focus();
	});

	// mf admin panel
	window.mf.AdminPanel = function (obj) {
		this.obj = obj;
		this.$obj = $(obj);
		this.updateProxy = $.proxy(this.update, this);
		this.options = {
			zIndex: 1000,
			marginVertical: 16 * 0.5, // 0.5em
		};

		var $form = this.$obj.closest(".mf-form");

		// create panel
		this.$panel = $("<div/>")
			.appendTo("body")
			.addClass("mf-controls-panel")
			.css({
				display: "none",
				position: "fixed",
				width: "100%",
				left: 0,
				bottom: 0,
				zIndex: this.options.zIndex
			});
		this.$placeholder = $("<div/>")
			.appendTo($form)
			.addClass("mf-controls-placeholder")
			.css({
				display: "none",
				marginLeft: this.$obj.css("margin-left")
			});

		// set start position
		this.pinned = false;
		this.update();

		// bind to scroll event
		$(window).bind({
			scroll: $.proxy(function () {
				this.update(false)
			}, this),
			resize: $.proxy(function () {
				this.update(true)
			}, this),
		});
	};

	window.mf.AdminPanel.prototype.update = function (forceResize) {
		// calculate
		var $window = $(window);
		var windowBottom = $window.scrollTop() + $window.height();
		var bottom = this.options.marginVertical + 1;
		if (!this.pinned)
			bottom += this.$obj.offset().top + this.$obj.outerHeight();
		else
			bottom += this.$placeholder.offset().top + this.$placeholder.outerHeight();
		
		// pin or unpin
		var changed = false;
		if (!this.pinned && windowBottom < bottom) {
			this.pin();
			changed = true;
		}
		else if (this.pinned && windowBottom >= bottom) {
			this.unpin();
			changed = true;
		}

		// update size
		if (changed || forceResize)
			this.resize();
	}

	window.mf.AdminPanel.prototype.resize = function () {
		if (!this.pinned)
			return;
		
		var height = this.$obj.outerHeight();
		this.$placeholder.height(this.$obj.outerHeight(true));
		this.$panel.height(height + this.options.marginVertical * 2 + 1);
		this.$obj.css({
			width: this.$placeholder.width(),
			marginLeft: this.$placeholder.outerWidth(true) - this.$placeholder.outerWidth()
		});
	}

	window.mf.AdminPanel.prototype.pin = function () {
		this.$placeholder.show();
		this.$panel.show();
		this.$obj.css({
			position: "fixed",
			bottom: this.options.marginVertical,
			zIndex: this.options.zIndex + 1
		});
		this.pinned = true;
	}

	window.mf.AdminPanel.prototype.unpin = function () {
		this.$placeholder.hide();
		this.$panel.hide();
		this.$obj.css({
			position: "",
			width: "",
			marginLeft: "",
			zIndex: "",
			bottom: ""
		});
		this.pinned = false;
	}

})(jQuery);