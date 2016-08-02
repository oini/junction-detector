'use strict';
var turf = require('turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var highways = {};
  var bboxes = [];
  var majorRoads = {
    'motorway': true,
    'trunk': true,
    'primary': true,
    'secondary': true,
    'tertiary': true,
    'motorway_link': true,
    'trunk_link': true,
    'primary_link': true,
    'secondary_link': true,
    'tertiary_link': true
  };
  var minorRoads = {
    'unclassified': true,
    'residential': true,
    'living_street': true,
    'service': true,
    'road': true
  };

  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (preserveType[val.properties.highway] && (val.geometry.type === 'LineString' || val.geometry.type === 'MultiLineString') && val.properties.layer === undefined) {
      var bboxHighway = turf.bbox(val);
      bboxHighway.push(val.properties._osm_way_id);
      bboxes.push(bboxHighway);
      highways[val.properties._osm_way_id] = val;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var output = turf.featureCollection([]);

  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    var overlaps = highwaysTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (bbox[4] !== overlap[4]) {
        var intersectPoint = turf.intersect(highways[overlap[4]], highways[bbox[4]]);
        if (intersectPoint !== undefined && (intersectPoint.geometry.type === 'Point' || intersectPoint.geometry.type === 'MultiPoint')) {
          output.features = output.features.concat(intersectPoint);
          //output.push(JSON.stringify(intersectPoint) + ',');
          //console.log(JSON.stringify(intersectPoint) + ',');
        }
      }
    }
  }


  done(null, output);

};
