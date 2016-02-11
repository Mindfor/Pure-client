// create namespace
window.mf = window.mf || {};

/* --- jQuery extensions --- */
(function ($) {
	// configure defaults and look for "data" attributes
	$(function () {
		// block ui
		if ($.blockUI && $.blockUI.defaults)
			$.blockUI.defaults.message = "Загрузка...";

		// set timezone
		var tzMinutes = new Date().getTimezoneOffset();
		document.cookie = "TimeZone=" + (-tzMinutes / 60);

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
				var $dataformatInput = $(this);
                $dataformatInput.attr("type", "text"); //for preventing users set "type=datetime"
				var format = $dataformatInput.data("format");
				var options = {
					onShow: function () {
						var picker = $(this);
						setTimeout(function () {
							picker.addClass('active');
						}, 15); //for smooth animation
					},
					onClose: function () {
						var picker = this;
						picker.removeClass('active');
						var transitionDuration = parseFloat(getComputedStyle(picker[0]).transitionDuration) * 1000; //transform like 0.2s to 200
						setTimeout(picker.hide.bind(picker), transitionDuration + 15);
						return false;
					},
					lang: mf.culture
				}
				switch (format) {
					case "datetime":
						var datetimeOptions = {
							scrollInput: false,
							scrollMonth: false,
							format: "d.m.Y H:i",
							className: "datetime"
						}
						$.extend(datetimeOptions, options);
						$dataformatInput.datetimepicker(datetimeOptions);
						break;
					case "date":
						var dateOptions = {
							timepicker: false,
							scrollInput: false,
							scrollMonth: false,
							format: "d.m.Y",
							className: "date"
						};
						$.extend(dateOptions, options);
						$dataformatInput.datetimepicker(dateOptions);
						break;
					case "time":
						var timeOptions = {
							datepicker: false,
							scrollInput: false,
							format: "H:i",
							className: "time"
						};
						$.extend(timeOptions, options);
						$dataformatInput.datetimepicker(timeOptions);
						break;
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
		this.toLocaleString(getHtmlLocale(), {
			maximumFractionDigits: precision
		});
	};

	Number.prototype.toMoney = function () {
		return this.toLocaleString(getHtmlLocale(), {
			maximumFractionDigits: 2
		});
	};

	function getHtmlLocale() {
		var htmls = document.getElementsByTagName("html");
		if (htmls.length > 0)
			return htmls[0].getAttribute("lang");
		return null;
	};

	$.fn.setActive = function () {
		this.siblings().removeClass("active");
		this.addClass("active");
	}

	/*
     * The method filters jquery objects by some name of data property in params prop,
     * if val params is present then filtration happens by value of the data property
     */
	$.fn.filterByData = function (prop, val) {
		return this.filter(function () {
			var valOfData = $(this).data(prop);
			if (val)
				return valOfData == val;
			if (valOfData)
				return true;
			return false;
		});
	}


	//TODO Check bug fix of Select2. What lies below is a hook of problem with wrong positioning of select2 dropdown 
	var baseSelect2 = $.fn.select2;
	$.fn.select2 = function (options) {
        var select2 = baseSelect2.call(this, options);
		$(document).trigger("select2:attach", this);
		return select2;
	};

	$(document).on("select2:attach", attachPositionCorrection);

	var $selectors = $(document.querySelectorAll("select"));
	$selectors.each(attachPositionCorrection)

	function attachPositionCorrection(e, element) {
		var selector = element || this;
		if (selector.isAttachedPositionCorrection)
			return;

		var $selector = $(selector);
		var select2manager = $selector.data("select2");
		if (!select2manager)
			return;

		selector.isAttachedPositionCorrection = true;
		$selector.on("select2:open", positionManagerSelectorDropdown);
		select2manager.on("results:all", positionManagerSelectorDropdown);
		$(window).resize(positionManagerSelectorDropdown);
		$(window).scroll(positionManagerSelectorDropdown);

		function positionManagerSelectorDropdown() {
			var rect = select2manager.$container[0].getBoundingClientRect();
			requestAnimationFrame(function () {
				select2manager.$dropdown.css("left", rect.left + "px");
				select2manager.$dropdown.css("top", rect.bottom + window.scrollY + "px");
			});
		}
	}
})(jQuery);