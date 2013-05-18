'use strict';


var fs = require('fs');
var path = require('path');
var requirejs = require('requirejs');

requirejs.config({
	baseUrl: path.resolve(__dirname, '../../lib/rjs'),
	nodeRequire: require
});
var parse = requirejs('parse');


var getDependencies = function(filename) {
	try {
		return parse.findDependencies(filename, fs.readFileSync(filename, 'utf-8'));
	}
	catch (e) {
		return [];
	}
};


module.exports = getDependencies;
