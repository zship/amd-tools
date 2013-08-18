define(function(require) {

	'use strict';


	var traverse = require('estraverse').traverse;
	var SKIP = require('estraverse').VisitorOption.Skip;


	var getDefine = function(ast) {
		var defines = [];

		traverse(ast, { enter: function(node) {
			if (
				node &&
				node.type === 'ExpressionStatement' &&
				node.expression.type === 'CallExpression' &&
				node.expression.callee.type === 'Identifier' &&
				node.expression.callee.name === 'define'
			) {
				defines.push(node);
				return SKIP;
			}
		}});

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
