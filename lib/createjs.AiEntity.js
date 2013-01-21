/**
 * createjs.AiEntity.js
 * entities controlled by computer
*/
if(!createjs) { throw new Error("AiEntity class requires createjs library "); }

createjs.AiEntity = (function() {
	var AiEntity = createjs.Entity.extend({
		init: function() {
			this._super();

			// Defualt domain
			this.domain = _.extend({
				x: 0,
				y: 0,
				width: this.world.width,
				height: this.world.height
			}, this.domain)

			// Move around town, with the lates in AI intelligence
			this.randomMove();
			this.vent.on("collision", this.randomMove)
		},

		isInDomain: function() {
			var coord = this.coord();
			return coord.x >= this.domain.x
				&& coord.x <= this.domain.x + this.world.width
				&& coord.y >= this.domain.y
				&& coord.y <= this.domain.y + this.world.height;
		},

		randomMove: function() {
			var target = createjs.Utility.randomCoord(this.domain);
				console.log(target);

			// Calling this.randomMove creates infinite loop
			// Probably a bad idea to hardcode this in, but will work for now
			// 	eg. How do I stop? Object cleanup?
			this.moveTo(target, this.randomMove);
		},

		tick: function() {
			if(this._super) { this._super(); }

			// This is actually redundant
			// if `this.randomMove` only sets
			// targets within domain area
			if(!this.isInDomain) {
				//this.vent.trigger("collision");
			}
		}
	});

	return AiEntity;
})();
