var Role = require('role');

var Upgrader = function(creep) {
    this.base = Role;
    this.base(creep);
};

Upgrader.prototype = Object.create(Role.prototype);
Upgrader.prototype.constructor = Upgrader;

Upgrader.prototype.init = function() {
    this.creep.memory.mode = 'harvest';
};

Upgrader.prototype.tick = function() {
    var creep = this.creep;

    switch(creep.memory.mode) {
        case 'harvest':
            this.harvest();
            if(creep.carry.energy === creep.carryCapacity) {
                creep.memory.mode = 'upgrade';
            }
            break;
        case 'upgrade':
            this.upgrade();
            if(creep.carry.energy === 0) {
                creep.memory.mode = 'harvest';
            }
            break;
        default:
            console.log(creep.name + ": Unsupported mode " + creep.memory.mode + ", resetting...");
            creep.memory.mode = 'harvest';
            break;
    }
};

Upgrader.prototype.upgrade = function() {
    var creep = this.creep;

    if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
    }
};

module.exports = Upgrader;