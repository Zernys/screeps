const _ = require('lodash');
const roleModules = {
    'harvester': require('role.harvester')
};

module.exports.loop = function() {

    // Clear destroyed creeps from memory
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }


    // Spawn creeps if targets are not met
    const creepCounts = _.countBy(Game.creeps, creep => creep.memory.role);

    for (var roleName in creepCounts) {
        if (creepCounts[roleName] < Memory.creepTargetCounts[roleName]) {
            let body = Memory.creepTypes[roleName].body;
            let name = roleName + '_' + Game.time;
            let memory = {role: roleName};

            Game.spawns['Spawn1'].spawnCreep(body, name, memory);
        }
    }

    
    // Run the creeps
    for (var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        roleModules[creep.memory.role].run(creep);
        }
    }
}