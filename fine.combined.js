if(!input || !finestZoom || !minLevel|| !maxLevel ) {
    print("You didn't define the arguments");
    throw new Exception();
}
var map = function() {
    var c = this.value.geo.coordinates;
    var dataTile = latLonToGoogleTile(c[0], c[1], dataZoom);
    var tile = (zoom === dataZoom) ? dataTile : latLonToGoogleTile(c[0], c[1], zoom);
    var key = tile[0].toString() + "," + tile[1];
    var subIndex = (dataTile[0] % dataTileRowSize) + dataTileRowSize * (dataTile[1] % dataTileRowSize);
    var counts = [];
    counts[subIndex] = 1;
    emit(key, {
        total: 1,
        counts: counts,
    });
};

var reduce = function(key, values) {
    if (values.length == 1) {
        return values[0];
    }
    var result = {
        total: 0,
        counts: [],
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

/*
var finalize = function(key, value) {
    var maxCount = 0;
    var counts = value.counts;
    var numCounts = 0;
    for (var i in counts) {
        maxCount = Math.max(maxCount, counts[i]);
        ++numCounts;
    }
    value.maxCount = maxCount;
    value.numCounts = numCounts;
    return value;
}
*/

if (db[input].count() == 0) {
    print("Input collection (" + db[input] + ") is empty.");
}
else {
    for (var zoom = maxLevel; zoom >= minLevel; --zoom) {
        var startTime = new Date();
        var output = "level" + zoom;
        print("Input collection (" + input + ") pre-count: " + db[input].count());
        print("Output collection (" + output + ") pre-count: " + db[output].count());
        var dataZoom = Math.min(zoom + 4, finestZoom);
        print("Zoom: " + zoom);
        print("Data Zoom: " + dataZoom);
        var dataTileRowSize = Math.pow(2, dataZoom - zoom);
        print("Data Tile Row Size: " + dataTileRowSize);
        db[input].mapReduce(map, reduce, {
            out: output, 
            scope: { 
                zoom: zoom,
                dataZoom: dataZoom,
                dataTileRowSize: dataTileRowSize,
            },
            //finalize: finalize,
        });
        print("Run time: " + ((new Date() - startTime)/1000) + " seconds");
        print("Output collection (" + output + ") post-count: " + db[output].count());
        print("Input collection (" + input + ") post-count: " + db[input].count());
        print("\n\n");
    }
}
