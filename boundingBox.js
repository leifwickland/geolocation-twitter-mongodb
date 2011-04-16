var map = function() {
    if (this.geo || !this.place) {
        return;
    }
    var c = this.place.bounding_box.coordinates[0];
    var x = Geo.distance(c[0], c[1]);
    var y = Geo.distance(c[2], c[1])
    var area = Math.abs(x * y);
    emit(this.place.place_type + "--" + this.place.full_name, {
        place: this.place,
        area: area,
    });
};

var reduce = function(key, values) {
    return values[0];
}

print(db.raw.count());
db.raw.mapReduce(map, reduce, {out: "boundingBoxes"});
print(db.boundingBoxes.count());

