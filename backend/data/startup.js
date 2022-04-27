/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const winston = require("../config/winston");
const config = require("config");
const userService = require("../endpoints/users/userService.js");
const groupService = require("../endpoints/groups/groupService.js");
const threadService = require("../endpoints/threads/threadService.js");

const initUserEmail = config.db.initUserEmail;
const initUserPassword = config.db.initUserPassword;
const initUserName = config.db.initUserName;
const initGroupName = config.db.initGroupName;
const initThreadName = config.db.initThreadName;

function createInitialEntities(callback) {
    let entities = ["User", "Group", "Membership", "Thread"];
    winston.debug("Populating database with initial entities of " + entities);
    winston.silly("Initial User: " + initUserName);
    winston.silly("Initial Group: " + initGroupName);
    winston.silly("Initial Thread: " + initThreadName);
    userService.getByEmail(initUserEmail, function(getUserError, getUserResult) {
        if (getUserError || getUserResult) {
            if (getUserError) winston.warn("Could not check if user model is empty");
            if (getUserResult) winston.warn(`User model already contains an user "${initUserName}"`);
            return callback(entities.slice())
        } else {
            userService.addOne({ email: initUserEmail, password: initUserPassword, firstName: initUserName, role: "admin" }, function(addUserError, user) {
                if(addUserError || !user) {
                    winston.error(`Could not create user "${initUserName}": ${addUserError}`);
                    return callback(entities.slice());
                } else {
                    winston.debug(`Initial user "${initUserName}" created`);
                    groupService.getByName(initGroupName, function(getGroupError, getGroupResult) {
                        if (getGroupError || getGroupResult) {
                            if (getGroupError) winston.warn("Could not check if group model is empty");
                            if (getGroupResult) winston.warn(`Group model already contains a group "${initGroupName}"`);
                            return callback(entities.slice(1));
                        } else {
                            groupService.addOne({ name: initGroupName, adminId: user._id, private: false }, function(addGroupError, group) {
                                if(addGroupError || !group) {
                                    winston.error(`Could not create group "${initGroupName}": ${addGroupError}`);
                                    return callback(entities.slice(1));
                                } else {
                                    winston.debug(`Initial group "${initGroupName}" and membership of "${initUserName}" created`);
                                    threadService.getByGroupIdAndName(group._id, initThreadName, function(getThreadError, getThreadResult) {
                                        if(getThreadError || getThreadResult) {
                                            if (getThreadError) winston.warn("Could not check if thread model is empty");
                                            if (getThreadResult) winston.warn(`Thread model already contains a thread "${initThreadName}"`);
                                            return callback(entities.slice(3));
                                        } else {
                                            threadService.addOne({ name: initThreadName, groupId: group._id, adminId: user._id }, function(addThreadError, thread) {
                                                if(addThreadError || !thread) {
                                                    winston.error(`Could not create thread "${initThreadName}": ${addThreadError}`);
                                                    return callback(entities.slice(3));
                                                } else {
                                                    winston.debug(`Initial thread "${initThreadName}" created`);
                                                    return callback();
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
    })
}

module.exports = {
    createInitialEntities
}