// create namespace
window.mf = window.mf || {};
(function () {
    $(function () {
        if (!Globalize)
            return;

        // Use $.getJSON instead of $.get if your server is not configured to return the
        // right MIME type for .json files.
        $.when(
            $.get("/globalization/ca-gregorian.json"),
            $.get("/globalization/numbers.json"),
            $.get("/globalization/timeZoneNames.json"),
            $.get("/globalization/likelySubtags.json"),
            $.get("/globalization/numberingSystems.json"),
            $.get("/globalization/timeData.json"),
            $.get("/globalization/weekData.json")
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