if(!zoom) {
    print("You didn't define the arguments: zoom, input");
}

var input = "level" + (zoom + 1);
var output = "level" + zoom;

var map = function() {
    var tileSize = 2;
    var fineTile = this._id.split(",");
    var tile = [
        Math.floor(fineTile[0] / 2),
        Math.floor(fineTile[1] / 2),
    ];
    var subIndex = (fineTile[0] % tileSize) + tileSize * (fineTile[1] % tileSize);
    var key = "" + tile[0] + "," + tile[1];
    var value = {
        total: this.value.total,
        counts: [],
        res: Math.min(16, this.value.res * 2),
    };
    value.counts[subIndex] = this.value.total;
    emit(key, value);
};

var reduce = function(key, values) {
    var result = {
        total: 0,
        counts: [],
        res: values[0].res,
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
            zoom: zoom
        } 
    });
    print("Output collection (" + output + ") post-count: " + db[output].count());
    print("Input collection (" + input + ") post-count: " + db[input].count());
}
