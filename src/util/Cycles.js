'use strict';

var map = require('mout/object/map');
var deepEquals = require('mout/object/deepEquals');


/**
 * Static utility methods for Arrays which represent a cycling linked list
 * (last element points to the first element).
 */
var Cycles = {};


Cycles.rotated = function(cycle, i) {
	var ret = cycle.slice();
	for (var j = 0; j < i; j++) {
		ret = [ret[ret.length - 1]].concat(ret.slice(0, ret.length - 1));
	}
	return ret;
};


var _equal = function(first, second) {
	return JSON.stringify(first) === JSON.stringify(second);
/*
 *    if (first.length !== second.length) {
 *        return false;
 *    }
 *
 *    for (var i = 0; i < first.length; i++) {
 *        if (!deepEquals(first[i], second[i])) {
 *            return false;
 *        }
 *    }
 *
 *    return true;
 */
};


Cycles.equal = function(first, second) {
	if (_equal(first, second)) {
		return true;
	}
	for (var i = 1; i <= first.length; i++) {
		if (_equal(first, Cycles.rotated(second, i))) {
			return true;
		}
	}
	return false;
};


Cycles.unique = function(loops) {
	return loops.filter(function(loop, i) {
		return !loops.some(function hasDupe(otherLoop, j) {
			if (j >= i) {
				return false;
			}
			return Cycles.equal(loop, otherLoop);
		});
	});
};


//just the standard longest common substring algorithm (for Arrays)
var _longestCommonSublist = function(first, second) {
	var start = 0;
	var max = 0;

	for (var i = 0; i < first.length; i++) {
		for (var j = 0; j < second.length; j++) {
			var x = 0;
			while (first[i + x] === second[j + x]) {
				x++;
				if ((i + x >= first.length) || (j + x >= second.length)) {
					break;
				}
			}
			if (x > max) {
				max = x;
				start = i;
			}
		}
	}

	return first.slice(start, start + max);
};


Cycles.longestCommonSublist = function(first, second) {
	var bestCase = Math.min(first.length, second.length);
	var max = [];

	for (var i = 0; i < first.length; i++) {
		var firstList = Cycles.rotated(first, i);
		for (var j = 0; j < second.length; j++) {
			var secondList = Cycles.rotated(second, j);
			var commonSublist = _longestCommonSublist(firstList, secondList);
			if (commonSublist.length === bestCase) {
				return commonSublist;
			}
			if (commonSublist.length > max.length) {
				max = commonSublist;
			}
		}
	}

	return max;
};


/**
 * If one cycle fully contains another cycle
 */
Cycles.contains = function(first, second) {
	var smaller = first;
	var larger = second;

	if (first.length > second.length) {
		smaller = second;
		larger = first;
	}

	for (var i = 0; i < larger.length; i++) {
		var rotated = Cycles.rotated(larger, i);
		for (var j = 0; j < smaller.length; j++) {
			if (smaller[j] !== rotated[j]) {
				break;
			}
			else if (j === smaller.length - 1) {
				return true;
			}
		}
	}

	return false;
};


module.exports = Cycles;
