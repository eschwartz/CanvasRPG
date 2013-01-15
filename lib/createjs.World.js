/**
 * World.js
 * Everyone has to live somewhere...
*/
if(!createjs) { throw new Error("World object required EaselJS library"); }
createjs.World = (function() {
	var _events = new EventListener();
	
	var worldClass = Class.extend({	
		vent: new Backbone.Marionette.EventAggregator(),
		
		collidables: [],
			
		init: function(options) {
			var self = this;
			
			_.bindAll(this);
			
			// Set default options
			options || (options = {});
			_.extend(this, {
				width: 1200,
				height: 1200,
				scrollBounds: 100,					// Size of scrolling edge hotspot
				scrollVelocity: 15
			}, options);
			this.startPosition = this.startPosition || { x: this.width / 2, y: this.height / 2 };
			
			// Create world container display object
			this.displayObject = new createjs.Container();
			
			// Ticker
			createjs.Ticker.addListener(this.tick);
			
			// Set world size, pattern, starting location
			this.configure();
			
			// Move world on mouse -> edge
			this.stage.canvas.onmousemove = this.handleMouseMove;
			this.stage.canvas.onmouseout = this.clearTickAction;
			
			// Move world on click
			_events.bind(this.stage.canvas, "onclick", this.centerMap);
		},
		
		// Checks if x, y coordinates on world is within the canvas "viewport"
		isInViewport: function(x, y) {
			var coord = {x: x, y: y};
			
			// Allow params as object ( { x: ..., y: ... } )
			if(x.x && x.y) {
				coord.x = x.x; coord.y = x.y;
			}
			
			isInView = {
				x: (coord.x >= -this.displayObject.x) && (coord.x <= -this.displayObject.x + this.stage.canvas.width),
				y: (coord.y >= -this.displayObject.y) && (coord.y <= -this.displayObject.y + this.stage.canvas.height)
			}
			
			return (isInView.x && isInView.y);
		},
		

        // Sorts entities "z-index"
        // based on their `y` coord
        autoIndex: function() {
            this.displayObject.sortChildren(function(a, b) {
                return a.y - b.y;
            })
        },

		centerMap: function(coord) {
			target = this.coord(coord);
			
			/*target = {
				x: this.displayObject.x + (this.stage.canvas.width / 2) - coord.x,
				y: this.displayObject.y + (this.stage.canvas.height / 2) - coord.y,
			}*/

			this.moveTo({
				x: (target.x * -1) + (this.stage.canvas.width / 2),
				y: (target.y * -1) + (this.stage.canvas.height / 2)
			});
		},
		
		// Returns coord object for x,y location,
		// relative to world map			
		coord: function(x, y) {
			// Mouse event param: return mouse coordinates
			if(x instanceof createjs.MouseEvent) {
				return new Coordinates(this.displayObject.globalToLocal(x.stageX, x.stageY));
			}
			
			// No params: Returns coordinates relative to stage
			else if(_.isUndefined(x) || _.isNull(x)) {
				return new Coordinates(this.displayObject.localToGlobal(this.displayObject.regX, this.displayObject.regY));
			}
			
			else {
				return new Coordinates(x, y);
			}
		},
		
		// Move world on mouse -> edge
		handleMouseMove: function(e) {
			var self = this;
			var mX = e.offsetX, mY = e.offsetY;																							// mouse location
			var wX = this.displayObject.x, wY = this.displayObject.y;																// World location (in relation to stage);
			var wH = this.height, wW = this.width;
			var cW = this.stage.canvas.width, cH = this.stage.canvas.height;								// Canvas width/height
			
			var edgeWidth = this.scrollBounds;																							// Pixel size of edge (within which world will move)
			var topVelocity = this.scrollVelocity;																					// Max pixels per frame to move the world
			
			var mouseDepth = {																															// Depth of mouse into edge (as % of edgeWidth)
				x: (1 - (Math.min(mX, cW - mX)) / edgeWidth),
				y: (1 -(Math.min(mY, cH - mY)) / edgeWidth),
			}
			var isInEdge = { x: mouseDepth.x > 0, y:  mouseDepth.y > 0 };
			
			// Set velocity proportional to mouse depth into edge (moves faster at edge than center)
			var v = (isInEdge.x)? topVelocity * mouseDepth.x: topVelocity * mouseDepth.y;
			
			// How far to move the world per frame
			var dWorld = {
				x: v * -( (2 * mX/cW) - 1),
				y: v * -( (2 * mY/cH) - 1)
			}
			
			// Mouse not in edge -> all done here...
			if(!isInEdge.x && !isInEdge.y) { 
				this.clearTickAction();
				return; 
			}
			
			// Move the world
			this.setTickAction(function() {
				var target = { x: self.displayObject.x + dWorld.x, y: self.displayObject.y + dWorld.y };
				this.moveTo(target);
			});
		},
		
		moveTo: function(target) {
			var x = target.x, y = target.y;
			// Left edge
			if( target.x >= 0) {
				x = 0;
			}									
			
			// Right edge	
			if( target.x <= this.stage.canvas.width - this.width) {
				x = this.stage.canvas.width - this.width;
			}		
			
			// Top edge
			if( target.y > 0) {
				y = 0;
			}
			
			// Bottom edge
			if( target.y <= this.stage.canvas.height - this.height) {
				y = this.stage.canvas.height - this.height
			}
			
			this.displayObject.x = x;
			this.displayObject.y = y;
		},
		
		setTickAction: function(fn) {
			if( !_.isFunction(fn)) { throw new Error("Invalid tick action"); return; }
			this.tickAction = fn;
		},
		
		clearTickAction: function() {
			this.tickAction = null;
		},
		
		tick: function() {
			if(this.tickAction) { this.tickAction(); }
		},
		
		// Create the world shape, and set pattern texture
		configure: function() {
			var graphic = new createjs.Graphics();
			var shape = new createjs.Shape();
			var self = this;
			
			
			// Ensure loaded pattern
			// Kind of clunky... but hey.
			if(this.pattern instanceof Image && !this.pattern.complete) {		// Not-loaded image
				var oldOnload = this.pattern.onload || function() {};
				this.pattern.onload = function() {
					oldOnload();
					self.configure.apply(self);
				}
				return;
			}
			else if(_.isString(this.pattern)) {
				var src = this.pattern;
				this.pattern = new Image();
				this.pattern.src = src;
				this.pattern.onload = this.configure;
				return;
			}
			
			// Create graphic
			if(this.pattern) { graphic.beginBitmapFill(this.pattern); }
			graphic.setStrokeStyle(20);
			graphic.beginStroke(createjs.Graphics.getRGB(0,0,0));
			graphic.rect(0, 0, this.width, this.height);
			
			// Create shape (to hold graphic)
			shape.x = 0;
			shape.y = 0;
			shape.graphics = graphic;
			
			// Add shape/graphic display to map (at lowest z-index)
			this.displayObject.addChildAt(shape,0);
			
			this.centerMap(this.startPosition);
		},
		
		addChild: function(child) {
			if(!(child instanceof createjs.Entity) && !(child instanceof createjs.DisplayObject)) {
				throw new Error("Unable to add child to World: invalid child object.");
			}
			child = (child instanceof createjs.Entity)? child.displayObject: child;
			this.displayObject.addChild(child);
			
			return child;
		},
		
		addEntity: function(child) {
			this.displayObject.addChild(child.displayObject);
			this.collidables.push(child);
		}
	});
	
	return worldClass;
})();