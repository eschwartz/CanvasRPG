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
			this.events.bind(this.world.displayObject, "onClick", function(e) {
				var target = {
					x: e.stageX - self.world.displayObject.x,
					y: e.stageY - self.world.displayObject.y
				};
				
				// Right-click - move to point
				if(e.nativeEvent.button === 2) {
					self.moveTo(target.x, target.y);
				}
			});
			
			// On move, center world on hero (if out of viewport)
  		this.vent.on("move:start", function(toCoord) {
				//self.world.centerMap({ x: 210, y: 210 });
			});
		}
	});
	return HeroClass;
})();