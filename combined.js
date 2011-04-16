if(!output || !input || !finestZoom || !coarsestZoom) {
    print("You didn't define the arguments");
    throw new Exception();
}
var map = function() {
    var c = this.value.geo.coordinates;
    var childTile = latLonToGoogleTile(c[0], c[1], finestZoom + dataZoomLevels);
    for (var zoom = finestZoom; zoom >= coarsestZoom; --zoom) {
        var key = "" + zoom + ":" + Math.floor(childTile[0] / dataZoomFactor) + "," + Math.floor(childTile[1] / dataZoomFactor);
        var subIndex = (childTile[0] % dataZoomFactor) + dataZoomFactor * (childTile[1] % dataZoomFactor);
        var counts = [];
        counts[subIndex] = 1;
        emit(key, {
            total: 1,
            counts: counts,
            zoom: zoom,
        });
        childTile = [
            Math.floor(childTile[0]) / 2,
            Math.floor(childTile[1]) / 2,
        ];
    }
};

var reduce = function(key, values) {
    var result = {
        total: 0,
        counts: [],
        zoom: values[0].zoom,
    };
    for (var i = 0; i < values.length; ++i) {
        var value = values[i];
        result.total += value.total;
        for (var j in value.counts) {
            result.counts[j] = (result.counts[j] || 0) + value.counts[j];
        }
    }
    return result;
};

if (db[input].count() == 0) {
    print("Input collection (" + db[input] + ") is empty.");
}
else {
    print("Input collection (" + input + ") pre-count: " + db[input].count());
    print("Output collection (" + output + ") pre-count: " + db[output].count());
    db[input].mapReduce(map, reduce, {
        out: output, 
        scope: { 
            finestZoom: finestZoom,
            coarsestZoom: coarsestZoom,
            dataZoomLevels: 4,
            dataZoomFactor: Math.pow(2, 4),
        },
    });
    print("Output collection (" + output + ") post-count: " + db[output].count());
    print("Input collection (" + input + ") post-count: " + db[input].count());
}
