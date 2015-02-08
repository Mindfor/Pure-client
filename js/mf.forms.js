(function ($) {
	$(function () {
		//  disabled submit buttons on click and validate
		$("form").submit(function () {
			var $form = $(this);
			if (!$form.valid || $form.valid())
				$form.find("[type='submit']").prop("disabled", true);
		});
	})
})(jQuery);