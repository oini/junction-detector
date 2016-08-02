'use strict';
var tileReduce = require('tile-reduce');
var path = require('path');
var turf = require('turf');

var out = turf.featureCollection([]);
//module.exports = function(opts, mbtilesPath, callback) {
tileReduce({
  bbox: [-126.91406249999999,24.766784522874453,-66.533203125,49.49667452747045],
  zoom: 12,
  map: path.join(__dirname, '/map.js'),
  sources: [{
    name: 'osm',
    mbtiles: '/Users/oindrila/mapbox/united_states_of_america.mbtiles',
    raw: false
  }]
})
.on('reduce', function(data) {
  out.features = out.features.concat(data.features);
})
.on('end', function() {
  console.log(JSON.stringify(out));
});
