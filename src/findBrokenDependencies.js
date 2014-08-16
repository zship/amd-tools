define(function(require) {

	'use strict';


	var fs = require('fs');
	var path = require('path');

	var amdRequire = require('node-amd-require');

	var getDependencies = require('./getDependencies');
	var resolve = require('./modules/resolve');


	var _getPlugin = function(pluginName, dir, rjsconfig) {
		var plugin;

		try {
			var file = resolve(rjsconfig, dir, pluginName);
			var state = amdRequire.save();
			amdRequire(rjsconfig);
			plugin = require(file);
			amdRequire.restore(state);
		}
		catch(e) {
			return;
		}

		if (!plugin || !plugin.load) {
			return;
		}

		return plugin;
	};


	var _pluginCanLoad = function(plugin, loadArgs, rjsconfig) {
		var didLoad = false;
		var load = function() {
			didLoad = true;
		};
		load.fromText = function() {
			didLoad = true;
		};

		var cwd = process.cwd();
		var state = amdRequire.save();
		try {
			amdRequire(rjsconfig);
			process.chdir(rjsconfig.baseUrl);
			// optimization: if require.toUrl is used by the plugin, assume
			// compilation will follow and exit early if the path is valid
			require.toUrl = function(name) {
				var resolved;
				if (name && name.indexOf('.') === 0) {
					resolved = path.resolve(rjsconfig.baseUrl, name);
				}
				resolved = path.resolve(name);
				if (fs.existsSync(resolved)) {
					throw 'pass';
				}
				else {
					throw 'fail';
				}
			};
			plugin.load(loadArgs, require, load, {});
			process.chdir(cwd);
			amdRequire.restore(state);
		}
		catch(e) {
			process.chdir(cwd);
			amdRequire.restore(state);
			if (e === 'pass') {
				return true;
			}
			return false;
		}

		return didLoad;
	};


	var findBrokenDependencies = function(rjsconfig, file) {
		return getDependencies(rjsconfig, file)
			.filter(function(node) {
				//ignore special 'require' dependency
				return node.value !== 'require';
			})
			.map(function(node) {
				var declaredName = node.value;

				if (declaredName.search(/!/) !== -1) {
					var rParts = /^(.*)!(.*)$/;
					var parts = declaredName.match(rParts);
					var pluginName = parts[1];
					var pluginArgs = parts[2];

					var plugin;
					if (!(plugin = _getPlugin(pluginName, path.dirname(file), rjsconfig))) {
						return {
							ast: node,
							declared: declaredName,
							resolved: false,
							type: 'plugin',
							pluginName: pluginName,
							pluginArgs: pluginArgs
						};
					}

					if (!_pluginCanLoad(plugin, pluginArgs, rjsconfig)) {
						return {
							ast: node,
							declared: declaredName,
							resolved: false,
							type: 'args',
							pluginName: pluginName,
							pluginArgs: pluginArgs
						};
					}

					return {
						ast: node,
						declared: declaredName,
						resolved: resolve(rjsconfig, path.dirname(file), pluginName),
						type: 'plugin',
						pluginName: pluginName,
						pluginArgs: pluginArgs
					};
				}

				var dep = {
					ast: node,
					declared: declaredName,
					resolved: resolve(rjsconfig, path.dirname(file), declaredName),
				};

				if (node.shimmed) {
					dep.type = 'shimmed';
				}
				else {
					dep.type = 'module';
				}

				return dep;
			})
			.filter(function(dep) {
				return !dep.resolved;
			});
	};


	return findBrokenDependencies;

});
