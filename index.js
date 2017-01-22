'use strict';
var tileReduce = require('tile-reduce');
var path = require('path');
var turf = require('turf');
var dedupe = require('dedupe');

var out = [];
var junctions = [];
tileReduce({
  bbox: [-122.445981,37.751151,-122.420482,37.769355],
  zoom: 12,
  map: path.join(__dirname, '/map.js'),
  sources: [{
    name: 'osm',
    mbtiles: path.join(__dirname, '/united_states_of_america.mbtiles'),
    raw: false
  }]
})
.on('reduce', function(data) {
  out = out.concat(data);
})
.on('end', function() {
  var dedupe_out = dedupe(out);
  for (var i = 0; i < dedupe_out.length; i++) {
    junctions = junctions.concat(turf.point(dedupe_out[i]));
  }
  console.log(JSON.stringify(turf.featureCollection(junctions)));
});
