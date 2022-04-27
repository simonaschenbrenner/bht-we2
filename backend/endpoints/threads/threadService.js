/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const winston = require("../../config/winston");
const Thread = require("./threadModel.js");
const userService = require("../users/userService");
const groupService = require("../groups/groupService")

// CREATE
function addOne(data, callback) {
    winston.debug("Adding thread");
    userService.getById({ _id: data.adminId }, function(getUserError, user) { // Check if user is in database
        if (getUserError || !user) {
            winston.warn("Could not add thread (getUserError): " + getUserError);
            return callback(getUserError, null);
        } else {
            groupService.getById({ _id: data.groupId }, function(getGroupError, group) {
                if (getGroupError || !group) {
                    winston.warn("Could not add thread (getGroupError): " + getGroupError);
                    return callback(getGroupError, null);
                } else {
                    let newThread = Thread(data);
                    newThread.save(function(saveThreadError, thread) {
                        if (saveThreadError || !thread) {
                            winston.warn("Could not add thread (saveThreadError): " + saveThreadError);
                            return callback(saveThreadError, null);
                        } else {
                            winston.debug("Added thread");
                            return callback(null, thread);
                        }
                    })
                }
            })
        }
    })
}

// READ
function getAll(callback) {
    winston.debug("Getting all threads");
    Thread.find({}, function(error, result) {
        if(error) {
            winston.warn("Could not get threads" + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get threads: No threads in database");
            return callback(null, null);
        } else {
            winston.debug("Found threads")
            return callback(null, result);
        }
    })
}

function getByGroupId(groupId, callback) {
    winston.debug("Getting threads by group ID");
    Thread.find({ groupId: groupId }, function(error, result) {
        if(error) {
            winston.warn("Could not get threads: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get threads: Group ID not found");
            return callback(null, null);
        } else {
            winston.debug("Found threads");
            return callback(null, result);
        }
    })
}

function getByAdminId(adminId, callback) {
    winston.debug("Getting all threads the user is admin of");
    Thread.find({ adminId: adminId }, function(error, result) {
        if(error) {
            winston.warn("Could not get threads: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get threads: No threads with matching Admin ID");
            return callback(null, null);
        } else {
            winston.debug("Found threads");
            return callback(null, result);
        }
    })
}

function getByGroupIdAndAdminId(groupId, adminId, callback) {
    winston.debug("Getting all threads that belong to the group and the user is admin of");
    Thread.find({ groupId: groupId, adminId: adminId }, function(error, result) {
        if(error) {
            winston.warn("Could not get threads: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get threads: No threads with matching IDs");
            return callback(null, null);
        } else {
            winston.debug("Found threads");
            return callback(null, result);
        }
    })
}

function getByGroupIdAndName(groupId, name, callback) {
    winston.debug("Getting threads by name that belong to the group");
    Thread.find({ groupId: groupId, name: name }, function(error, result) {
        if(error) {
            winston.warn("Could not get threads: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get threads: Name not found in group");
            return callback(null, null);
        } else {
            winston.debug("Found threads");
            return callback(null, result);
        }
    })
}

function getById(threadId, callback) {
    winston.debug("Getting thread by ID");
    Thread.findOne({ _id: threadId }, function(error, result) {
        if(error) {
            winston.warn("Could not get thread: " + error);
            return callback(error, null);
        } else if (!result) {
            winston.debug("Could not get thread: ID not found");
            return callback(null, null);
        } else {
            winston.debug("Found thread");
            return callback(null, result);
        }
    })
}

function isAdmin(threadId, userId, callback){
    winston.debug("Checking if user is thread admin");
    getById(threadId, function(getError, thread) {
        if (getError || !thread) {
            winston.warn("Could not check if user is thread admin (getError): " + getError)
            return callback(getError, null);
        } else {
            if (String(thread.adminId) === String(userId)) {
                winston.debug("User is thread admin");
                return callback(null, true);
            } else {
                winston.debug("User is not thread admin");
                return callback(null, false);
            }
        }
    })
}

// UPDATE
function updateName(threadId, newName, callback) {
    winston.debug("Updating thread name");
    getById(threadId, function(getThreadError, thread) {
        if (getThreadError || !thread) {
            winston.warn("Could not update thread name (getThreadError): " + getThreadError);
            return callback(getThreadError, null);
        } else {
            thread.name = newName;
            thread.save(function(saveThreadError, saveThreadResult) {
                if (saveThreadError || !saveThreadResult) {
                    winston.warn("Could not update thread name (saveThreadError): " + saveThreadError);
                    return callback(saveThreadError, null);
                } else {
                    winston.debug("Thread name updated");
                    return callback(null, saveThreadResult);
                }
            })
        }
    })
}

function updateAdminId(threadId, newAdminId, callback) {
    winston.debug("Updating thread admin");
    isAdmin(threadId, newAdminId, function(isAdminError, isAdmin) {
        if(isAdminError) winston.warn("Could not check if user is already thread admin: " + isAdminError);
        else if (isAdmin) {
            winston.debug("User is already thread admin");
            return callback();
        } else {
            userService.getById({ _id: newAdminId }, function(getUserError, user) { // Check if user is in database
                if (getUserError || !user) {
                    winston.warn("Could not update thread admin (getUserError): " + getUserError);
                    return callback(getUserError, null);
                } else {
                    getById(threadId, function(getThreadError, thread) {
                        if (getThreadError || !thread) {
                            winston.warn("Could not update thread admin (getThreadError): " + getThreadError);
                            return callback(getThreadError, null);
                        } else {
                            thread.adminId = newAdminId;
                            thread.save(function(saveThreadError, saveThreadResult) {
                                if (saveThreadError || !saveThreadResult) {
                                    winston.warn("Could not update thread admin (saveThreadError): " + saveThreadError);
                                    return callback(saveThreadError, null);
                                } else {
                                    winston.debug("Thread admin updated");
                                    return callback(null, saveThreadResult);
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

// DELETE
function deleteOne(threadId, callback) {
    winston.debug("Deleting thread");
    Thread.deleteOne({ _id: threadId }, function(error) {
        if(error) {
            winston.warn("Could not delete thread: " + error);
            return callback(error);
        } else {
            winston.debug("Thread deleted");
            return callback(null);
        }
    })
}

module.exports = {
    addOne,
    getAll,
    getByGroupId,
    getByAdminId,
    getByGroupIdAndAdminId,
    getByGroupIdAndName,
    getById,
    isAdmin,
    updateName,
    updateAdminId,
    deleteOne
}