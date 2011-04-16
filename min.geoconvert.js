var GlobalMercator=GlobalMercator||function(){this.earthRadiusInMeters=6378137;this.initialResolution=2*Math.PI*this.earthRadiusInMeters/256;this.originShift=Math.PI*this.earthRadiusInMeters};
GlobalMercator.prototype={latLonToMeters:function(a,b){return[b*this.originShift/180,Math.log(Math.tan((90+a)*Math.PI/360))/(Math.PI/180)*(this.originShift/180)]},metersToTile:function(a,b,c){a=this.metersToPixels(a,b,c);return this.pixelsToTile(a[0],a[1])},pixelsToTile:function(a,b){return[Math.ceil(a/256)-1,Math.ceil(b/256)-1]},metersToPixels:function(a,b,c){c=this.resolution(c);return[(a+this.originShift)/c,(b+this.originShift)/c]},resolution:function(a){return this.initialResolution/Math.pow(2,
a)},tileToGoogleTile:function(a,b,c){return[a,Math.pow(2,c)-1-b]},latLonToGoogleTile:function(a,b,c){a=this.latLonToMeters(a,b);a=this.metersToTile(a[0],a[1],c);return this.tileToGoogleTile(a[0],a[1],c)}};
g = new GlobalMercator();

var testCount = 0;
var testPassCount = 0;
function assertEqual(actual, expected, message) {
  testCount++;
  if (expected != actual) {
    print("Test failed: " + message + "\n  Actual: " + actual + "\n  Expected: " + expected + "\n"); 
  }
  else {
    testPassCount++;
  }
}

var xy = g.latLonToMeters(45,45);
assertEqual(xy[0], 5009377.085697311, "[0] of [45,45]");
assertEqual(xy[1], 5621521.4861920672, "[1] of [45,45]")

xy = g.latLonToMeters(-45,-45);
assertEqual(xy[0], -5009377.085697311, "[0] of [-45,-45]");
assertEqual(xy[1], -5621521.4861920672, "[1] of [-45,-45]")

xy = g.latLonToMeters(1,0);
assertEqual(xy[0], 0, "[0] of [1,0]");
assertEqual(xy[1], 111325.14286638488, "[1] of [1,0]")

xy = g.latLonToMeters(-85,189);
assertEqual(xy[0], 21039383.759928707, "[0] of [-85,189]");
assertEqual(xy[1], -19971868.880408563, "[1] of [-85,189]")


tile = g.latLonToGoogleTile(45, 45, 19);
assertEqual(tile[0], 327679, "[0] of [45,45] @ 19");
assertEqual(tile[1], 188599, "[1] of [45,45] @ 19")

//tile = g.latLonToGoogleTile(41.850033, -87.6500523, 10);
//assertEqual(tile[0], 327679, "[0] of [41.850033,-87.6500523] @ 10");
//assertEqual(tile[1], 188599, "[1] of [41.850033,-87.6500523] @ 10")

tile = g.latLonToGoogleTile(41.850033, -87.6500523, 0);
assertEqual(tile[0], 0, "[0] of [41.850033,-87.6500523] @ 0");
assertEqual(tile[1], 0, "[1] of [41.850033,-87.6500523] @ 0")

tile = g.latLonToGoogleTile(41.850033, -87.6500523, 1);
assertEqual(tile[0], 0, "[0] of [41.850033,-87.6500523] @ 1");
assertEqual(tile[1], 0, "[1] of [41.850033,-87.6500523] @ 1")

tile = g.latLonToGoogleTile(41.850033, -87.6500523, 2);
assertEqual(tile[0], 1, "[0] of [41.850033,-87.6500523] @ 2");
assertEqual(tile[1], 1, "[1] of [41.850033,-87.6500523] @ 2")

tile = g.latLonToGoogleTile(41.850033, -87.6500523, 3);
assertEqual(tile[0], 2, "[0] of [41.850033,-87.6500523] @ 3");
assertEqual(tile[1], 2, "[1] of [41.850033,-87.6500523] @ 3")

tile = g.latLonToGoogleTile(41.850033, -87.6500523, 4);
assertEqual(tile[0], 4, "[0] of [41.850033,-87.6500523] @ 4");
assertEqual(tile[1], 5, "[1] of [41.850033,-87.6500523] @ 4")

tile = g.latLonToGoogleTile(41.850033, -87.6500523, 17);
assertEqual(tile[0], 33623, "[0] of [41.850033,-87.6500523] @ 17");
assertEqual(tile[1], 48729, "[1] of [41.850033,-87.6500523] @ 17")

tile = g.latLonToGoogleTile(41.850033, -87.6500523, 19);
assertEqual(tile[0], 134494, "[0] of [41.850033,-87.6500523] @ 19");
assertEqual(tile[1], 194918, "[1] of [41.850033,-87.6500523] @ 19")

function printTestReport() {
  print("" + testCount + " tests were run.");
  print("" + testPassCount + " tests passed.");
  print("" + (testCount - testPassCount) + " tests failed.");
  print("");
}
printTestReport();
