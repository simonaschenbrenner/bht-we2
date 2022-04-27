/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const winston = require("../../config/winston");
const User = require("./userModel.js");
const membershipService = require("../memberships/membershipService");

// CREATE
function addOne(data, callback) {
    winston.debug("Adding user");
    let newUser = new User(data);
    // Check if user already exists to prevent update operation by save function
    getByEmail(newUser.email, function(getError, getResult) {
        if(getError || !getResult) {
            newUser.save(function(saveError, saveResult) {
                if(saveError || !saveResult) {
                    winston.warn("Could not add user (saveError): " + saveError);
                    return callback(saveError, null);
                } else {
                    winston.debug("Added user");
                    return callback(null, saveResult);
                }
            })
        } else {
            winston.warn("Could not add user: (getError) " + getError);
            return callback(getError, null);
        }
    })
}

// READ
function getAll(callback) {
    winston.debug("Getting all users");
    User.find({}, function(error, result) {
        if(error) {
            winston.warn("Could not get users" + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.warn("Could not get users: No users in database");
            return callback(null, null);
        } else {
            winston.debug("Found users")
            return callback(null, result);
        }
    })
}

function getById(id, callback) {
    winston.debug("Getting user by id");
    User.findOne({ _id: id }, function(error, result) {
        if(error) {
            winston.warn("Could not get user: " + error);
            return callback(error, null);
        } else if (!result) {
            winston.debug("Could not get user: ID not found");
            return callback(null, null);
        } else {
            winston.debug("Found user");
            return callback(null, result);
        }
    })
}

function getByEmail(email, callback) {
    winston.debug("Getting user by email");
    User.findOne({ email: email }, function(error, result) {
        if(error) {
            winston.warn("Could not get user: " + error);
            return callback(error, null);
        } else if (!result) {
            winston.debug("Could not get user: Email not found");
            return callback(null, null);
        } else {
            winston.debug("Found user");
            return callback(null, result);
        }
    })
}

// UPDATE
function updatePassword(id, passwordOld, passwordNew, callback) {
    winston.debug("Updating user password");
    getById(id, function(getError, user) {
        if(getError || !user) {
            winston.warn("Could not update user password (getError): " + getError);
            return callback(getError, null);
        } else {
            user.comparePassword(passwordOld, function (compareError, isMatch) {
                if (!compareError && isMatch) {
                    user.password = passwordNew;
                    user.save(function(saveError, saveResult) {
                        if (saveError || !saveResult) {
                            winston.warn("Could not update user password (saveError): " + saveError);
                            return callback(saveError, null);
                        } else {
                            winston.debug("User password updated");
                            return callback(null, saveResult);
                        }
                    })
                } else {
                    winston.warn("Could not update user password (compareError): " + compareError);
                    return callback(compareError, null);
                }
            })
        }
    })
}

function updateName(id, first, last, callback) {
    winston.debug("Updating user name");
    getById(id, function(getError, user) {
        if(getError || !user) {
            winston.warn("Could not update user name (getError): " + getError);
            return callback(getError, null);
        } else {
            if (first.length === 0) first = null;
            if (last.length === 0) last = null;
            if (!last && !first) {
                winston.warn("Could not update user name: No name provided");
                return callback();
            } else {
                if(first) user.firstName = first;
                if(last) user.lastName = last;
                user.save(function(saveError, saveResult) {
                    if (saveError || !saveResult) {
                        winston.warn("Could not update user name (saveError): " + saveError);
                        return callback(saveError, null);
                    } else {
                        winston.debug("User name updated");
                        return callback(null, saveResult);
                    }
                })
            }
        }
    })
}

function updateEmail(id, emailNew, callback) {
    winston.debug("Updating user email");
    getById(id, function(getError, user) {
        if(getError || !user) {
            winston.warn("Could not update user email (getError): " + getError);
            return callback(getError, null);
        } else {
            user.email = emailNew;
            user.save(function(saveError, saveResult) {
                if (saveError || !saveResult) {
                    winston.warn("Could not update user email (saveError): " + saveError);
                    return callback(saveError, null);
                } else {
                    winston.debug("User email updated");
                    return callback(null, saveResult);
                }
            })
        }
    })
}

function updateRole(id, roleNew, callback) {
    winston.debug("Updating user role");
    getById(id, function(getError, user) {
        if(getError || !user) {
            winston.warn("Could not update user role (getError): " + getError);
            return callback(getError, null);
        } else {
            user.role = roleNew;
            user.save(function(saveError, saveResult) {
                if (saveError || !saveResult) {
                    winston.warn("Could not update user role (saveError): " + saveError);
                    return callback(saveError, null);
                } else {
                    winston.debug("User role updated");
                    return callback(null, saveResult);
                }
            })
        }
    })
}

// DELETE
function deleteOne(id, callback) {
    winston.debug("Deleting user");
    User.deleteOne({ _id: id }, function(error) {
        if(error) {
            winston.warn("Could not delete user");
            return callback(error);
        } else {
            winston.debug("User deleted");
            membershipService.deleteAllByUserId(id, function(membershipError) {
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
    addOne,
    getByEmail,
    getById,
    updatePassword,
    updateName,
    updateEmail,
    updateRole,
    deleteOne
}