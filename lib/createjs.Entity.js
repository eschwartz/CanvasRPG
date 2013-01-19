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

			// Set starting position
			this.spawn();
		},

		spawn: function(spawnPoint) {
			spawnPoint || (spawnPoint = this.spawnPoint);
			this.displayObject.x = spawnPoint.x;
			this.displayObject.y = spawnPoint.y;

			// Check for collisions -> respawn
			if(this.findCollisions()) {
				this.jumpTo(createjs.Utility.randomCoord(this.world))
			}
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

		jumpTo: function(x, y) {
			var coord = (x instanceof Coordinates)? x: new Coordinates(x, y);
			this.getQueue({ override: true }).to({ x: coord.x, y: coord.y }, 0);
		},

		centerMap: function() {
			this.world.centerMap(this.coord());
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


        // Returns all collidable objects in world
        // NOTE: Should move to world class (maybe pass { ignore: this })
        // TO OPTIMIZE:
        //		Filter collidables array
        //		By proximity to this
        //		Proximity ~= speed/frame
        getCollidables: function() {
        	var self = this;

            return _.filter(this.world.collidables, function(entity) {
            	// Simple distance detection, for higher performance
            	var dX = Math.abs(entity.displayObject.x - self.displayObject.x);
            	var dY = Math.abs(entity.displayObject.y - self.displayObject.y);

            	// NOTE: Vicinity should be ~= to pixels/second speed
            	//	But I think speed isn't clearly implemented well in this class
            	var vicinity = 20;		// distance to check

            	// Check that this isn't me
            	if(entity == self) { return false };

            	return (dX - vicinity < 0) || (dY - vicinity < 0);
            })
        },

        collidesWith: function(entity) {
            return this.coord().collidesWith(entity.coord(), this.hitRadius, entity.hitRadius);
        },


        // Returns an array of all entities that we collide with
        // or false
        findCollisions: function() {
            var collidables = this.getCollidables();
            var collisions = [];

            for(var i=0; i < collidables.length; ++i) {
                var hit = this.collidesWith(collidables[i]);

                if(hit) {
                    collisions.push(collidables[i]);
                }
            }
            return (collisions.length > 0)? collisions: false;
        },

        // Check if we're in the general vicinity of an entity
        // Our stage will be our "vicinity"
        inVicinityOf: function(entity) {
            var hitRadius = Math.max(this.stage.canvas.width, this.stage.canvas.height);
            return this.coord().collidesWith(entity.coord(), this.hitRadius, hitRadius)
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

			$('#fps').text(createjs.Ticker.getMeasuredFPS().toFixed(0));
		}
	});

	return entityClass;
})();
