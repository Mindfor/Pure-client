(function ($) {
	$(function () {
		//  disabled submit buttons on click and validate
		$("form").submit(function (e) {
			var form = this;
			var $form = $(form);
			if (!$form.valid || $form.valid()) {
				setTimeout(function () {
					$form.find("[type='submit']").prop("disabled", true);
				}, 500);
			}
		});
	});
})(jQuery);