print("Input count: " + db.prefix.find().count());

var map = function() { 
    emit(this.x.substr(0,1), 1); 
}
var reduce = function(key, values) {
  var sum = 0;

  print("\nReduce Received:");
  for (var i = 0; i < values.length; ++i) {
      print("    " + values[i]);
    sum += values[i];
  }
  print("\n");

  return sum;
};
if (!db.prefixcount) {
  db.createCollection("prefixcount");
}
db.prefix.mapReduce(map, reduce, {out: {reduce: "prefixcount"}});
print("Output count: " + db.prefixcount.count());
db.prefixcount.find().forEach(function(i){ print(i._id + ": " + i.value)});
