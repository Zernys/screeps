var Role = require('role');

var Repairer = function(creep) {
    this.base = Role;
    this.base(creep);
    this.hpThres = Memory.creepTypes.repairer.hpThres;
    this.hpFracThres = Memory.creepTypes.repairer.hpFracThres;
};

Repairer.prototype = Object.create(Role.prototype);
Repairer.prototype.constructor = Repairer;

Repairer.prototype.init = function() {
  this.creep.memory.mode = 'harvest';
  this.creep.memory.repairTarget = null;
};

Repairer.prototype.tick = function() {
    var creep = this.creep;

    switch (creep.memory.mode) {
        case 'harvest':
            this.harvest();
            if(creep.carry.energy === creep.carryCapacity) {
                creep.memory.mode='repair';
            }
            break;

        case 'repair':
            var hasWork = this.repair();
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
            if(creep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax})) {
                creep.memory.mode = 'repair';
            }
            break;

        default:
            console.log(creep.name + ": Unsupported mode " + creep.memory.mode + ", resetting...");
            creep.memory.mode = 'harvest';
            break;
    }
};

Repairer.prototype.repair = function() {
    var creep = this.creep;

    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: structure => (
            structure.hits + this.hpThres <= structure.hitsMax ||
            structure.hits <= structure.hitsMax * this.hpFracThres)
    });

    targets.sort((a,b) => a.hits - b.hits);

    if(targets.length > 0) {

        var minHealth = targets[0].hits;
        targets.filter(target => target.hits <= minHealth + this.hpThres);

        var repairedTarget = false;
        for(var i=0; i<targets.length; i++) {
            if(creep.repair(targets[i]) === OK) {
                repairedTarget = true;
                break;
            }
        }

        if(!repairedTarget) {
            var goals = targets.map(target => ({pos: target.pos, range: 3}));
            var path = PathFinder(creep.pos, goals);
            creep.moveByPath(path);
        }
    }

    return targets.length > 0;
};

module.exports = Repairer;