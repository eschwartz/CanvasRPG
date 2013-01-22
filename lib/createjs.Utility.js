/**
 * createjs.Utility
 * namespace for various game utilities
*/
createjs.Utility = createjs.Utility || (function() {
    var Utility = {};

    Utility.randomBetween = function(from, to) {
        return Math.floor(Math.random()*(to-from+1)+from);
    }

    // World is any object wth x, y, width, and height coords
    // x, y can be set in world.displayObject, or on world directly
    Utility.randomCoord = function(world) {
        var coord = (Coordinates instanceof Class)? new Coordinates(): {};
        var x, y;

        // Ensure valid world
        if(!('width' in world) || !('height' in world)) {
            throw new Error("Unable to create random coordinate: invalid world parameter");
        }


        if(world.displayObject instanceof createjs.DisplayObject) {
            x = world.displayObject.x;
            y = world.displayObject.y;
        }
        world.x || (world.x = 0);
        world.y || (world.y = 0);

        coord.x = Utility.randomBetween(world.x, world.x + world.width);
        coord.y = Utility.randomBetween(world.y, world.y + world.height);

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


