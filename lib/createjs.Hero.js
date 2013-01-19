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


        tick: function() {
            // Detect collisions
            var collisions = this.findCollisions();
            if(collisions) {
                this.vent.trigger("collision", collisions);
            }

            // This probably belongs in world.tick
            // Could optimize by only indexing nearby collidables?
            this.world.autoIndex();

            this._super();
        }
    });
    return HeroClass;
})();
