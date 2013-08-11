define(function(require) {

	'use strict';


	var getDependencyGraph = require('./getDependencyGraph');
	var unique = require('./cycles/unique');


	var findCircularDependencies = function(file, rjsconfig) {

		var cycles = [];
		var graph = getDependencyGraph(file, rjsconfig);

		var visit = function(node, parents) {
			var i;
			if ((i = parents.indexOf(node)) !== -1) {
				cycles.push(parents.slice(i));
				return;
			}

			node.deps.forEach(function(dep) {
				visit(dep, parents.concat([node]));
			});
		};

		visit(graph, []);

		return unique(
			cycles.map(function(cycle) {
				return cycle.map(function(node) {
					return node.file;
				});
			})
		);

	};


	return findCircularDependencies;

});
