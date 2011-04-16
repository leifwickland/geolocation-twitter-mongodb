print("Input count: " + db.tweets.find().count());

var map = function() { 
  var lat, lng;
  if (this && this.geo && this.geo.coordinates) {
    var coordinates = this.geo.coordinates;
    lat = coordinates[0];
    lng = coordinates[1];
  }
  else if (this && this.place && this.place.bounding_box && this.place.bounding_box.coordinates) {
    coordinates = this.place.bounding_box.coordinates[0][0];
    lat = coordinates[1];
    lng = coordinates[0];
  }

  if (coordinates) {
    var rounder = function(value, power) {
      var e = Math.pow(10, power);
      return Math.round(value * e) / e;
    };
    for (var i = 0; i <= 3; i += 0.25) {
      var key = "" + i + ":" + rounder(lat, i).toFixed(3) + "," + rounder(lng, i).toFixed(3);
      //emit(key, {count:1, ids: [this.id] });
      emit(key, { count:1 });
    }
  }
};

var reduce = function(key, values) {
  //var result = { count: 0, ids: [] };
  var result = { count: 0 };

  values.forEach(function(value) {
    result.count += value.count;
    /*
    for (var i in value.ids) {
      result.ids.push(value.ids[i]);
    }
    */
  });

  return result;
};

db.tweets.mapReduce( map , reduce, "onlygeo");
print("Output count: " + db.onlygeo.find().count());
