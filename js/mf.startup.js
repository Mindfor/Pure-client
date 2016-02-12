window.mf = window.mf || {};

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
};

$(function () {
    //current culture
    mf.culture = $("html").attr("lang");
    if (mf.culture === undefined)
        mf.culture = "en";

    $.extend(true, $.magnificPopup.defaults, {
        closeMarkup: "<button title='%title%' class='mfp-close'><i class='mfp-close-icn'>&times;</i></button>",
        tClose: 'Закрыть (Esc)', // Alt text on close button
        tLoading: 'Загрузка...', // Text that is displayed during loading. Can contain %curr% and %total% keys
        gallery: {
            arrowMarkup: "<button title='%title%' type='button' class='mfp-arrow mfp-arrow-%dir%'></button>", // markup of an arrow button
            tPrev: "Предыдущее изображение (Клавиша стрелка влево)", // title for left button
            tNext: "Следующее изображение (Клавиша стрелка вправо)", // title for right button
            tCounter: "<span class='mfp-counter'>%curr% из %total%</span>" // markup of counter
        },
        image: {
            tError: '<a href="%url%">Изображение</a> не удалось загрузить.' // Error message when image could not be loaded
        },
        ajax: {
            tError: '<a href="%url%">Содержимое</a> не удалось загрузить.' // Error message when ajax request failed
        }
    });

    mf.imageViewMagnificOptions = {
        type: "image",
        closeOnContentClick: true,
        closeBtnInside: false,
        mainClass: "mfp-with-zoom mfp-img-mobile",
        image: {
            horizontalFit: true
        },
        zoom: {
            enabled: true,
            duration: 200, //also don't foget to change the duration in CSS
            opener: function (element) {
                return element.find("img");
            }
        }
    }

    mf.galleryViewMagnificOptions = $.extend({}, mf.imageViewMagnificOptions, {
        gallery: {
            enabled: true
        }
    });
});