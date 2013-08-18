define(function(require) {

	'use strict';


	var traverse = require('estraverse').traverse;


	var getCjsDependencies = function(ast) {
		var deps = [];

		traverse(ast, { enter: function(node) {
			if (
				node &&
				node.type === 'CallExpression' &&
				node.callee &&
				node.callee.type === 'Identifier' &&
				node.callee.name === 'require' &&
				node['arguments'] &&
				node['arguments'].length === 1 &&
				node['arguments'][0].type === 'Literal'
			) {
				deps.push(node['arguments'][0]);
			}
		}});

		return deps;
	};


	return getCjsDependencies;

});
