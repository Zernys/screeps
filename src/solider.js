var Role = require('role');

var Solider = function(creep) {
    this.base = Role;
    this.base(creep);
};

Solider.prototype = Object.create(Role.prototype);
Solider.prototype.constructor = Solider;

Solider.prototype.tick = function() {
    var creep = this.creep;
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(target) {
        if(creep.attack(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    } else {
        this.idle();
    }
};

module.exports = Solider;