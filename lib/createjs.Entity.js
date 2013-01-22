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

	var entityClass = createjs.GameObject.extend({

		speed: .2,				// not sure of the real meaning of this...

		// Setup sprite, with movement animations
		configureDisplayObject: function() {
			var animations = {};

			this.spriteOptions || (this.spriteOptions = this.options.spriteOptions);
			this.movements || (this.movements = this.options.movements) || (this.movements = []);

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
		},

		spawn: function() {
			this._super.apply(this, arguments);
			this.displayObject.gotoAndStop("down");
		},

		moveTo: function(toX, toY, callback) {
			var self = this;
			var here = this.coord();
			var target = new Coordinates(toX, toY);
			var distance = here.distanceTo(target);
			var duration = distance / this.speed;

			// Bound by world
			target.x = (target.x - this.hitRadius <= 0)? this.hitRadius: target.x;
			target.x = (target.x + this.hitRadius >= this.world.width)? this.world.width - this.hitRadius: target.x;

			target.y = (target.y - this.hitRadius <= 0)? this.hitRadius: target.y;
			target.y = (target.y + this.hitRadius >= this.world.height)? this.world.height - this.hitRadius: target.y;

			this.direction = here.directionTo(target);

			_.isFunction(callback) || (callback = function() {});

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

		rest: function(duration) {
			var coord = this.coord();
			var self = this;
			duration || (duration = 1000);

			this.vent.trigger("move:start", coord);
			window.setTimeout(function() {
				self.vent.trigger("move:end", coord);
			}, duration)
		},

		jumpTo: function(x, y) {
			var coord = (x instanceof Coordinates)? x: new Coordinates(x, y);
			this.getQueue({ override: true }).to({ x: coord.x, y: coord.y }, 0);
		},

		getQueue: function(options) {
			options || (options = {});
			// Tween queue
			return this.queue = createjs.Tween.get(this.displayObject, options);
		},

		// Stops the sprite animation, and shows "standing" frame
		stop: function() {
			// Stop movement
			this.jumpTo(this.coord());

			// Set to "standing" frame (assumed to be frame 0)
			if(!this.sprite.getAnimation(this.direction)) { return; }
			var frames = this.sprite.getAnimation(this.direction).frames;
			this.displayObject.gotoAndStop(frames[0]);
		},

		// Like stop, but pulls back the entity a bit
		// Useful to prevent 'ghosting' through a collidable
		hardStop: function() {
			this.queue.setPosition(this.queue.position - 50 || 50, createjs.Tween.REVERSE);
			this.stop();
		},

		tick: function() {
            // Detect collisions
            var collisions = this.findCollisions();
            if(collisions) {
                this.vent.trigger("collision", collisions);
            }
		}
	});

	return entityClass;
})();
