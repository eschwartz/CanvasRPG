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

	Game.Koopa = createjs.AiEntity.extend({
		world: Game.world,

		movements: [
			{ direction: "down",			frames: [0, 1, 0, 2] },
			{ direction: "downRight", frames: [3, 4, 3, 5] },
			{ direction: "right",			frames: [6, 7, 6, 8] },
			{ direction: "upRight", 	frames: [9, 10, 9, 11] },
			{ direction: "up", 				frames: [12, 13, 12, 14] },
			{ direction: "upLeft", 	frames: [15, 16, 15, 17] },
			{ direction: "left",			frames: [18, 19, 18, 20] },
			{ direction: "downLeft", 		frames: [21, 22, 21, 23] },
		],

		spriteOptions: {
			images: [Game.images.mario_movements],
			frames: { width: 100, height: 100, regX: 50, regY: 85 },
			frequency: 3
		},

		hitRadius:15
	});

	window.koopa = new Game.Koopa({
		spawnPoint: {
			x: 300, y: 300
		},
		domain: {
			x: 300, y: 300,
			width: 300, height: 300
		}
	})

	Game.world.addEntity(koopa);



	createjs.Utility.randomSpawn(Game.Pipe, Game.world, 5);
	createjs.Utility.randomSpawn(Game.Hill, Game.world, 3);
	createjs.Utility.randomSpawn(Game.Bouquet, Game.world, 5);

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

