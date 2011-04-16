function latLonToGoogleTile(lat, lon, zoom) {
    var earthRadiusInMeters = 6378137;
    var initialResolution = 2 * Math.PI * earthRadiusInMeters / 256;
    var originShift = Math.PI * earthRadiusInMeters;

    function metersToTile(x, y, zoom) {
        var pixels = metersToPixels(x, y, zoom);
        return pixelsToTile(pixels[0], pixels[1]);
    }

    function metersToPixels(x, y, zoom) {
        var res = resolution(zoom);
        return [
            (x + originShift) / res,
            (y + originShift) / res
        ];
    }

    function pixelsToTile(x, y) {
        return [
            Math.ceil(x / 256) - 1,
            Math.ceil(y / 256) - 1
        ];
    }

    function resolution(zoom) {
        return initialResolution / (Math.pow(2, zoom));
    }

    function latLonToMeters(lat, lon) {
        return [ 
            lon * originShift / 180,
            (Math.log( Math.tan((90 + lat) * Math.PI / 360 )) / (Math.PI / 180)) * (originShift / 180)
        ];
    }

    function tileToGoogleTile(x, y, zoom) {
        // coordinate origin is moved from bottom-left to top-left corner of the extent
        return [
            x,
            Math.pow(2, zoom) - 1 - y
        ];
    }

    var meters = latLonToMeters(lat, lon);
    var tile = metersToTile(meters[0], meters[1], zoom);
    return tileToGoogleTile(tile[0], tile[1], zoom);
}

print(latLonToGoogleTile(1,2,1));
print(latLonToGoogleTile(2,1,2));

var testCount = 0, testPassCount = 0;
function assertEqual(actual, expected, message) {
    testCount++;
    if (expected != actual) {
        print("Test failed: " + message + "\n  Actual: " + actual + "\n  Expected: " + expected + "\n"); 
    }
    else {
        testPassCount++;
    }
}

tile = latLonToGoogleTile(45, 45, 19);
assertEqual(tile[0], 327679, "[0] of [45,45] @ 19");
assertEqual(tile[1], 188599, "[1] of [45,45] @ 19")

//tile = latLonToGoogleTile(41.850033, -87.6500523, 10);
//assertEqual(tile[0], 327679, "[0] of [41.850033,-87.6500523] @ 10");
//assertEqual(tile[1], 188599, "[1] of [41.850033,-87.6500523] @ 10")

tile = latLonToGoogleTile(41.850033, -87.6500523, 0);
assertEqual(tile[0], 0, "[0] of [41.850033,-87.6500523] @ 0");
assertEqual(tile[1], 0, "[1] of [41.850033,-87.6500523] @ 0")

tile = latLonToGoogleTile(41.850033, -87.6500523, 1);
assertEqual(tile[0], 0, "[0] of [41.850033,-87.6500523] @ 1");
assertEqual(tile[1], 0, "[1] of [41.850033,-87.6500523] @ 1")

tile = latLonToGoogleTile(41.850033, -87.6500523, 2);
assertEqual(tile[0], 1, "[0] of [41.850033,-87.6500523] @ 2");
assertEqual(tile[1], 1, "[1] of [41.850033,-87.6500523] @ 2")

tile = latLonToGoogleTile(41.850033, -87.6500523, 3);
assertEqual(tile[0], 2, "[0] of [41.850033,-87.6500523] @ 3");
assertEqual(tile[1], 2, "[1] of [41.850033,-87.6500523] @ 3")

tile = latLonToGoogleTile(41.850033, -87.6500523, 4);
assertEqual(tile[0], 4, "[0] of [41.850033,-87.6500523] @ 4");
assertEqual(tile[1], 5, "[1] of [41.850033,-87.6500523] @ 4")

tile = latLonToGoogleTile(41.850033, -87.6500523, 17);
assertEqual(tile[0], 33623, "[0] of [41.850033,-87.6500523] @ 17");
assertEqual(tile[1], 48729, "[1] of [41.850033,-87.6500523] @ 17")

tile = latLonToGoogleTile(41.850033, -87.6500523, 19);
assertEqual(tile[0], 134494, "[0] of [41.850033,-87.6500523] @ 19");
assertEqual(tile[1], 194918, "[1] of [41.850033,-87.6500523] @ 19")

function printTestReport() {
    print("" + testCount + " tests were run.");
    print("" + testPassCount + " tests passed.");
    print("" + (testCount - testPassCount) + " tests failed.");
    print("");
}
printTestReport();
