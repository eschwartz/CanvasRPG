/**
 * Game.passiveObjects.js
 * A bunch of things to put on the world map (non-agent)
 *
 * To do:
 		- Bind to some kind of persistant map data
		- Handle collisions on spawn
*/

Game.Pipe = createjs.Entity.extend({
		spriteOptions: {
			images: [Game.images.passiveObjects],
			frames: [
				[55, 92, 58, 58, 0, 25, 50] 
			]
		},
		hitRadius: 20
});

Game.Hill = createjs.Entity.extend({
		spriteOptions: {
			images: [Game.images.passiveObjects],
			frames: [
				[0, 0, 119, 87, 0, 0, 0] 
			]
		}
});

Game.Bouquet = createjs.Entity.extend({
		spriteOptions: {
			images: [Game.images.passiveObjects],
			frames: [
				[250, 0, 62, 62, 0, 0, 0] 
			]
		}
});


function randomFromInterval(from,to)
{
    return Math.floor(Math.random()*(to-from+1)+from);
}

Game.vent.on("game:initialized", function() {
	var randomSpawn = function(Obj, count) {
		for(var i = 0; i < count; ++i) {
			var options = {
				spawnPoint: { x: randomFromInterval(0, Game.world.width), y: randomFromInterval(0, Game.world.height)},
				stage: Game.stage,
				world: Game.world
			}
			var obj = new Obj(options);
			Game.world.addEntity(obj);
		}
	}

	//randomSpawn(Game.Pipe, 10);
	//randomSpawn(Game.Hill, 5);
	//randomSpawn(Game.Bouquet, 15);
	window.pipe = new Game.Pipe({
		spawnPoint: {
			x: 300,
			y: 300
		},
		stage: Game.stage,
		world: Game.world
	});
	Game.world.addEntity(window.pipe);
	window.mario = Game.hero;
	window.collidables = window.mario.getCollidables();
});

