/**
 * createjs.PassiveObject
 * it just... sits there.
*/
if(!createjs) { throw new Error("PassiveObject class requires createjs library"); }

createjs.PassiveObject = (function() {
	var PassiveObject = createjs.GameObject.extend({
		configureDisplayObject: function() {
			var options;

			// Require image
			if(!this.spriteOptions || !this.spriteOptions.image) {
				throw new Error("PassiveObject requires an spriteOptions.image property");
			}

			// Preload image
			if(!this.spriteOptions.image.complete) {
				throw new Error("PassiveObject requires preloaded spriteOptions.image.");
			}

			// Set default sprite options
			// Location of sprite on spritesheet
			// Defaults to full image
			options = this.spriteOptions = _.extend({
				x: 0,
				y: 0,
				regX: 0,
				regY: 0,
				width: this.spriteOptions.image.width,
				height: this.spriteOptions.image.height
			}, this.spriteOptions)

			// Create the bitmap object
			this.displayObject = new createjs.Bitmap(options.image);

			// Specify area of spritesheet to draw
			this.displayObject.sourceRect = new createjs.Rectangle(options.x, options.y, options.width, options.height);
			this.displayObject.regX = options.regX;
			this.displayObject.regY = options.regY;
		}
	});

	return PassiveObject;
})();
