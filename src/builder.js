var Role = require('role');

var Builder = function(creep) {
    this.base = Role;
    this.base(creep);
};

Builder.prototype = Object.create(Role.prototype);
Builder.prototype.constructor = Builder;

Builder.prototype.init = function() {
    this.creep.memory.mode = 'harvest';
};

Builder.prototype.tick = function() {
    var creep = this.creep;

    switch (creep.memory.mode) {
        case 'harvest':
            this.harvest();
            if(creep.carry.energy === creep.carryCapacity) {
                creep.memory.mode='build';
            }
            break;

        case 'build':
            var hasWork = this.build();
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
            if(creep.room.find(FIND_CONSTRUCTION_SITES)) {
                creep.memory.mode = 'build';
            }
            break;

        default:
            console.log(creep.name + ": Unsupported mode " + creep.memory.mode + ", resetting...");
            creep.memory.mode = 'harvest';
            break;
    }
};

Builder.prototype.build = function() {
    var creep = this.creep;
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length && creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
    }
    return targets.length > 0;
};

module.exports = Builder;