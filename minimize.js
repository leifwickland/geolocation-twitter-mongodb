
var map = function() { 
    var lat, lng, coordinates;
    if (this && this.geo && this.geo.coordinates) {
        coordinates = this.geo.coordinates;
        lat = coordinates[0];
        lng = coordinates[1];
    }
    else if (this && this.place && this.place.bounding_box && this.place.bounding_box.coordinates) {
        lat = 0;
        lng = 0;
        var c = this.place.bounding_box.coordinates;
        for (var i in c) {
            lat += c[i][1];
            lng += c[i][0];
        }
        coordinates = [
            lat / c.length,
            lng / c.length,
        ];
    }

    if (lat && lng) {
        emit(this.id, { 
            text: this.text,
            user_id: this.user.id,
            created_at: this.created_at,
            geo: {
                coordinates: [ lat, lng ]
            }
        });
    }
};

var reduce = function(key, values) {
    return values[0];
}

if (db[input].count() == 0) {
    print("Input collection (" + db[input] + ") is empty.");
}
else {
    print("Input collection (" + input + ") pre-count: " + db[input].count());
    print("Output collection (" + output + ") pre-count: " + db[output].count());
    db[input].mapReduce(map, reduce, output);
    print("Output collection (" + output + ") post-count: " + db[output].count());
    //db[input].remove({});
    print("Input collection (" + input + ") post-count: " + db[input].count());
}
