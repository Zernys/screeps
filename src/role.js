var Role = function(creep) {
    this.creep = creep;
};

Role.prototype.init = function() {};

Role.prototype.getRole = function() {
    return this.creep.memory.role;
};

Role.prototype.harvest = function() {
    var creep = this.creep;
    var harvestNode = creep.Memory.persistent.harvestNode;
    harvestNode = harvestNode ? harvestNode : 0;
    var sources = creep.room.find(FIND_SOURCES);
    if(creep.harvest(sources[harvestNode]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[harvestNode], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
};

Role.prototype.idle = function() {
    this.creep.moveTo(Game.flags['Idle'], {visualizePathStyle: {stroke: '#00ff00'}});
};

module.exports = Role;