/**
 * Hero.js
 * A user-controlled entity
 * requires Entity.js
*/
createjs.Hero = (function() {
    var HeroClass = createjs.Entity.extend({
        init: function() {
            var self = this;
            
            this._super.apply(this, arguments);
            
            // Move in right-click
            this.events.bind(this.world.displayObject, "onClick", this.handleRightClick);
        },
        
        handleRightClick: function(e) {
            var target = this.coord(e);
            
            if(e.nativeEvent.button === 2) {
                this.moveTo(target);
            }
        },
        
        getCollidables: function() {
            // Remove this displayObject from array
            return _.without(this.world.collidables, this);
        },
        
        collidesWith: function(entity) {
            return this.coord().collidesWith(entity.coord(), this.hitRadius, entity.hitRadius);
        },
        
        tick: function() {
            var collidables = this.getCollidables();
            
            for(var i=0; i < collidables.length; ++i) {
                var collision = this.collidesWith(collidables[i]);
                if(collision) {
                    console.log('hit: ', collidables[i]);
                }
            }

            this._super();
        }
    });
    return HeroClass;
})();