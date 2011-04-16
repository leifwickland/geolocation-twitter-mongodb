if(!maxLevel || !minLevel) {
    print("You didn't define the arguments");
    throw new Exception();
}

function getPercentilesFor(collection, increment, sortSpecifier, valueExtractor) {
    var getPercentile = function(percentile) {
        var count = collection.count();
        var skip = Math.min(count - 1, Math.floor(count * (percentile / 100)));
        var found = collection.find().sort(sortSpecifier).skip(skip).limit(1)[0];
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

for (var level = minLevel; level <= maxLevel; ++level) {
    print("------------------------------ Level " + level + "------------------------------");
    var input = "level" + level;
    var col = db[input];
    var index = {"value.total": 1};
    col.ensureIndex(index);
    var percentiles = getPercentilesFor(col, 5, index, function() { return this.value.total; });
    printjson(percentiles);
    print("\n");
}
