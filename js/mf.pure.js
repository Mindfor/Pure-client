﻿// create namespace
window.mf = window.mf || {};

/* --- jQuery extensions --- */
(function ($) {
	// configure defaults and look for "data" attributes
	$(function () {
		// block ui
		if ($.blockUI && $.blockUI.defaults) {
			$.blockUI.defaults.message = "Загрузка...";
		}

		// globalize - set culture
		var culture = $("html").attr("lang");
		if (culture === undefined)
			culture = "en";

		if (window.Globalize)
			Globalize.culture(culture);

		// enable fancy box
		if ($.fn.fancybox) {
			$("a.preview").fancybox({
				type: "image",
				openEffect: 'none',
				closeEffect: 'none',
				padding: 0,
				helpers: {
					overlay: {
						locked: false
					}
				}
			});
		}

		// data-confirm
		$("a[data-confirm]").click(function () {
			var message = $(this).data("confirm");
			if (message)
				return confirm(message);
		});

		// data-format
		if ($.fn.datetimepicker) {
			$("input[data-format]").each(function () {
				var $this = $(this);
				var format = $this.data("format");
				if (format == "datetime") {
					$this.datetimepicker({
						scrollInput: false,
						scrollMonth: false,
						format: "d.m.Y H:i",
						lang: culture
					});
				}
				else if (format == "date") {
					$this.datetimepicker({
						timepicker: false,
						scrollInput: false,
						scrollMonth: false,
						format: "d.m.Y",
						lang: culture
					});
				}
				else if (format == "time") {
					$this.datetimepicker({
						datepicker: false,
						scrollInput: false,
						format: "H:i",
						lang: culture
					});
				}
			});
		}

		// data-inputmask
		if ($.fn.inputmask) {
			$("input[data-mask]").each(function () {
				$(this).inputmask({
					mask: $(this).data("mask"),
					greedy: false
				});
			});
		}

		// table row href
		$("table tr[data-href]").click(function (e) {
			var tag = e.target.nodeName.toLowerCase();
			var stopTags = ["input", "select", "option", "a", "button"];
			var url = $(this).data("href");
			if ($.inArray(tag, stopTags) == -1) {
				if (!e.ctrlKey)
					window.location = url;
				else
					window.open(url, "_blank");
			}
		});

		// table row hover
		var hoverClass = "mf-hover";
		var tbodyClass = "mf-table-tbody";
		$("body")
			.on("mouseenter", "table tr", function () {
				var $tr = $(this);
				$tr.addClass(hoverClass);
				if ($tr.closest("table").hasClass(tbodyClass))
					$tr.closest("tbody").addClass(hoverClass);
			})
			.on("mouseleave", "table tr", function () {
				$(this).removeClass(hoverClass)
					.closest("tbody").removeClass(hoverClass);
			})
			.on("mouseenter", "table a, input, select, button", function () {
				$tr = $(this).closest("tr");
				if ($tr.hasClass(hoverClass)) {
					$tr.data(hoverClass, true).removeClass(hoverClass)
						.closest("tbody").removeClass(hoverClass);
				}
			})
			.on("mouseleave", "table a, input, select, button", function () {
				$tr = $(this).closest("tr");
				if ($tr.data(hoverClass)) {
					$tr.data(hoverClass, false).addClass(hoverClass);
					if ($tr.closest("table").hasClass(tbodyClass))
						$tr.closest("tbody").addClass(hoverClass);
				}
			});

		// gallery
		$('.mf-gallery a').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			mainClass: 'mf-popup-no-margins mfp-with-zoom',
			gallery: {
				enabled: true
			},
			image: {
				verticalFit: true
			},
			zoom: {
				enabled: true,
				duration: 300
			}
		});
	});

	// configure default magnifi
	$.popup = {
		opened: false,
		afterClose: null,

		open: function (options) {
			var options2 = $.extend(true, {}, $.popup.defaults, options);
			function openInternal() {
				$.magnificPopup.open(options2);
			};

			if (!$.popup.opened)
				openInternal();
			else {
				$.popup.afterClose = function () {
					openInternal();
					$.popup.afterClose = null;
				};
				$.magnificPopup.close();
			}
		},

		inline: function (content, options) {
			var $root = $("<section/>")
					.addClass("mf-popup")
					.append(content);
			options = $.extend(true, {}, options, {
				closeBtnInside: true,
				items: {
					src: $root,
					type: 'inline',
				}
			});
			$.popup.open(options);
		},

		close: function () {
			$.popup.afterClose = null;
			$.magnificPopup.close();
		},

		defaults: {
			mainClass: "mfp-fade",
			removalDelay: 200,
			modal: false,
			callbacks: {
				beforeOpen: function () {
					$.popup.opened = true;
				},

				afterClose: function () {
					$.popup.opened = false;
					if ($.popup.afterClose)
						$.popup.afterClose();
				}
			}
		}
	}

	// configure default loading
	$.loading = {
		show: function (message) {
			if (!message)
				message = $.loading.defaults.message;

			$.popup.open({
				items: {
					src: "<div class='mf-loading'><i class='fa-refresh fa-spin'></i> " + message + "</div>",
					type: "inline"
				},
				modal: true,
			});
		},

		hide: function () {
			$.popup.close();
		},

		defaults: {
			message: "Загрузка..."
		}
	};

	/* --- helper functions --- */
	Number.prototype.toHtmlLocale = function (precision) {
		this.toLocaleString(getHtmlLocale(), { maximumFractionDigits: precision });
	};

	Number.prototype.toMoney = function () {
		var str = this.toLocaleString(getHtmlLocale(), { maximumFractionDigits: 2 });
		var index = str.lastIndexOf(".");
		if (index == -1)
			index = str.lastIndexOf(",");

		var first = true;
		var result = "";
		if (index >= 0) {
			result = str.substr(index);
			str = str.substr(0, index);
		}

		while (str.length > 0) {
			var num = Math.min(str.length, 3);
			index = str.length - num;
			result = str.substr(index, num) + (first ? "" : " ") + result;
			str = str.substr(0, index);
		}

		return result;
	};

	function getHtmlLocale() {
		var htmls = document.getElementsByTagName("html");
		if (htmls.length > 0)
			return htmls[0].getAttribute("lang");
		return null;
	}
})(jQuery);

mf.parseFloat = function (value) {
	if (typeof value == "string")
		value = value.replace(/\s/g, "").replace(/,/g, ".");
	return parseFloat(value);
}

mf.guid = (function () {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
				   .toString(16)
				   .substring(1);
	}
	return function () {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			   s4() + '-' + s4() + s4() + s4();
	};
})();

mf.parseBool = function (value) {
	if (value && typeof value == "string") {
		switch (value.toLowerCase()) {
			case "true": case "yes": case "1": return true;
			case "false": case "no": case "0": case null: return false;
			default: return Boolean(value);
		}
	}
	return false;
}