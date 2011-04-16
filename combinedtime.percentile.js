if(!maxZoom || !minZoom) {
    print("You didn't define the arguments");
    throw new Exception();
}

function getPercentilesFor(collection, filter, increment, sortSpecifier, valueExtractor) {
    var getPercentile = function(percentile) {
        var count = collection.count(filter);
        var skip = Math.min(count - 1, Math.floor(count * (percentile / 100)));
        var found = collection.find(filter).sort(sortSpecifier).skip(skip).limit(1)[0];
        return valueExtractor.apply(found)
    };
    var percentiles = {};
    for (var i = 0; i < 100; i += increment) {
        percentiles[i] = getPercentile(i);
    }
    [ 99, 99.5, 99.9, 99.99, 100 ].forEach(function(i) { 
        percentiles[i] = getPercentile(i);
    });
    return percentiles;
}

var col = db['combinedtime'];
var index = {"value.total": 1};
col.ensureIndex(index);
col.ensureIndex({"value.timeRes":1, "value.zoom":1});
[ "all", "day", "hour" ].forEach(function(timeRes) { 
    for (var zoom = minZoom; zoom <= maxZoom; ++zoom) {
        var filter = { "value.timeRes" : timeRes, "value.zoom": zoom};
        var startTime = new Date();
        print("------------------------------ Time Resolution '" + timeRes + "'  Level " + zoom + " Start '" + startTime + "'------------------------------");
        var percentiles = getPercentilesFor(col, filter, 5, index, function() { return this.value.total; });
        printjson(percentiles);
        var endTime = new Date();
        print("\n End '" + endTime + "' Total: " + (endTime - startTime) + "\n");
    }
});
