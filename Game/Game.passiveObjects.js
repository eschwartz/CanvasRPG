/**
 * Game.passiveObjects.js
 * A bunch of things to put on the world map
*/
Game.vent.on("game:initialized", function() {

	Game.Pipe = createjs.PassiveObject.extend({
		spriteOptions: {
			image: Game.images.passiveObjects,
			x: 55,
			y: 92,
			width: 58,
			height: 58,
			regX: 25,
			regY: 50
		},

		hitRadius: 30
	});

	Game.Hill = createjs.PassiveObject.extend({
		spriteOptions: {
			image: Game.images.passiveObjects,
			x: 0,
			y: 0,
			width: 119,
			height: 87,
			regX: 30,
			regY: 65
		},
		hitRadius: 40
	});

	Game.Bouquet = createjs.PassiveObject.extend({
		spriteOptions: {
			image: Game.images.passiveObjects,
			x: 250,
			y: 0,
			width: 62,
			height: 62,
			regX: 30,
			regY: 50
		},
		hitRadius: 30
	})

	createjs.Utility.randomSpawn(Game.Pipe, Game.world, 10);
	createjs.Utility.randomSpawn(Game.Hill, Game.world, 5);
	createjs.Utility.randomSpawn(Game.Bouquet, Game.world, 10);

	/*window.pipe = new Game.Pipe({
		spawnPoint: {
			x: 300,
			y: 300,
		},
		world: Game.world
	});
	Game.world.addEntity(window.pipe);
	window.mario = Game.hero;
	window.collidables = window.mario.getCollidables();*/
});

