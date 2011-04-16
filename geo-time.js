if(!input || !output || !finestZoom || !minZoom || !maxZoom) {
    throw "You didn't define the arguments";
}
if (minZoom > maxZoom) {
    var temp = minZoom; minZoom = maxZoom; maxZoom = temp;
}
if (finestZoom < maxZoom) {
    throw "finestZoom must be >= maxZoom";
}

var map = function() {
    function getDataZoom(zoom) { return Math.min(zoom + 4, finestZoom); }
    function pad(n) {return n < 10 ? '0' + n : n} 
    function getDayDate(d) { d = new Date(d); return [pad(d.getUTCMonth()+1), pad(d.getUTCDate())].join("-"); } 
    function getHourDate(d) { d = new Date(d); return [pad(d.getUTCMonth()+1), pad(d.getUTCDate()), pad(d.getUTCHours())].join("-"); } 
    function latLongToGoogleTile(a, f, b) {
        var g = Math.PI * 12756274 / 256, c = Math.PI * 6378137;
        a = [f * c / 180, Math.log(Math.tan((90 + a) * Math.PI / 360)) / (Math.PI / 180) * (c / 180)];
        a = (function (a, b, d) {d = g / Math.pow(2, d);a = [(a + c) / d, (b + c) / d];return [Math.ceil(a[0] / 256) - 1, Math.ceil(a[1] / 256) - 1];})(a[0], a[1], b);
        return [a[0], Math.pow(2, b) - 1 - a[1]];
    }
    function getCoordinates() { 
        if (this.geo && this.geo.coordinates) {
            return this.geo.coordinates;
        }
        else if (this && this.place && this.place.bounding_box && this.place.bounding_box.coordinates) {
            var c = this.place.bounding_box.coordinates[0];
            var x = Geo.distance(c[0], c[1]);
            var y = Geo.distance(c[2], c[1])
            if (x * y < .000055) {
                // Find the middle of bounding box.
                return [
                    Math.abs((c[0][1] + c[1][1] + c[2][1] + c[3][1]) / 4), 
                    Math.abs((c[0][0] + c[1][0] + c[2][0] + c[3][0]) / 4),
                ];
            }
        }
        return false;
    }
    var tiles = [];

    var c = getCoordinates.apply(this);
    if (c===false) {
        return;
    }
    // Precompute all the tile values to avoid redundant computation
    for (var zoom = getDataZoom(maxZoom); zoom >= minZoom; --zoom) {
        tiles[zoom] = latLongToGoogleTile(c[0], c[1], zoom);
    }
    for (var zoom = getDataZoom(maxZoom); zoom >= minZoom; --zoom) {
        var dataZoom = getDataZoom(zoom);
        var tile = tiles[zoom];
        var dataTile = tiles[dataZoom];
        var dataTileRowSize = Math.pow(2, dataZoom - zoom);
        var subIndex = (dataTile[0] % dataTileRowSize) + dataTileRowSize * (dataTile[1] % dataTileRowSize);
        var baseKey = "" + zoom + "/" + tile.join(",") + "/";
        counts = {};
        counts[subIndex] = 1;
        var emittedValue = {
            total: 1,
            counts: counts,
            res: (dataTileRowSize * dataTileRowSize),
            zoom: zoom,
        };

        var key = baseKey + "all";
        //print("Emitting " + key);
        emittedValue.timeRes = "all";
        emit(key, emittedValue);
        key = baseKey + getDayDate(this.created_at);
        //print("Emitting " + key);
        emittedValue.timeRes = "day";
        emit(key, emittedValue);
        key = baseKey + getHourDate(this.created_at);
        //print("Emitting " + key);
        emittedValue.timeRes = "hour";
        emit(key, emittedValue);
    }
};

var reduce = function(key, values) {
    if (values.length == 1) {
        return values[0];
    }
    var result = {
        total: 0,
        counts: {},
        res: values[0].res,
        zoom: values[0].zoom,
        timeRes: values[0].timeRes,
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
    var startTime = new Date();
    print("Input collection (" + db[input] + ") pre-count: " + db[input].count());
    print("Output collection (" + db[output] + ") pre-count: " + db[output].count());
    db[input].mapReduce(map, reduce, {
        out: output, 
        scope: { 
            minZoom: minZoom,
            maxZoom: maxZoom,
            finestZoom: finestZoom,
        },
        //finalize: finalize,
    });
    print("Run time: " + ((new Date() - startTime)/1000) + " seconds");
    print("Output collection (" + output + ") post-count: " + db[output].count());
    print("Input collection (" + input + ") post-count: " + db[input].count());
}
