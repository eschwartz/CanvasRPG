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

            // Handle Collisions
            this.vent.on("collision", this.handleCollision, this);
        },
        
        handleRightClick: function(e) {
            var target = this.coord(e);
            
            if(e.nativeEvent.button === 2) {
                this.moveTo(target);
            }
        },

        handleCollision: function(entity) {
            // Stop moving
            this.stop();

            // Handle z-indexes
            this.autoIndex(entity);
        },

        // Sets this.d/o in front of or behind set entity
        // Based on it's Y position
        autoIndex: function(entity) {
            this.world.displayObject.sortChildren(function(a, b) {
                return a.y - b.y;
            })
        },
        
        getCollidables: function() {
            // Remove this displayObject from array
            return _.without(this.world.collidables, this);
        },
        
        collidesWith: function(entity) {
            return this.coord().collidesWith(entity.coord(), this.hitRadius, entity.hitRadius);
        },

        // Check if we're in the general vicinity of an entity
        // Our stage will be our "vicinity" 
        inVicinityOf: function(entity) {
            var hitRadius = Math.max(this.stage.canvas.width, this.stage.canvas.height);
            return this.coord().collidesWith(entity.coord(), this.hitRadius, hitRadius)
        },
        
        tick: function() {
            var collidables = this.getCollidables();
            var collision, vicinity;
            
            for(var i=0; i < collidables.length; ++i) {
                var collision = this.collidesWith(collidables[i]);

                if(collision) {
                    this.vent.trigger("collision", collidables[i]);
                }

                this.autoIndex();
            }

            this._super();
        }
    });
    return HeroClass;
})();