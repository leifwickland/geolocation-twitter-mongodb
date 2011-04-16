var map = function() {
    if (this.geo && this.geo.coordinates) {
        emit(this._id, { 
            lat: this.geo.coordinates[0],
            lng: this.geo.coordinates[1],
            mapname: "test",
        });
    }
}
var reduce = function(key, values) {
    return values[0];
}
db.raw.mapReduce(map, reduce, { out: "gheat" });
