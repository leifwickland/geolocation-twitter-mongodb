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

var input = "boundingBoxes";
var col = db[input];
var index = {"value.area": 1};
print("Ensuring index ");
col.ensureIndex(index);
print("Ensured index ");
var percentiles = getPercentilesFor(col, 1, index, function() { return this.value.area + " " + this.value.place.place_type + " " + this.value.place.full_name; });
printjson(percentiles);
print("\n");

