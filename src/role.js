const Role = function(creep) {
    this.creep = creep;
};

Role.prototype.init = function() {};

Role.prototype.getRole = function() {
    return this.creep.memory.role;
};

Role.prototype.harvest = function() {
    const creep = self.creep;
    let sources = creep.room.find(FIND_SOURCES);
    if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
};

Role.prototype.idle = function() {
    this.creep.moveTo(Game.flags['Idle'], {visualizePathStyle: {stroke: '#00ff00'}});
};

module.exports = Role;