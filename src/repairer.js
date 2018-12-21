const Role = require('role');

const Repairer = function(creep) {
    this.base = Role;
    this.base(creep);
};

Repairer.prototype = Object.create(Role.prototype);
Repairer.prototype.constructor = Repairer;

Repairer.prototype.init = function() {
  this.creep.memory.mode = 'harvest';
};

Repairer.prototype.tick = function() {
    const creep = this.creep;

    switch (creep.memory.mode) {
        case 'harvest':
            this.harvest();
            if(creep.carry.energy === creep.carryCapacity) {
                creep.memory.mode='repair';
            }
            break;

        case 'repair':
            let hasWork = this.repair();
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
            if(creep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax})) {
                creep.memory.mode = 'repair';
            }
            break;

        default:
            console.log(creep.name + ": Unsupported mode " + creep.memory.mode + ", resetting...");
            creep.memory.mode = 'harvest';
            break;
    }
};

Repairer.prototype.repair = function() {
    const targets = creep.room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    });

    targets.sort((a,b) => a.hits - b.hits);

    if(targets.length > 0) {
        if(creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
    }

    return targets.length > 0;
};

module.exports = Repairer;