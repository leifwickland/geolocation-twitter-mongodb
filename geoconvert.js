var GlobalMercator = GlobalMercator || function() {
  this.earthRadiusInMeters = 6378137.0;
  this.initialResolution = 2 * Math.PI * this.earthRadiusInMeters / 256;
  this.originShift = Math.PI * this.earthRadiusInMeters;
}

GlobalMercator.prototype = {
  // Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
  latLonToMeters: function(lat, lon) {
    return [ 
      lon * this.originShift / 180.0,
      (Math.log( Math.tan((90 + lat) * Math.PI / 360.0 )) / (Math.PI / 180.0)) * (this.originShift / 180.0)
    ];
  },

  // Returns tile for given mercator coordinates
  metersToTile: function(x, y, zoom) {
    var pixels = this.metersToPixels(x, y, zoom);
    return this.pixelsToTile(pixels[0], pixels[1]);
  },
  

  // Returns a tile covering region in given pixel coordinates
  pixelsToTile: function(x, y) {
    return [
      Math.ceil(x / 256) - 1,
      Math.ceil(y / 256) - 1
    ];
  },

  // Converts EPSG:900913 to pyramid pixel coordinates in given zoom level
  metersToPixels: function(x, y, zoom) {
    var res = this.resolution(zoom)
    return [
      (x + this.originShift) / res,
      (y + this.originShift) / res
    ];
  },

  // Resolution (meters/pixel) for given zoom level (measured at Equator)
  resolution: function(zoom) {
    return this.initialResolution / (Math.pow(2, zoom));
  },

  // Converts TMS tile coordinates to Google Tile coordinates"
  tileToGoogleTile: function(x, y, zoom) {
    // coordinate origin is moved from bottom-left to top-left corner of the extent
    return [
      x,
      Math.pow(2, zoom) - 1 - y
    ];
  },


  latLonToGoogleTile: function(lat, lon, zoom) {
    var meters = this.latLonToMeters(lat, lon);
    var tile = this.metersToTile(meters[0], meters[1], zoom);
    return this.tileToGoogleTile(tile[0], tile[1], zoom);
  }
};

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

function printTestReport() {
  print("" + testCount + " tests were run.");
  print("" + testPassCount + " tests passed.");
  print("" + (testCount - testPassCount) + " tests failed.");
  print("");
}

var g = new GlobalMercator();
//print(g.latLonToMeters(90, 180));

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

//xy = g.latLonToMeters(-90, -180);
//assertEqual(xy[0], -20037508.342789244, "[0] of [-90,180]");
//assertEqual(xy[1], -20037508.342789244, "[1] of [-90,180]")
//
//xy = g.latLonToMeters(-80.859375, 48.515625);
//assertEqual(xy[0], -9001224.450862, "[0] of (-80.859375, 48.515625)");
//assertEqual(xy[1], 6161022.640508, "[1] of (-80.859375, 48.515625)")

function printTestReport() {
  print("" + testCount + " tests were run.");
  print("" + testPassCount + " tests passed.");
  print("" + (testCount - testPassCount) + " tests failed.");
  print("");
}
printTestReport();

/*
def LatLonToMeters(self, lat, lon ):
"Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913"

mx = lon * self.originShift / 180.0
my = math.log( math.tan((90 + lat) * math.pi / 360.0 )) / (math.pi / 180.0)

my = my * self.originShift / 180.0
return mx, my

def MetersToLatLon(self, mx, my ):
"Converts XY point from Spherical Mercator EPSG:900913 to lat/lon in WGS84 Datum"

lon = (mx / self.originShift) * 180.0
lat = (my / self.originShift) * 180.0

lat = 180 / math.pi * (2 * math.atan( math.exp( lat * math.pi / 180.0)) - math.pi / 2.0)
return lat, lon

def PixelsToMeters(self, px, py, zoom):
"Converts pixel coordinates in given zoom level of pyramid to EPSG:900913"

res = self.Resolution( zoom )
mx = px * res - self.originShift
my = py * res - self.originShift
return mx, my

def MetersToPixels(self, mx, my, zoom):
"Converts EPSG:900913 to pyramid pixel coordinates in given zoom level"

res = self.Resolution( zoom )
px = (mx + self.originShift) / res
py = (my + self.originShift) / res
return px, py

def PixelsToTile(self, px, py):
"Returns a tile covering region in given pixel coordinates"

tx = int( math.ceil( px / float(self.tileSize) ) - 1 )
ty = int( math.ceil( py / float(self.tileSize) ) - 1 )
return tx, ty

def PixelsToRaster(self, px, py, zoom):
"Move the origin of pixel coordinates to top-left corner"

mapSize = self.tileSize << zoom
return px, mapSize - py

def MetersToTile(self, mx, my, zoom):
"Returns tile for given mercator coordinates"

px, py = self.MetersToPixels( mx, my, zoom)
return self.PixelsToTile( px, py)

def TileBounds(self, tx, ty, zoom):
"Returns bounds of the given tile in EPSG:900913 coordinates"

minx, miny = self.PixelsToMeters( tx*self.tileSize, ty*self.tileSize, zoom )
maxx, maxy = self.PixelsToMeters( (tx+1)*self.tileSize, (ty+1)*self.tileSize, zoom )
return ( minx, miny, maxx, maxy )

def TileLatLonBounds(self, tx, ty, zoom ):
"Returns bounds of the given tile in latutude/longitude using WGS84 datum"

bounds = self.TileBounds( tx, ty, zoom)
minLat, minLon = self.MetersToLatLon(bounds[0], bounds[1])
maxLat, maxLon = self.MetersToLatLon(bounds[2], bounds[3])

return ( minLat, minLon, maxLat, maxLon )

def Resolution(self, zoom ):
"Resolution (meters/pixel) for given zoom level (measured at Equator)"

# return (2 * math.pi * 6378137) / (self.tileSize * 2**zoom)
return self.initialResolution / (2**zoom)

def ZoomForPixelSize(self, pixelSize ):
"Maximal scaledown zoom of the pyramid closest to the pixelSize."

for i in range(30):
if pixelSize > self.Resolution(i):
return i-1 if i!=0 else 0 # We don't want to scale up

def GoogleTile(self, tx, ty, zoom):
"Converts TMS tile coordinates to Google Tile coordinates"

# coordinate origin is moved from bottom-left to top-left corner of the extent
return tx, (2**zoom - 1) - ty

def QuadTree(self, tx, ty, zoom ):
"Converts TMS tile coordinates to Microsoft QuadTree"

quadKey = ""
ty = (2**zoom - 1) - ty
for i in range(zoom, 0, -1):
digit = 0
mask = 1 << (i-1)
if (tx & mask) != 0:
digit += 1
if (ty & mask) != 0:
digit += 2
quadKey += str(digit)

return quadKey

*/
