/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const winston = require("../../config/winston");
const Membership = require("./membershipModel.js");

// CREATE
function addOne(data, callback) {
    winston.debug("Adding membership");
    if (!data.color) data = { userId: data.userId, groupId: data.groupId };
    let newMembership = Membership(data);
    newMembership.save(function(error, result) {
        if(error || !result) {
            winston.warn("Could not add membership: " + error);
            return callback(error, null);
        } else {
            winston.debug("Added membership");
            return callback(null, result);
        }
    })
}

// READ
function getAll(callback) {
    winston.debug("Getting all memberships");
    Membership.find({}, function(error, result) {
        if(error) {
            winston.warn("Could not get memberships" + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.warn("Could not get memberships: No memberships in database");
            return callback(null, null);
        } else {
            return callback(null, result);
        }
    })
}

function getByUserId(id, callback) {
    winston.debug("Getting memberships by user ID");
    Membership.find({ userId: id }, function(error, result) {
        if(error) {
            winston.warn("Could not get memberships: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get memberships: User ID not found");
            return callback(null, null);
        } else {
            winston.debug("Found memberships");
            return callback(null, result);
        }
    })
}

function getByGroupId(id, callback) {
    winston.debug("Getting memberships by group ID");
    Membership.find({ groupId: id }, function(error, result) {
        if(error) {
            winston.warn("Could not get memberships: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get memberships: Group ID not found");
            return callback(null, null);
        } else {
            winston.debug("Found memberships");
            return callback(null, result);
        }
    })
}

function getByGroupIdAndUserId(uid, gid, callback) {
    winston.debug("Getting membership by user ID and group ID");
    Membership.findOne({ userId: uid, groupId: gid }, function(error, result) {
        if(error) {
            winston.warn("Could not get membership: " + error);
            return callback(error, null);
        } else if (!result) {
            winston.debug("Could not get membership: ID combination not found");
            return callback(null, null);
        } else {
            winston.debug("Found membership");
            return callback(null, result);
        }
    })
}

// UPDATE
function updateColor(data, callback) {
    winston.debug("Updating membership color");
    let { userId, groupId, color } = data;
    getByGroupIdAndUserId(userId, groupId, function(getError, membership) {
        if(getError || !membership) {
            winston.debug("Could not update membership color (getError): " + getError);
            return callback(getError, null)
        } else {
            if (Array.isArray(color)) {
                membership.color = color;
                membership.save(function(saveError, saveResult) {
                    if (saveError || !saveResult) {
                        winston.warn("Could not update membership color (saveError): " + saveError);
                        return callback(saveError, null);
                    } else {
                        winston.debug("Membership color updated");
                        return callback(null, saveResult);
                    }
                })
            } else {
                let typeError = "Color parameter not an array";
                winston.warn("Could not update membership color (typeError): " + typeError);
                return callback(typeError, null);
            }
        }
    })
}

// DELETE
function deleteOne(uid, gid, callback) {
    winston.debug("Deleting membership");
    Membership.deleteOne({ userId: uid, groupId: gid }, function(error) {
        if (error) {
            winston.warn("Could not delete membership: " + error);
            return callback(error);
        } else {
            winston.debug("Membership deleted");
            return callback(null);
        }
    })
}

function deleteAllByUserId(uid, callback) {
    winston.debug("Deleting all memberships of one user");
    Membership.deleteMany({ userId: uid }, function(error) {
        if (error) {
            winston.warn("Could not delete memberships: " + error);
            return callback(error);
        } else {
            winston.debug("Memberships deleted");
            return callback(null);
        }
    })
}

function deleteAllByGroupId(gid, callback) {
    winston.debug("Deleting all memberships of one group");
    Membership.deleteMany({ groupId: gid }, function(error) {
        if (error) {
            winston.warn("Could not delete memberships: " + error);
            return callback(error);
        } else {
            winston.debug("Memberships deleted");
            return callback(null);
        }
    })
}

module.exports = {
    addOne,
    getAll,
    getByUserId,
    getByGroupId,
    getByGroupIdAndUserId,
    updateColor,
    deleteOne,
    deleteAllByUserId,
    deleteAllByGroupId
}