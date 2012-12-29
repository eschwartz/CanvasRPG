/**
 * Entity.js
 * If you prick a spritesheet, does it not bleed?
*/
if(!createjs) { throw new Error("Entity class requires createjs library"); }
createjs.Entity = (function() {
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
		
		spawnPoint: { x: 0, y: 0 },
		
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
			this.moveTo(this.spawnPoint);
		},
		
		// Returns coord object for x,y location,
		// relative to world map			
		coord: function(x, y) {
			// Return mouse coordinates
			if(x instanceof createjs.MouseEvent) {
				return new Coordinates(this.world.displayObject.globalToLocal(x.stageX, x.stageY));
			}
			
			// Return display object coordinates
			else if(_.isUndefined(x) || _.isNull(x)) {
				return new Coordinates(this.displayObject.localToLocal(this.displayObject.regX, this.displayObject.regY, this.world.displayObject));
			}
			
			else {
				return new Coordinates(x, y);
			}
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
			this.displayObject = new createjs.BitmapAnimation(this.sprite);
			
			// Set starting position
			_.extend(this.displayObject, this.spawnPoint);
		},
		
		moveTo: function(toX, toY) {
			var self = this;
			var here = this.coord();
			var target = new Coordinates(toX, toY);
			var distance = here.distanceTo(target);
			var duration = distance / this.speed;
			this.direction = here.directionTo(target);
			
			// Trigger start
			this.vent.trigger("move:start", target);
			
			// Play walking animation
			this.displayObject.gotoAndPlay(this.direction);
			
			// Move animation object to target location
			this.getQueue({ override: true }).to({ x: target.x, y: target.y }, duration, createjs.Ease.linear).call(function() {
				self.stop();
				self.vent.trigger("move:end", target);
			});
		},
		
		getQueue: function(options) {
			options || (options = {});
			// Tween queue
			return this.queue = createjs.Tween.get(this.displayObject, options);
		},
		
		// Stops the sprite animation, and shows "standing" frame
		stop: function() {
			var frames = this.sprite.getAnimation(this.direction).frames;
			this.displayObject.gotoAndStop(frames[0]);
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
