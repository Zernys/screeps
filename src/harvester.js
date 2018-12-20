const Role = require('role');

const Harvester = function(creep) {
    this.base = Role;
    this.base(creep);
};

Harvester.prototype = Object.create(Role.prototype);
Harvester.prototype.constructor = Harvester;

Harvester.prototype.tick = function() {
    const creep = this.creep;

    if(creep.carry.energy < creep.carryCapacity) {
        let sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }else{
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_SPAWN && structure.energy < structure.energyCapacity;
            }
        });
        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }else{
            creep.moveTo(Game.flags['Idle'], {visualizePathStyle: {stroke: '#00ff00'}});
        }
    }
};

module.exports = Harvester;
