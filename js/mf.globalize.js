// create namespace
window.mf = window.mf || {};
(function () {
    $(function () {

        if (!Globalize)
            return;

        // Use $.getJSON instead of $.get if your server is not configured to return the
        // right MIME type for .json files.
        $.when(
            $.get("/json/globalization/main/ru/ca-gregorian.json"),
            $.get("/json/globalization/main/ru/numbers.json"),
            $.get("/json/globalization/main/ru/timeZoneNames.json"),
            $.get("/json/globalization/supplemental/likelySubtags.json"),
            $.get("/json/globalization/supplemental/numberingSystems.json"),
            $.get("/json/globalization/supplemental/timeData.json"),
            $.get("/json/globalization/supplemental/weekData.json")
        ).then(function () {
            // Normalize $.get results, we only need the JSON, not the request statuses.
            return [].slice.apply(arguments, [0]).map(function (result) {
                return result[0];
            });
        }).then(Globalize.load).then(function () {
            Globalize.locale(mf.culture);
        });
    });
})();