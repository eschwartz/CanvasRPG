/**
 * Coordinates
 * A generalized coordinate system
 *
 * Requires:
 * 	Resig's Class inheritance object (Class)
 *	Underscore
*/
if(
		!_.isObject(Class) ||
		!_.isFunction(Class.extend)
	) {
	throw new Error("Coordinates class requires John Resig's `Class` Inheritence object. Check it out: http://ejohn.org/blog/simple-javascript-inheritance/");
}
if(window.Coordinates) {
	throw new Error("Naming conflict: Unable to build Coordinates class. window.Coordinates already exists");
}

if(!_) {
	throw new Error("Coordinates class requires Underscore JS library");
}
window.Coordinates = (function(_) {
	var _fractionMap = {
		down				: [(15/8), (1/8)],			// 0
		downRight		: [(1/8), (3/8)],			 	// .25
		right				: [(3/8), (5/8)],				// .5
		upRight			: [(5/8), (7/8)],				// .75
		up					: [(7/8), (9/8)],				// 1
		upLeft			: [(9/8), (11/8)],			// 1.25
		left				: [(11/8), (13/8)],			// 1.5
		downLeft		: [(13/8), (15/8)]			// 1.75
	}
	
	
	var ThisClass = Class.extend({		
		defaults: {
			x							: 0,
			y							: 0,
			isMouseEvent	: false,
		},
		
		init: function(coordX, coordY) {
			_.bindAll(this);
			
			// Extend with defaults
			_.extend(this, this.defaults);
			
			// Param form: (mouse event)
			if(coordX instanceof MouseEvent) {
				this.x =  coordX.offsetX; this.y = coordX.offsetY;
				this.isMouseEvent = true;
			}
			
			// Param format: ({ x: [x], y: [y] })
			else if(_.isObject(coordX) && ('x' in coordX) && ('y' in coordX)) {
				this.x = coordX.x, this.y = coordX.y;
			}
			
			
			// Param format: (x, y)
			else if(_.isNumber(coordX) && _.isNumber(coordY) && !isNaN(coordX) && !isNaN(coordY) ) {
				this.x = coordX; this.y = coordY;
			}
			
			// Invalid number format
			else {
				throw new Error("Invalid coordinates");
			}
			
		},
		
		// returns a new coordinates (for chaining, profit)
		coord: function(coordX, coordY) {
			return new ThisClass(coordX, coordY);
		},
		
		radiansTo: function(x, y) {
			var target, dx, dy;
			target = (x instanceof ThisClass)? x: this.coord(x,y);
			
			dx = target.x - this.x;
			dy = target.y - this.y;
			
			return Math.atan2(dx, dy);
		},
		
		// Get fraction of a circle (where 180deg = 1, 360 = 2(0))
		fractionTo: function(x, y) {
			var fraction;
			var radiansOfPi = this.radiansTo(x, y)/Math.PI;
			
			// Set radians as positive fraction of 2
			fraction = (radiansOfPi < 0)? 2 + radiansOfPi: radiansOfPi;
			return fraction;
		},
		
		distanceTo: function(x, y) {
			var target, dx, dy;
			target = (x instanceof ThisClass)? x: new ThisClass(x, y, this.obj);
			
			dx = target.x - this.x;
			dy = target.y - this.y;
			
			return Math.sqrt( Math.pow(dx, 2) + Math.pow(dy, 2) );
		},
		
		directionTo: function(x, y) {
			var fractionTo = this.fractionTo(x, y);
			var direction = null;
			
			for(var name in _fractionMap) {
				if(_fractionMap[name][0] < fractionTo && fractionTo <= _fractionMap[name][1]) {
					direction = name;
					break;
				}
			}
			
			// Assume that if !direction, is up
			// Probably a better way, but...
			if(direction === null) { direction = "down" }
			
			return direction;
		},

		// Determines whether this coordinate collides with another coordinate
		// 
		collidesWith: function(x, y, myHitRadius, theirHitRadius) {
			var targetCoord;
			var squareDist;

			// Process param formats:
			// x, y, myHitRadius, theirHitRadius
			// x, y, myHitRadius
			// coord, myHitRadius, theirHitRadius
			// coord, myHitRadius
			if(_.isObject(arguments[0])) {
				targetCoord = new ThisClass(x);
				myHitRadius = arguments[1];
				theirHitRadius = arguments[2] || arguments[1];
			}
			else {
				targetCoord = new ThisClass(arguments[0], arguments[1]);
				myHitRadius = arguments[2];
				theirHitRadius = arguments[3] || argumnets[2];
			}

			// Apparently, this is not optimized, because of sqrt calculation in distanceTo
			// See: http://devmag.org.za/2009/04/13/basic-collision-detection-in-2d-part-1/
			// 	for a better solution (fairly simple, but I'm lazy today)
			return this.distanceTo(targetCoord) <= myHitRadius + theirHitRadius
		}
		
		/**
		 * Then... 
		 * We want all of our movement-related methods in Entity/World classes
		 * to use Coordinates instance as parameter
		 * And to convert to Coordinates instance for all business logic
		*/
	});
	
	return ThisClass;
})(_);
