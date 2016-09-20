'use strict';
var tileReduce = require('tile-reduce');
var path = require('path');
var turf = require('turf');

var out = turf.featureCollection([]);
//module.exports = function(opts, mbtilesPath, callback) {
tileReduce({
  bbox: [-122.52193450927734,37.69604601332987,-122.35542297363281,37.80625771945958],
  // bbox: [-126.39,21.75,-66.80,49.33],
  zoom: 12,
  map: path.join(__dirname, '/map.js'),
  sources: [{
    name: 'osm',
    mbtiles: path.join(__dirname, '/united_states_of_america.mbtiles'),
    raw: false
  }]
})
.on('reduce', function(data) {
  out.features = out.features.concat(data.features);
})
.on('end', function() {
  console.log(out.features.length);
});
