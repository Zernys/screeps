const Role = require('role');

const Builder = function(creep) {
    this.base = Role;
    this.base(creep);
};

Builder.prototype = Object.create(Role.prototype);
Builder.prototype.constructor = Builder;

Builder.prototype.init = function() {
    creep.memory.mode = "harvesting";
};

Builder.prototype.tick = function() {
    const creep = this.creep;

    if(creep.memory.building && creep.carry.energy === 0) {
        creep.memory.building = false;
    }
    if(!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
        creep.memory.building = true;
    }

    if(creep.memory.building) {
        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length) {
            if(creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            creep.moveTo(Game.flags['Idle'], {visualizePathStyle: {stroke: '#00ff00'}});
        }
    }
    else {
        let sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
};

module.exports = Builder;