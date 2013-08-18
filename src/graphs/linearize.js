define(function(require) {

	'use strict';


	var isArray = require('mout/lang/isArray');


	// topological sort
	var linearize = function(nodes) {

		if (!isArray(nodes)) {
			nodes = [nodes];
		}

		var sorted = [];

		var visit = function(node, parents) {
			if (sorted.indexOf(node) !== -1) {
				return;
			}

			if (parents.indexOf(node) !== -1) {
				return; // cycle
			}

			node.deps.forEach(function(dep) {
				visit(dep, parents.concat([node]));
			});

			sorted.unshift(node);
		};

		nodes.forEach(function(node) {
			visit(node, []);
		});

		return sorted;

	};


	return linearize;

});
