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
  this.creep.memory.repairTargetId = null;
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

    var targetCandidates = creep.room.find(FIND_STRUCTURES, {
        filter: structure => (
            structure.hits + this.hpThres <= structure.hitsMax ||
            structure.hits <= structure.hitsMax * this.hpFracThres)
    });
    
    targetCandidates.sort((a,b) => a.hits - b.hits);
    
    if(creep.memory.repairTargetId) {
        var target = Game.getObjectById(creep.memory.repairTargetId);
        if((targetCandidates.length && target.hits >= targetCandidates[0].hits + 2 * this.hpThres) ||
            target.hits === target.hitsMax) {
            creep.memory.repairTargetId = null;
        } else {
            creep.repair(target);
        }
    }

    if(!creep.memory.repairTargetId && targetCandidates.length > 0) {
        var minHealth = targetCandidates[0].hits;
        targetCandidates.filter(targetCandidate => targetCandidate.hits <= minHealth + this.hpThres);

        var repairedTarget = false;
        for(var i=0; i<targetCandidates.length; i++) {
            if(creep.repair(targetCandidates[i]) === OK) {
                creep.memory.repairTargetId = targetCandidates[i].id;
                repairedTarget = true;
                break;
            }
        }

        if(!repairedTarget) {
            var goals = targetCandidates.map(targetCandidate => ({pos: targetCandidate.pos, range: 3}));
            var path = PathFinder(creep.pos, goals);
            creep.moveByPath(path);
        }
    }

    return targetCandidates.length > 0;
};

module.exports = Repairer;