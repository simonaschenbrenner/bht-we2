/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const winston = require("../../config/winston");
const Group = require("./groupModel.js");
const userService = require("../users/userService");
const membershipService = require("../memberships/membershipService");

// CREATE
function addOne(data, callback) {
    winston.debug("Adding group");
    userService.getById({ _id: data.adminId }, function(getUserError, user) { // Check if user is in database
        if (getUserError || !user) {
            winston.warn("Could not add group (getUserError): " + getUserError);
            return callback(getUserError, null);
        } else {
            let newGroup = Group(data);
            newGroup.save(function(saveGroupError, group) {
                if (saveGroupError || !group) {
                    winston.warn("Could not add group (saveGroupError): " + saveGroupError);
                    return callback(saveGroupError, null);
                } else {
                    winston.debug("Added group");
                    membershipService.addOne({ userId: group.adminId, groupId: group._id }, function(addMemberError, membership) {
                        if (addMemberError || !membership) {
                            winston.warn("Could not add membership to new group (addMemberError): " + addMemberError);
                            return callback(addMemberError, null);
                        } else {
                            return callback(null, group);
                        }
                    })
                }
            })
        }
    })
}

// READ
function getAll(callback) {
    winston.debug("Getting all groups");
    Group.find({}, function(error, result) {
        if(error) {
            winston.warn("Could not get groups" + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.warn("Could not get groups: No groups in database");
            return callback(null, null);
        } else {
            return callback(null, result);
        }
    })
}

function getAllPublic(callback) {
    winston.debug("Getting all public groups");
    Group.find({ private: false }, function(error, result) {
        if(error) {
            winston.warn("Could not get groups" + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.warn("Could not get groups: No groups in database");
            return callback(null, null);
        } else {
            return callback(null, result);
        }
    })
}

function getByAdminId(id, callback) {
    winston.debug("Getting all groups the user is admin of");
    Group.find({ adminId: id }, function(error, result) {
        if(error) {
            winston.warn("Could not get groups: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get groups: No groups with matching Admin ID");
            return callback(null, null);
        } else {
            winston.debug("Found groups");
            return callback(null, result);
        }
    })
}

function getById(id, callback) {
    winston.debug("Getting group by ID");
    Group.findOne({ _id: id }, function(error, result) {
        if(error) {
            winston.warn("Could not get group: " + error);
            return callback(error, null);
        } else if (!result) {
            winston.debug("Could not get group: ID not found");
            return callback(null, null);
        } else {
            winston.debug("Found group");
            return callback(null, result);
        }
    })
}

function getByName(name, callback) {
    winston.debug("Getting groups by name");
    Group.find({ name: name }, function(error, result) {
        if(error) {
            winston.warn("Could not get groups: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get groups: Name not found");
            return callback(null, null);
        } else {
            winston.debug("Found groups");
            return callback(null, result);
        }
    })
}

function isAdmin(gid, uid, callback) {
    winston.debug("Checking if user is group admin");
    getById(gid, function(getError, group) {
        if (getError || !group) {
            winston.warn("Could not check if user is group admin (getError): " + getError)
            return callback(getError, null);
        } else {
            if (String(group.adminId) === String(uid)) {
                winston.debug("User is group admin");
                return callback(null, true);
            } else {
                winston.debug("User is not group admin");
                return callback(null, false);
            }
        }
    })
}

function isPublic(gid, callback) {
    winston.debug("Checking if group is public");
    getById(gid, function(getError, group) {
        if (getError || !group) {
            winston.warn("Could not check if group is public (getError): " + getError)
            return callback(getError, null);
        } else {
            if (group.private) {
                winston.debug("Group is private");
                return callback(null, false);
            } else {
                winston.debug("Group is public");
                return callback(null, true);
            }
        }
    })
}

// UPDATE
function updateName(groupId, newName, callback) {
    winston.debug("Updating group name");
    getById(groupId, function(getGroupError, group) {
        if (getGroupError || !group) {
            winston.warn("Could not update group name (getGroupError): " + getGroupError);
            return callback(getGroupError, null);
        } else {
            group.name = newName;
            group.save(function(saveGroupError, saveGroupResult) {
                if (saveGroupError || !saveGroupResult) {
                    winston.warn("Could not update group name (saveGroupError): " + saveGroupError);
                    return callback(saveGroupError, null);
                } else {
                    winston.debug("Group name updated");
                    return callback(null, saveGroupResult);
                }
            })
        }
    })
}

function updateAdminId(groupId, newAdminId, callback) {
    winston.debug("Updating group admin");
    isAdmin(groupId, newAdminId, function(isAdminError, isAdmin) {
        if(isAdminError) winston.warn("Could not check if user is already group admin: " + isAdminError);
        else if (isAdmin) {
            winston.debug("User is already group admin");
            return callback();
        } else {
            userService.getById({ _id: newAdminId }, function(getUserError, user) { // Check if user is in database
                if (getUserError || !user) {
                    winston.warn("Could not update group admin (getUserError): " + getUserError);
                    return callback(getUserError, null);
                } else {
                    getById(groupId, function(getGroupError, group) {
                        if (getGroupError || !group) {
                            winston.warn("Could not update group admin (getGroupError): " + getGroupError);
                            return callback(getGroupError, null);
                        } else {
                            group.adminId = newAdminId;
                            group.save(function(saveGroupError, saveGroupResult) {
                                if (saveGroupError || !saveGroupResult) {
                                    winston.warn("Could not update group admin (saveGroupError): " + saveGroupError);
                                    return callback(saveGroupError, null);
                                } else {
                                    winston.debug("Saved group");
                                    membershipService.addOne({ userId: group.adminId, groupId: group._id }, function(memberError, membership) {
                                        if (memberError || !membership) {
                                            winston.warn("Could not add membership of new group admin to group (memberError): " + memberError);
                                            return callback(memberError, null);
                                        } else {
                                            return callback(null, saveGroupResult);
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

// Not exported
function updateVisibility(id, bool, callback) {
    if(bool) winston.debug("Updating group visibility to private");
    else winston.debug("Updating group visibility to public");
    Group.updateOne({ _id: id }, { private: bool }, function(error, result) {
        if (error || !result) {
            winston.debug("Could not update group visibility: " + error);
            return callback(error, null);
        } else {
            winston.debug("Group visibility updated");
            return callback(null, result);
        }
    })
}

function updatePrivate(id, callback) {
    updateVisibility(id, true, callback);
}

function updatePublic(id, callback) {
    updateVisibility(id, false, callback);
}

// DELETE
function deleteOne(id, callback) {
    winston.debug("Deleting group");
    Group.deleteOne({ _id: id }, function(groupError) {
        if(groupError) {
            winston.warn("Could not delete group: " + groupError);
            return callback(groupError);
        } else {
            winston.debug("Group deleted");
            membershipService.deleteAllByGroupId(id, function(membershipError) {
                if(membershipError) {
                    winston.warn("Could not delete associated memberships: " + membershipError);
                    return callback(membershipError);
                } else {
                    winston.debug("Associated memberships deleted");
                    return callback(null);
                }
            })
        }
    })
}

module.exports = {
    getAll,
    getAllPublic,
    getByAdminId,
    addOne,
    getById,
    getByName,
    isAdmin,
    isPublic,
    updateName,
    updateAdminId,
    updatePrivate,
    updatePublic,
    deleteOne
}