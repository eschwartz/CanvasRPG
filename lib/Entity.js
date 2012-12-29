/**
 * Entity.js
 * If you prick a spritesheet, does it not bleed?
*/
var Entity = (function() {
	// Named direction mapped to radian angle
	var _degreeMap = {
		// 0 is "right"
		// PI is "left"
		// In fractions of 2 (radians / PI)
		down				: [(15/8), (1/8)],
		downRight		: [(1/8), (3/8)],
		right				: [(3/8), (5/8)],
		upRight			: [(5/8), (7/8)],
		up					: [(7/8), (9/8)],
		upLeft			: [(9/8), (11/8)],
		left				: [(11/8), (13/8)],
		downLeft		: [(13/8), (15/8)],
	}
	
	var entityClass = Class.extend({
		events: new EventListener(),
		vent: new Backbone.Marionette.EventAggregator(),
		
		startingPosition: { x: 0, y: 0 },
		
		velocity: 1.5,			// pixels per second
	
		init: function(options) {
			var self = this;
			
			_.bindAll(this);
			
			this.options = options || {};
			_.extend(this, {
				speed: .2,
			}, this.options);
			
			// Set stage
			if(!this.stage) { throw new Error("A stage must be defined on an entity object"); }
			if(!this.world) { throw new Error("A world must be defined on an entity object"); }
			
		
			// Setup ticker
			if(this.tick) { createjs.Ticker.addListener(this.tick) }
			
			// Create sprite
			this.configureSprite();
			
			// Put him in his place
			this.moveTo(this.startingPosition);
		},
		
		// Setup sprite, with movement animations
		configureSprite: function() {
			var animations = {};
			
			this.spriteOptions || (this.spriteOptions = this.options.spriteOptions);
			this.movements || (this.movements = this.options.movements);
			
			// Require spriteOptions to be set
			if(!this.spriteOptions) { throw new Error("spriteOptions must be set for an entity") };
	
			// Create animations for each movement
			for(var i=0; i<this.movements.length; ++i) {
				var name = this.movements[i].direction;
				var frames = this.movements[i].frames;
				var frequency = this.movements[i].frequency || this.spriteOptions.frequency;
				
				animations[name] = {
					frames: frames,
					next: name,
					frequency: frequency
				}
			}

			// Add movement animations to any other specified animations
			this.spriteOptions.animations = _.extend({}, this.spriteOptions.animations, animations);
			this.sprite = new createjs.SpriteSheet(this.spriteOptions);
			this.animation = new createjs.BitmapAnimation(this.sprite);
			
			// Set starting position
			_.extend(this.animation, this.startingPosition);
			
		},
		
		moveTo: function(toX, toY) {
			var dx, dy, radians, slope, dist, fractions;
			var self = this;
			
			this.vent.trigger("move:start", {x: toX, y: toY });
			
			// Allow params as (x, y) or { x: ..., y: ... }
			if(_.isObject(toX)) { toX = toX.x, toY = toX.y }
			
			// Get fraction of a circle (where 180deg = 1, 360 = 2(0))
			fractions = function(r) {
				r = r/Math.PI
				
				// Return fraction of whole circle (instead of using JS's neg. radians
				if(r < 0) { r = 2 + r	}
				return r;
			}
			
			// Find radian angle between points 
			// (where up = 0, down = 1)
			dx = toX - this.animation.x;
			dy = toY - this.animation.y;
			dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			fraction = fractions(Math.atan2(dx,dy));				// Fraction of 2PI radians
			
			// Find direction matching radian angle
			this.direction = null;
			for(var name in _degreeMap) {
				if(_degreeMap[name][0] < fraction && fraction <= _degreeMap[name][1]) {
					this.direction = name;
					break;
				}
			}
			
			// Assume that if !direction, is up
			// Probably a better way, but...
			if(this.direction === null) { this.direction = "down" }
				
			// Set sprite animation
			this.animation.gotoAndPlay(this.direction);

			// Animate to location
			this.getQueue({ override: true }).to({ x: toX, y: toY }, dist/this.speed, createjs.Ease.linear).call(function() {
				self.stop();
				self.vent.trigger("move:end", { x: toX, y: toY });
			});
		},
		
		getQueue: function(options) {
			options || (options = {});
			// Tween queue
			return this.queue = createjs.Tween.get(this.animation, options);
		},
		
		// Stops the sprite animation, and shows "standing" frame
		stop: function() {
			var frames = this.sprite.getAnimation(this.direction).frames;
			this.animation.gotoAndStop(frames[0]);
		},
		
		tickAction: function() {
		},
		
		setTickAction: function(fn) {
			this.tickAction = fn;
		},
		
		clearTickAction: function() {
			this.tickAction = function() {}
		},
		
		tick: function() {
			this.tickAction.apply(arguments, this);
			this.stage.update();
		}
	});

	return entityClass;
})();
