/**
 * Hero.js
 * A user-controlled entity
 * requires Entity.js
*/
window.tickTimes = [];
window.getTickTime = function() {
    var sum = tickTimes.reduce(function(a, b) { return a + b; })
    var avg = sum / tickTimes.length;
    return avg;
}
createjs.Hero = (function() {
    var HeroClass = createjs.Entity.extend({
        init: function() {
            var self = this;
            
            this._super.apply(this, arguments);
            
            // Move in right-click
            this.events.bind(this.world.displayObject, "onClick", this.handleRightClick);

            // Handle Collisions -> hard stop
            this.vent.on("collision", this.hardStop, this);
        },
        
        handleRightClick: function(e) {
            var target = this.coord(e);
            
            if(e.nativeEvent.button === 2) {
                this.moveTo(target);
            }
        },

        // Sets this.d/o in front of or behind set entity
        // Based on it's Y position
        // NOTE: Should move to world class
        autoIndex: function(entity) {
            this.world.displayObject.sortChildren(function(a, b) {
                return a.y - b.y;
            })
        },
        
        /* NOTE: all this collidable stuff should be moved to cjs.Entity class */

        // Returns all collidable objects in world
        // NOTE: Should move to world class (maybe pass { ignore: this })
        getCollidables: function() {
            // Remove this displayObject from array
            return _.without(this.world.collidables, this);
        },
        
        collidesWith: function(entity) {
            return this.coord().collidesWith(entity.coord(), this.hitRadius, entity.hitRadius);
        },

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
        
        tick: function() {
            var collisions = this.findCollisions();
            if(collisions) {
                this.vent.trigger("collision", collisions);
            }

            this.autoIndex();

            this._super();
        }
    });
    return HeroClass;
})();