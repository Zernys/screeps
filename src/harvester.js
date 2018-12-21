var Role = require('role');

var Harvester = function(creep) {
    this.base = Role;
    this.base(creep);
};

Harvester.prototype = Object.create(Role.prototype);
Harvester.prototype.constructor = Harvester;

Harvester.prototype.init = function() {
  this.creep.memory.mode = 'harvest';
};

Harvester.prototype.tick = function() {
    var creep = this.creep;

    switch(creep.memory.mode) {
        case 'harvest':
            this.harvest();
            if(creep.carry.energy === creep.carryCapacity) {
                creep.memory.mode = 'deposit';
            }
            break;

        case 'deposit':
            var hasWork = this.deposit();
            if(!hasWork) {
                if(creep.carry.energy < creep.carryCapacity) {
                    creep.memory.mode = 'harvest';
                } else {
                    creep.memory.mode = 'idle';
                }
            }
            if(creep.carry.energy === 0) {
                creep.memory.mode = 'harvest'
            }
            break;

        case 'idle':
            this.idle();
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
                }
            });
            if(targets.length > 0) {
                this.creep.memory.mode = 'deposit';
            }
            break;

        default:
            console.log(creep.name + ": Unsupported mode " + creep.memory.mode + ", resetting...");
            creep.memory.mode = 'harvest';
            break;
    }
};

Harvester.prototype.deposit = function() {
    var creep = this.creep;

    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
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
