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
			
			// On move, center world on hero (if out of viewport)
  		this.vent.on("move:start", function(toCoord) {
				//self.world.centerMap({ x: 210, y: 210 });
			});
		},
		
		handleRightClick: function(e) {
			var target = this.coord(e);
			
			if(e.nativeEvent.button === 2) {
				this.moveTo(target);
			}
		}
	});
	return HeroClass;
})();