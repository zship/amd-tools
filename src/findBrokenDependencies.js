define(function(require) {

	'use strict';


	var path = require('path');

	var getDependencies = require('./getDependencies');
	var resolve = require('./modules/resolve');


	var _getPlugin = function(pluginName, dir, rjsconfig) {
		var file = resolve(pluginName, dir, rjsconfig);
		var plugin = require(file);

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


	var findBrokenDependencies = function(file, rjsconfig) {
		return getDependencies(file)
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
						plugin = _getPlugin(pluginName, path.dirname(file), rjsconfig);
					}
					catch(e) {
						return {
							parent: file,
							declared: declaredName,
							resolved: false,
							type: 'plugin',
							pluginName: pluginName,
							pluginArgs: pluginArgs
						};
					}

					if (!_pluginCanLoad(plugin, pluginArgs)) {
						return {
							parent: file,
							declared: declaredName,
							resolved: false,
							type: 'args',
							pluginName: pluginName,
							pluginArgs: pluginArgs
						};
					}

					return {
						parent: file,
						declared: declaredName,
						resolved: resolve(pluginName, path.dirname(file), rjsconfig),
						type: 'plugin',
						pluginName: pluginName,
						pluginArgs: pluginArgs
					};
				}

				return {
					parent: file,
					declared: declaredName,
					resolved: resolve(declaredName, path.dirname(file), rjsconfig),
					type: 'module'
				};
			})
			.filter(function(dep) {
				return !dep.resolved;
			});
	};


	return findBrokenDependencies;

});
