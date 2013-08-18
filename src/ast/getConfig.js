define(function(require) {

	'use strict';


	var traverse = require('estraverse').traverse;
	var BREAK = require('estraverse').VisitorOption.Break;


	var _isRequireCall = function(node) {
		if (!node) {
			return false;
		}

		if (node.type !== 'CallExpression') {
			return false;
		}

		// require({}, ...)
		// requirejs({}, ...)
		if (
			node.callee.type === 'Identifier' &&
			(
				node.callee.name === 'require' ||
				node.callee.name === 'requirejs'
			)
		) {
			return true;
		}

		// require.config({})
		// requirejs.config({})
		if (
			node.callee.type === 'MemberExpression' &&
			node.callee.object &&
			node.callee.object.type === 'Identifier' &&
			(
				node.callee.object.name === 'require' ||
				node.callee.object.name === 'requirejs'
			) &&
			node.callee.property &&
			node.callee.property.name === 'config'
		) {
			return true;
		}

		return false;
	};


	// var require = {}
	// var requirejs = {}
	var _isRequireAssignment = function(node) {
		if (
			node.id &&
			node.id.type === 'Identifier' &&
			(
				node.id.name === 'require' ||
				node.id.name === 'requirejs'
			) &&
			node.init &&
			node.init.type === 'ObjectExpression'
		) {
			return true;
		}

		return false;
	};


	var getConfig = function(ast) {
		var config;

		traverse(ast, { enter: function(node) {
			if (_isRequireCall(node)) {
				config = node['arguments'] && node['arguments'][0];
				return BREAK;
			}
			if (_isRequireAssignment(node)) {
				config = node.init;
				return BREAK;
			}
		}});

		return config;
	};


	return getConfig;

});
