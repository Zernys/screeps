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
        this.harvest();
    }else{
        hasStore = this.deposit();
        if (!hasStore) {
            this.idle();
        }
    }
};

Harvester.prototype.deposit = function() {
    const creep = this.creep;

    let targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_SPAWN && structure.energy < structure.energyCapacity;
        }
    });
    if(targets.length > 0) {
        if(creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
    return targets.length > 0;
};

module.exports = Harvester;
