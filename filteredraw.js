if (!input || !output) {
    throw "You didn't define the arguments";
}
input = db[input];
output = db[output];

var map = function() { 
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
    var c = getCoordinates.apply(this);
    if (!c) {
        return;
    }
    output.update({_id:this.id}, {
        _id: this.id, 
        geo: { coordinates: c },
        created_at: this.created_at,
        user_id: this.user.id,
    }, true, false);
};

print("Input collection size: " + input.count());
input.find().forEach(function(i) { map.apply(i) } );
print("Output collection size: " + output.count());
print("Discarded: " + (input.count - output.count()));
