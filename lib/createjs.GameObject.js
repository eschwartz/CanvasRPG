/**
 * createjs.GameObject
 * Base class for all display object controllers
*/
if(!createjs) { throw new Error("Entity class requires createjs library"); }
createjs.GameObject = (function() {
	var ThisClass = Class.extend({
		events: new EventListener(),
		vent: new Backbone.Marionette.EventAggregator(),

		spawnPoint: { x: 0, y: 0 },

		init: function(options) {
			// To prevent headaches....
			_.bindAll(this);

			// Pull options into object
			this.options = options || {};
			_.extend(this, options);

			// Set world/stage
			if(!this.world) { throw new Error("A world must be defined on an entity object"); }
			this.stage = this.world.stage;

			// Get the ol' ticker thumpin
			if(this.tick) { createjs.Ticker.addListener(this.tick) }

			// Create my display object
			this.configureDisplayObject();
			if(!this.displayObject || !(this.displayObject instanceof createjs.DisplayObject)) {
				throw new Error("Failed to configure GameObject's displayObject");
			}

			// Join the world of men.
			this.spawn();
		},

		// Create and configure this.displayObject
		// This should be overwritten for different types of d/o's
		configureDisplayObject: function() {
			this.displayObject = new createjs.DisplayObject();

			// Setup defualt options for this.displayObject
			this.displayOptions || (this.displayOptions = {});
			_.extend(this.displayObject, this.displayOptions);
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

		spawn: function(spawnPoint) {
			var coord;

			spawnPoint || (spawnPoint = this.spawnPoint);
			this.displayObject.x = spawnPoint.x;
			this.displayObject.y = spawnPoint.y;

			// Check for collisions -> respawn
			if(this.findCollisions()) {
				coord = createjs.Utility.randomCoord(this.world);
				this.displayObject.x = coord.x;
				this.displayObject.y = coord.y;
			}
		},

		// Center the map on this object
		centerMap: function() {
			this.world.centerMap(this.coord());
		},


        // Returns nearby collidables
        getCollidables: function() {
        	var self = this;

        	// Return only nearby entities, to optimize
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
        // returns false, if none
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
        }

	})

	return ThisClass;
})();
