var Tower = function(tower) {
    this.tower = tower;
};

Tower.prototype.tick = function() {
    var closestHostile = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile) {
        this.tower.attack(closestHostile);
    }
};

module.exports = Tower;