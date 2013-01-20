/**
TODO
- other entities,
	-- Have an non-user object
 		-- Random movement within an area
- Full screen game
- Keyboard <-> event map
	-- create config object, mapping keycodes to class methods (eg. { [c]: centerMap }
	-- also, could include mouse events (?)
- World creator (persistent data)
- fights, rpg points, etc...
- MVP-ify (separate data about entities from views (sprites)

*
* Idea:
	To cut down on garbage collection performance issues
	create "newObject" method
	which caches a bunch of objects/arrays/whatever
	and returns an empty one to use
	Would manually handle garbage collection.

	var collidables = newObject(array);
	for..{
		collidables.push(entity);
	}
	if(collidables.length) { // do something }
	collidables.garbageCollect();					// Marks object as available to empty/reuse
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
		sand: "textures/sand.png",
		passiveObjects: "sprites/passiveObjects.png"
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
		Game.stage.addChild(Game.world.displayObject);

		// setup ticker
		if(Game.tick) { createjs.Ticker.addListener(Game.tick); }
		createjs.Ticker.useRAF = true;
		createjs.Ticker.setFPS = 60;

		// Create mario	entity
		Game.hero = new Game.Mario({ stage: Game.stage, world: Game.world });
		Game.world.addEntity(Game.hero);
		Game.stage.update();

		// Click to move hero
		$('#stage').on("mousedown", Game.handleMouseDown);

		// Let everyone know we're ready to roll
		Game.vent.trigger("game:initialized");
	},

	Game.addChild = function(entity) {
		if(!entity.displayObject) { throw new Error("Cannot add entity to stage: Entity is missing displayObject property"); }
		Game.world.addChild(entity.displayObject);
		Game.stage.update();
	}

	Game.loadAssets = function() {
		Game.loadImages(Game.images);
	},

	Game.tick = function() {
		$('#fps').text(createjs.Ticker.getMeasuredFPS().toFixed(0));

		Game.stage.update();
	},

	// Start the game when assets are load
	Game.addInitializer(function() {
		Game.loadAssets();

		// Initialize when assets are loaded
		Game.bindTo(Game.vent, "images:loaded", Game.init, Game);
	});

	return Game;
})();
