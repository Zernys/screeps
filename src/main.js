const _ = require('lodash');
const roleConstructors = {
    'solider': require('solider'),
    'harvester': require('harvester'),
    'repairer': require('repairer'),
    'upgrader': require('upgrader'),
    'builder': require('builder')
};

module.exports.loop = function() {
    // Clear destroyed creeps from memory
    var deadCreeps = Object.keys(Memory.creeps).filter(creepName => !Game.creeps[creepName]);
    deadCreeps.forEach(function(creepName) {
        var creepMem = Memory.creeps[creepName];
        if(creepMem.persistentMemoryKey) {
            Memory.persistentMemory[creepMem.role].owner = null;
        }
        delete Memory.creeps[creepName];
    });

    // Create role wrappers for each creep
    for(var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        var role = creep.memory.role;
        var perMemKey = creep.memory.perMemKey;
        if(perMemKey) {
            creep.persistentMemory = Memory.persistentMemory[role][perMemKey]
        } else {
            creep.persistentMemory = {};
        }
        creep.role = new roleConstructors[role](creep);
    }

    // Raise solider target count if there are enemies in the room
    var enemies = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
    if(enemies.length > 0) {
        Memory.creepTypes['solider'].targetCount = 2;
    } else {
        Memory.creepTypes['solider'].targetCount = 0;
    }

    // Spawn creeps if targets are not met. New spawn will inheret persistent memory from previously dead spawns if
    // role is compatible
    var creepCounts = _.countBy(Game.creeps, creep => creep.memory.role);
    for(var roleName in roleConstructors) {
        if((!creepCounts.hasOwnProperty(roleName) && Memory.creepTypes[roleName].targetCount > 0) ||
            (creepCounts.hasOwnProperty(roleName) && creepCounts[roleName] < Memory.creepTypes[roleName].targetCount)) {
            var body = Memory.creepTypes[roleName].body;
            var name = roleName + '_' + Game.time;
            var memory = {persistentMemoryKey: null, role: roleName};

            // TODO: Temporary solution for harvester fallback, should be improved
            if(roleName === 'harvester' && creepCounts[roleName] === 0) {
                body = [WORK, WORK, CARRY, MOVE];
            }

            if(Game.spawns['Spawn1'].spawnCreep(body, name, {memory}) === OK) {
                creep = Game.creeps[name];

                var rolePerMem = Memory.persistentMemory[roleName];
                // noinspection JSReferencingMutableVariableFromClosure
                perMemKey = Object.keys(rolePerMem).find(key => rolePerMem[key].owner == null);
                if(perMemKey) {
                    creep.persistentMemoryKey = perMemKey;
                    rolePerMem[perMemKey] = creep.name;
                    creep.persistentMemory = Memory.persistentMemory[roleName][perMemKey];
                } else {
                    creep.persistentMemory = {};
                }

                creep.role = new roleConstructors[roleName](creep);
                creep.role.init();
            }
            break;
        }
    }

    // Run tick on all creeps
    for(creepName in Game.creeps) {
        creep = Game.creeps[creepName];
        creep.role.tick();
    }
};