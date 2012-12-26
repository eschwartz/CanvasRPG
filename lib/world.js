/**
 * World.js
 * Everyone has to live somewhere...
*/
var World = (function() {
	var _events = new EventListener();
	
	var worldClass = Class.extend({	
		vent: new Backbone.Marionette.EventAggregator(),
			
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
			this.container = new createjs.Container();
			
			// Ticker
			createjs.Ticker.addListener(this.tick);
			
			// Set world size, pattern, starting location
			this.configure();
			
			// Move world on mouse -> edge
			this.stage.canvas.onmousemove = this.handleMouseMove;
			this.stage.canvas.onmouseout = this.clearTickAction;
			
			// Move world on click
			_events.bind(this.stage.canvas, "onclick", this.centerMap);
			_events.bind(this.stage.canvas, "onclick", function() { console.log('better click', this); });
		},
		
		centerMap: function(coord) {
			var x, y;
			var target;
			x = (coord instanceof MouseEvent)? coord.offsetX: coord.x;
			y = (coord instanceof MouseEvent)? coord.offsetY: coord.y;
			
			if(!_.isNumber(x) || !_.isNumber(y)) { throw new Error("Unable to center map: invalid coordinates"); }
			
			target = {
				x: this.container.x + (this.stage.canvas.width / 2) - x,
				y: this.container.y + (this.stage.canvas.height / 2) - y,
			}
			this.moveTo(target);
		},
		
		// Move world on mouse -> edge
		handleMouseMove: function(e) {
			var self = this;
			var mX = e.offsetX, mY = e.offsetY;																							// mouse location
			var wX = this.container.x, wY = this.container.y;																// World location (in relation to stage);
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
				var target = { x: self.container.x + dWorld.x, y: self.container.y + dWorld.y };
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
			
			this.container.x = x;
			this.container.y = y;
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
			this.container.addChildAt(shape,0);
			
			this.centerMap(this.startPosition);
		},
		
		addChild: function(child) {
			child = (child instanceof Entity)? child.animation: child;
			this.container.addChild(child);
		}
	});
	
	return worldClass;
})();