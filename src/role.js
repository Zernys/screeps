const Role = function(creep) {
    this.creep = creep;
};

Role.prototype.init = function() {};
Role.prototype.getRole = function() {
    return this.creep.memory.role;
};

module.exports = Role;