
var outName = "maxcombinedtime";
if (!db[outName]) {
    db.createCollection(outName);
}
var out = db[outName];
var input = db["combinedtime"];
if (!input) {
    print("can't find input");
}
["all", "day", "hour"].forEach(function(timeRes) {
    for (var zoom = 3; zoom <= 19; ++zoom) { 
        var max = db.combinedtime.find({"value.timeRes": timeRes, "value.zoom": zoom}, {"value.total":1, _id:-1}).sort({"value.total":-1}).limit(1)[0];
        var key = timeRes + "-" + zoom; 
        print(key + ":  " + max.value.total); // printjson(max);// + max);
        out.update({_id:key}, {_id: key, max: max.value.total}, true, false);
    }
});

