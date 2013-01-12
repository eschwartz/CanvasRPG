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
        
        collides: function(a, b) {
            console.log(a.coord().x, b.coord().x + b.displayObject.width);
            console.log(a.coord().x + a.displayObject.width, b.coord().x);
            console.log(a.coord().y, b.coord().y + b.displayObject.height);
            console.log(a.coord().y + a.displayObject.height, b.coord().y);
            return a.coord().x < b.coord().x + b.displayObject.width &&
                    a.coord().x + a.displayObject.width > b.displayObject.coord().x &&
                    a.coord().y < b.coord().y + b.displayObject.height &&
                    a.coord().y + a.displayObject.height > b.coord().y;
        },
        
        tick: function() {
            /*var collidables = this.getCollidables();
            
            for(var i=0; i < collidables.length; ++i) {
                var collision = this.collides(this, collidables[i]);
                if(collision) {
                    console.log('hit: ', collision);
                }
            }*/

            this._super();
        }
    });
    return HeroClass;
})();