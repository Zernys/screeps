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
            if(creep.room.find(FIND_STRUCTURES, {
                filter: structure => (
                    structure.hits + this.hpThres <= structure.hitsMax ||
                    structure.hits <= structure.hitsMax * this.hpFracThres)
            }).length) {
                creep.memory.mode = 'repair';
            }
            break;

        default:
            console.log(creep.name + ": Unsupported mode " + creep.memory.mode + ", resetting...");
            creep.memory.mode = 'harvest';
            break;
    }
};

/*The repairer will target the closest structure that is within hpThres of the lowest hp structure in the room and is
* missing more than hpThres or hpFracThres hp. The repairer will repair this structure until it's either full hp or has
* 2 * hpThres more hp than the lowest hp structure in the room.*/
Repairer.prototype.repair = function() {
    var creep = this.creep;

    // Find candidate targets for repair
    var targetCandidates = creep.room.find(FIND_STRUCTURES, {
        filter: structure => (
            structure.hits + this.hpThres <= structure.hitsMax ||
            structure.hits <= structure.hitsMax * this.hpFracThres)
    });

    // Sort from lowest to highest hp
    targetCandidates.sort((a,b) => a.hits - b.hits);

    // Remove target if full hp or 2*hpThres more hp than lowest hp structure, else keep repairing target
    if(creep.memory.repairTargetId) {
        var target = Game.getObjectById(creep.memory.repairTargetId);
        if((targetCandidates.length && target.hits >= targetCandidates[0].hits + 2 * this.hpThres) ||
            target.hits === target.hitsMax) {
            creep.memory.repairTargetId = null;
        } else {
            creep.repair(target);
        }
    }

    // If target is cleared, search for closest new target and start repair
    if(!creep.memory.repairTargetId && targetCandidates.length > 0) {
        var minHealth = targetCandidates[0].hits;
        targetCandidates = targetCandidates.filter(targetCandidate => targetCandidate.hits <= minHealth + this.hpThres);

        // Attempt to repair all target to check if any is in range
        var repairedTarget = false;
        for(var i=0; i<targetCandidates.length; i++) {
            if(creep.repair(targetCandidates[i]) === OK) {
                creep.memory.repairTargetId = targetCandidates[i].id;
                repairedTarget = true;
                break;
            }
        }

        // Search for a path to the closest target and move towards it, if no target was in range
        if(!repairedTarget) {
            var goals = targetCandidates.map(targetCandidate => ({pos: targetCandidate.pos, range: 3}));
            var searchResult = PathFinder.search(
                creep.pos, goals, {plainCost: 2, swampCost: 10, roomCallback: this.getCostMatrix}
                );
            creep.moveByPath(searchResult.path);
        }
    }

    // Return whether there exists targets to repair
    return targetCandidates.length > 0 || creep.memory.repairTargetId;
};

// TODO: Move room cost matrix to a more global room scope
Repairer.prototype.getCostMatrix = function(roomName) {
    if(Repairer.costMatrix) {
        return Repairer.costMatrix;
    }

    var room = Game.rooms[roomName];
    var costs = new PathFinder.CostMatrix;

    room.find(FIND_STRUCTURES).forEach(function(struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
        }
    });

    // Avoid creeps in the room
    room.find(FIND_CREEPS).forEach(function(creep) {
        costs.set(creep.pos.x, creep.pos.y, 0xff);
    });

    Repairer.costMatrix = costs;
    return costs;
};

module.exports = Repairer;