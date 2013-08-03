define(function(require) {

	'use strict';


	var fs = require('fs');
	var esprima = require('esprima');
	var getDeps = require('./ast/getDependencies');


	var getDependencies = function(file) {
		var ast = esprima.parse(fs.readFileSync(file, 'utf8'));
		return getDeps(ast)
			.map(function(node) {
				return node.value;
			})
			.reverse()
			.filter(function(name, i, list) {
				return list.indexOf(name, i+1) === -1;
			})
			.reverse();
	};


	return getDependencies;

});
