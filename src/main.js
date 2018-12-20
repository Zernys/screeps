const roleHarvester = require('role.harvester');

module.exports.loop = function() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        switch (creep.memory.role) {
            case 'harvester':
                roleHarvester.run(creep);
                break;
            default:
                break;
        }
    }
}