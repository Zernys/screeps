var Role = require('role');

var Upgrader = function(creep) {
    this.base = Role;
    this.base(creep);
};

Upgrader.prototype = Object.create(Role.prototype);
Upgrader.prototype.constructor = Upgrader;

Upgrader.prototype.tick = function() {
    var creep = this.creep;

    if(creep.carry.energy === 0) {
        this.harvest();
    }else{
        this.upgrade();
    }
};

Upgrader.prototype.upgrade = function() {
    var creep = this.creep;

    if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
    }
};

module.exports = Upgrader;