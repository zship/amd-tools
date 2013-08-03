define(function(require) {

	'use strict';


	var traverse = require('./_traverse');


	var getDefine = function(ast) {
		var defines = [];

		traverse(ast, function(node) {
			if (
				node &&
				node.type === 'ExpressionStatement' &&
				node.expression.type === 'CallExpression' &&
				node.expression.callee.type === 'Identifier' &&
				node.expression.callee.name === 'define'
			) {
				defines.push(node);
			}
		});

		if (!defines.length) {
			throw new Error('AMD modules must contain a define() call');
		}

		if (defines.length > 1) {
			throw new Error('AMD modules can have only a single define call. Found '+ defines.length + '.');
		}

		return defines[0];
	};


	return getDefine;

});
