/**
TODO
- Fix up x/y coord stuff
	-- clairfy mouse offset vs. mouse coord on world
- Move hero to it's own object
 -- Center on move
- collidables (GameObject?), 
- other entities,
	-- Have an non-user object
 		-- Random movement within an area
- World creator (persistent data)
- fights, rpg points, etc...
- MVP-ify (separate data about entities from views (sprites)
*/


/**
 * Main game object
*/
var Game = (function() {
	var Game = new Backbone.Marionette.Application();
	
	Game.vent = new Backbone.Marionette.EventAggregator();
	
	Game.images = {
		mario_movements: "sprites/mario_movements.png",
		mario: "sprites/supermariorpg_mario_sheet.png",
		yoshi: "sprites/supermariorpg_yoshis_sheet.png",
		sand: "textures/sand.png"
	};
	
	Game.entities = {};
	
	Game.loadImages = function(images, callback) {
		var loaded = 0;
		var length = _.keys(images).length;
		var countLoads;

		callback || (callback = function() {});
		
		countLoads = function() {
			loaded++;
			if(loaded == length) {
				Game.vent.trigger("images:loaded", images);
				callback();
			}
		}
		
		// overwrite image src's with Image objects
		for(name in images) {
			var src = images[name];
			images[name] = new Image();
			images[name].src = src;
			images[name].onerror = function() { throw new Error("Unable to load image (src: " + src + ")"); };
			images[name].onload = countLoads;
		}
	}
	
	Game.init = function() {
		// Setup stage
		Game.canvas = document.getElementById("stage");
		Game.stage = new createjs.Stage(Game.canvas);
		Game.world = new createjs.World({
			stage: Game.stage,
			pattern: Game.images.sand,
			width:1000	, height: 1000,
			startPosition: { x: 0, y: 0},
			scrollBounds: 50,
			scrollVelocity: 20
		});
		Game.stage.addChild(Game.world.container);

		// setup ticker
		if(Game.tick) { createjs.Ticker.addListener(Game.tick); }
		createjs.useRAF = true;
		createjs.setFPS = 60;
		
		// Create mario	entity
		Game.hero = new Game.Mario({ stage: Game.stage, world: Game.world });
		Game.world.addChild(Game.hero);
		//Game.stage.addChild(Game.hero.displayObject);
		Game.stage.update();
			console.log(Game.hero, Game.world.container, Game.stage);
		
		// Click to move hero
		$('#stage').on("mousedown", Game.handleMouseDown);
	},
	
	Game.handleMouseDown = function(e) {
		// Right click -> move hero
		/*if(e.button === 2) {
			Game.hero.moveTo(e.offsetX, e.offsetY);
		}*/
	},
	
	Game.addChild = function(entity) {
		if(!entity.displayObject) { throw new Error("Cannot add entity to stage: Entity is missing displayObject property"); }
		Game.world.addChild(entity.displayObject);
		Game.stage.update();
	}
	
	Game.loadAssets = function() {
		Game.loadImages(Game.images);
	}
	
	// Start the game when assets are load
	Game.addInitializer(function() {
		Game.loadAssets();
		
		// Initialize when assets are 
		Game.bindTo(Game.vent, "images:loaded", Game.init, Game);
	});
	
	return Game;
})();
