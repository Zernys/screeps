const _ = require('lodash');
const roleConstructors = {
    'solider': require('solider'),
    'harvester': require('harvester'),
    'repairer': require('repairer'),
    'upgrader': require('upgrader'),
    'builder': require('builder')
};
const towerConstructor = require('tower');

module.exports.loop = function() {
    // Clear destroyed creeps from memory
    var deadCreeps = Object.keys(Memory.creeps).filter(creepName => !Game.creeps[creepName]);
    deadCreeps.forEach(function(creepName) {
        var creepMem = Memory.creeps[creepName];
        if(creepMem.persistentMemoryKey &&
            Memory.persistentMemory[creepMem.role][creepMem.persistentMemoryKey].owner === creepName) {
            Memory.persistentMemory[creepMem.role][creepMem.persistentMemoryKey].owner = null;
        }
        delete Memory.creeps[creepName];
    });

    // Create role wrappers for each creep
    for(var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        var role = creep.memory.role;
        var perMemKey = creep.memory.persistentMemoryKey;
        if(perMemKey) {
            creep.persistentMemory = Memory.persistentMemory[role][perMemKey]
        } else {
            creep.persistentMemory = {};
        }
        creep.role = new roleConstructors[role](creep);
    }

    // Create tower wrappers for each tower
    var towers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {filter: function(structure) {
        return (structure.structureType === STRUCTURE_TOWER && structure.my)}});
    for(var tower in towers) {
        // noinspection JSPrimitiveTypeWrapperUsage
        tower.operator = new towerConstructor(tower);
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
                    creep.memory.persistentMemoryKey = perMemKey;
                    rolePerMem[perMemKey].owner = creep.name;
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
        Game.creeps[creepName].role.tick();
    }

    // Run tick on all towers
    for(tower in towers) {
        tower.operator.tick();
    }
};