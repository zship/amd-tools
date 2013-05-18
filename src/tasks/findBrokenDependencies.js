'use strict';


var path = require('path');
var requirejs = require('requirejs');

var getDependencies = require('./getDependencies');
var requireWith = require('../util/requireWith');
var Modules = require('../util/Modules');


var _getPlugin = function(pluginName, rjsconfig) {
	rjsconfig.nodeRequire = require;
	var plugin = requireWith(pluginName, rjsconfig);

	if (!plugin || !plugin.load) {
		throw '"' + pluginName + '" plugin could not be resolved';
	}

	return plugin;
};


var _pluginCanLoad = function(plugin, loadArgs) {
	var didLoad = false;
	var load = function() {
		didLoad = true;
	};
	load.fromText = function() {
		didLoad = true;
	};

	try {
		plugin.load(loadArgs, requirejs, load, {});
	}
	catch(e) {
		return false;
	}

	return didLoad;
};


var findBrokenDependencies = function(pool, rjsconfig) {
	var ret = [];
	var deps = {};

	pool.forEach(function(file) {
		deps[file] = getDependencies(file);
	});

	pool.forEach(function(file) {
		var problems = deps[file]
			.filter(function(declaredName) {
				//ignore special 'require' dependency
				return declaredName !== 'require';
			})
			.map(function(declaredName) {
				if (declaredName.search(/!/) !== -1) {
					var rParts = /^(.*)!(.*)$/;
					var parts = declaredName.match(rParts);
					var pluginName = parts[1];
					var pluginArgs = parts[2];

					var plugin;
					try {
						plugin = _getPlugin(pluginName, rjsconfig);
					}
					catch(e) {
						return {
							declared: declaredName,
							resolved: false,
							type: 'plugin',
							name: pluginName,
							args: pluginArgs
						};
					}

					if (!_pluginCanLoad(plugin, pluginArgs)) {
						return {
							declared: declaredName,
							resolved: false,
							type: 'args',
							name: pluginName,
							args: pluginArgs
						};
					}

					return {
						declared: declaredName,
						resolved: Modules.getFile(pluginName, path.dirname(file), rjsconfig),
						type: 'plugin',
						name: pluginName,
						args: pluginArgs
					};
				}

				return {
					declared: declaredName,
					resolved: Modules.getFile(declaredName, path.dirname(file), rjsconfig),
					type: 'module'
				};
			})
			.filter(function(dep) {
				return !dep.resolved;
			});
		ret = ret.concat(problems);
	});

	return ret;
};


module.exports = findBrokenDependencies;
