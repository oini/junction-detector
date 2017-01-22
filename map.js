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
      var eachBboxHighway = {
        minX: bboxHighway[0],
        minY: bboxHighway[1],
        maxX: bboxHighway[2],
        maxY: bboxHighway[3],
        osm_way_id: val.properties['@id']
      };
      bboxes.push(eachBboxHighway);
      highways[val.properties['@id']] = val;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  var output = [];

  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    var overlaps = highwaysTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      if (bbox.osm_way_id !== overlap.osm_way_id) {
        var intersectPoint = turf.intersect(highways[overlap.osm_way_id], highways[bbox.osm_way_id]);
        if (intersectPoint !== undefined && (intersectPoint.geometry.type === 'Point' || intersectPoint.geometry.type === 'MultiPoint')) {
          output.push(intersectPoint.geometry.coordinates);
        }
      }
    }
  }
  done(null, output);

};
