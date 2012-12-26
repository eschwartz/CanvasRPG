/**
 * World.js
 * Everyone has to live somewhere...
*/
var World = (function() {
	var worldClass = Class.extend({		
		init: function(options) {
			_.bindAll(this);
			
			options || (options = {});
			_.extend(this, {
				width: 1200,
				height: 1200,
				center: { x: 400, y: 300 }
			}, options);
			
			this.container = new createjs.Container();
			
			// Ticker
			createjs.Ticker.addListener(this.tick);
			
			// Set world size, pattern, starting location
			this.configure();
			
			// Move world on mouse -> edge
			this.stage.canvas.onmousemove = this.handleMouseMove;
			this.stage.canvas.onmouseout = this.clearTickAction;
		},
		
		// Move world on mouse -> edge
		handleMouseMove: function(e) {
			var self = this;
			var mX = e.offsetX, mY = e.offsetY;																							// mouse location
			var wX = this.container.x, wY = this.container.y;																// World location (in relation to stage);
			var wH = this.height, wW = this.width;
			var cW = this.stage.canvas.width, cH = this.stage.canvas.height;								// Canvas width/height
			
			var edgeWidth = 100;																														// Pixel size of edge (within which world will move)
			var topVelocity = 15;																														// Max pixels per frame to move the world
			
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
				var atEdge = false;
				var wX = self.container.x, wY = self.container.y;
				
				// Ledge edge
				if( wX >= 0) { 	// Left edge
					dWorld.x = (dWorld.x > 0)? 0: dWorld.x;
					self.container.x = 0;
				}									
				
				// Right edge	
				if( wX <= cW - wW) { 
					dWorld.x = (dWorld.x < 0)? 0: dWorld.x;
					self.container.x = cW - wW;
				}		
				
				// Top edge
				if( wY > 0) { 
					dWorld.y = (dWorld.y < 0)? 0: dWorld.y;
					self.container.y = 0; 
				}
				
				// Bottom edge
				if( wY <= cH - wH) {
						console.log('bottom') 
					dWorld.y = (dWorld.y < 0)? 0: dWorld.y;
					self.container.y = cH - wH; 
				}
				
				
				self.container.x += dWorld.x;
				self.container.y += dWorld.y;
			});
		},
		
		setTickAction: function(fn) {
			if( !_.isFunction(fn)) { throw new Error("Invalid tick action"); return; }
			this.tickAction = fn;
		},
		
		clearTickAction: function() {
				console.log('clear');
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
			
			this.container.addChildAt(shape,0);
		},
		
		addChild: function(child) {
			child = (child instanceof Entity)? child.animation: child;
			this.container.addChild(child);
		}
	});
	
	return worldClass;
})();