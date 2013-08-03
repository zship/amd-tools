define(function(require) {

	'use strict';


	//transformed paths (have 'paths' or 'packages' entries in rjsconfig)
	var _transforms = function(rjsconfig) {
		var paths = rjsconfig.paths || [];
		var packages = rjsconfig.packages || [];

		return Object.keys(paths).map(function(key) {
			return {
				from: key,
				to: paths[key]
			};
		})
			.concat(packages.map(function(pkg) {
				return {
					from: pkg.location,
					to: pkg.name
				};
			}))
			.sort(function(a, b) {
				//transform in order from most complex to simplest
				return a.from.length < b.from.length;
			});
	};


	return _transforms;

});
