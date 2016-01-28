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
});