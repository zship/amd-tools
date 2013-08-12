define(function(require) {

	'use strict';


	var fs = require('fs');
	var path = require('path');

	var esprima = require('esprima');
	var get = require('mout/object/get');
	var amdRequire = require('node-amd-require');

	var getDependencies = require('./ast/getDependencies');
	var resolve = require('./modules/resolve');
	var normalize = require('./modules/normalize');


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

		try {
			var state = amdRequire.save();
			amdRequire(rjsconfig);
			var cwd = process.cwd();
			process.chdir(rjsconfig.baseUrl);
			plugin.load(loadArgs, require, load, {});
			process.chdir(cwd);
			amdRequire.restore(state);
		}
		catch(e) {
			return false;
		}

		return didLoad;
	};


	var findBrokenDependencies = function(file, rjsconfig) {
		var deps = [];

		try {
			//can throw an Error if a module is not a valid AMD module
			var ast = esprima.parse(fs.readFileSync(file, 'utf8'), {
				loc: true,
				range: true
			});
			deps = getDependencies(ast);
		}
		catch (e) {
			//if it's shimmed, consider it a valid module and use shim deps
			var id = normalize(rjsconfig, file);
			deps = get(rjsconfig, 'shim.' + id + '.deps') || [];
			deps = deps.map(function(name) {
				return {
					value: name,
					shimmed: true
				};
			});
		}

		return deps
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
