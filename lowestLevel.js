if(!zoom || !input) {
    print("You didn't define the arguments: zoom, input");
}
var output = "level" + zoom;
var map = function() {
    var c = this.value.geo.coordinates;
    var tile = latLonToGoogleTile(c[0], c[1], zoom);
    var key = "" + tile[0] + "," + tile[1];
    emit(key, { count: 1, geo: c, id: this._id} );
};

var reduce = function(key, values) {
    var result = { 
        count: 0, 
        geo: values[0].geo, 
        id: values[0]._id,
    };
    for (var i = 0; i < values.length; ++i) {
        result.count += values[i].count;
    }
    return result;
};

/*
var finalize = function(key, value) {
    return { 
        total: value,
        counts: [value],
        res: 1,
    };
}
*/

if (db[input].count() == 0) {
    print("Input collection (" + db[input] + ") is empty.");
}
else {
    print("Input collection (" + input + ") pre-count: " + db[input].count());
    print("Output collection (" + output + ") pre-count: " + db[output].count());
    db[input].mapReduce(map, reduce, {
        out: output, 
        //finalize: finalize, 
        scope: { 
            zoom: zoom
        } 
    });
    print("Output collection (" + output + ") post-count: " + db[output].count());
    print("Input collection (" + input + ") post-count: " + db[input].count());
}
