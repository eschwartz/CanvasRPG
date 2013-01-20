/**
 * createjs.Utility
 * namespace for various game utilities
*/
createjs.Utility = createjs.Utility || (function() {
    var Utility = {};

    Utility.randomBetween = function(from, to) {
        return Math.floor(Math.random()*(to-from+1)+from);
    }

    Utility.randomCoord = function(world) {
        var coord = (Coordinates instanceof Class)? new Coordinates(): {};

        // Ensure valid world
        if(!(world instanceof createjs.World)) { throw new Error("Unable to return randomCoord: invalid world object"); }

        coord.x = Utility.randomBetween(0, world.width);
        coord.y = Utility.randomBetween(0, world.height);

        return coord;
    }

    // Spawns `count` number of `EntityClass` objects
    // on `world'
    Utility.randomSpawn = function(EntityClass, world, count) {
        for(var i = 0; i < count; ++i) {
            var options = {
                spawnPoint: createjs.Utility.randomCoord(Game.world),
                world: world
            }
            var obj = new EntityClass(options);
            world.addEntity(obj);
        }

        return obj;
    }

    return Utility;
})();


