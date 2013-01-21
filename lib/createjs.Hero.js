/**
 * Hero.js
 * A user-controlled entity
 * requires Entity.js
*/
createjs.Hero = (function() {
    var HeroClass = createjs.Entity.extend({
        init: function() {
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
            // This probably belongs in world.tick
            // Could optimize by only indexing nearby collidables?
            this.world.autoIndex();

            if(this._super) { this._super() };
        }
    });
    return HeroClass;
})();
