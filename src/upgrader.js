const Role = require('role');

const Upgrader = function(creep) {
    this.base = Role;
    this.base(creep);
};

Upgrader.prototype = Object.create(Role.prototype);
Upgrader.prototype.constructor = Upgrader;

Upgrader.prototype.tick = function() {
    const creep = this.creep;

    if(creep.carry.energy === 0) {
        let sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }else{
        if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
};

module.exports = Upgrader;