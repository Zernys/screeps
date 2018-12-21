const _ = require('lodash');
const roleConstructors = {
    'harvester': require('harvester'),
    'repairman': require('repairer'),
    'upgrader': require('upgrader'),
    'builder': require('builder')
};

module.exports.loop = function() {
    // Clear destroyed creeps from memory
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    // Create role wrappers for each creep
    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];
        let role = creep.memory.role;
        creep.role = new roleConstructors[role](creep);
    }

    // Spawn creeps if targets are not met
    const creepCounts = _.countBy(Game.creeps, creep => creep.memory.role);
    for(let roleName in Memory.creepTypes) {
        if((!creepCounts.hasOwnProperty(roleName) && Memory.creepTypes[roleName].targetCount > 0) ||
            (creepCounts.hasOwnProperty(roleName) && creepCounts[roleName] < Memory.creepTypes[roleName].targetCount)) {
            let body = Memory.creepTypes[roleName].body;
            let name = roleName + '_' + Game.time;
            let memory = {role: roleName};

            if (Game.spawns['Spawn1'].spawnCreep(body, name, {memory}) === OK) {
                let creep = Game.creeps[name];
                creep.role = roleConstructors[roleName](creep);
                creep.role.init();
            }
        }
    }

    // Run tick on all creeps
    for(creepName in Game.creeps) {
        let creep = Game.creeps[creepName];
        creep.role.tick();
    }
};