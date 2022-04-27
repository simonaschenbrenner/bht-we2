/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const winston = require("../../config/winston");
const Message = require("./messageModel.js");
const userService = require("../users/userService");
const groupService = require("../groups/groupService");
const threadService = require("../threads/threadService")

// CREATE
function addOne(data, callback) {
    winston.debug("Adding message");
    userService.getById({ _id: data.authorId }, function(getUserError, user) { // Check if user is in database
        if (getUserError || !user) {
            winston.warn("Could not add message (getUserError): " + getUserError);
            return callback(getUserError, null);
        } else {
            groupService.getById({ _id: data.groupId }, function(getGroupError, group) {
                if (getGroupError || !group) {
                    winston.warn("Could not add message (getGroupError): " + getGroupError);
                    return callback(getGroupError, null);
                } else {
                    threadService.getById({ _id: data.threadId }, function(getThreadError, thread) {
                        if (getThreadError || !thread) {
                            winston.warn("Could not add message (getThreadError): " + getThreadError);
                            return callback(getThreadError, null);
                        } else {
                            let newMessage = Message(data);
                            newMessage.save(function(saveMessageError, message) {
                                if (saveMessageError || !message) {
                                    winston.warn("Could not add message (saveMessageError): " + saveMessageError);
                                    return callback(saveMessageError, null);
                                } else {
                                    winston.debug("Added message");
                                    return callback(null, message);
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

// READ
function getAll(callback) {
    winston.debug("Getting all messages");
    Message.find({}, function(error, result) {
        if(error) {
            winston.warn("Could not get messages" + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get messages: No messages in database");
            return callback(null, null);
        } else {
            winston.debug("Found messages")
            return callback(null, result);
        }
    })
}

function getByAuthorId(authorId, callback) {
    winston.debug("Getting all messages the user has authored");
    Message.find({ authorId: authorId }, function(error, result) {
        if(error) {
            winston.warn("Could not get messages: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get messages: No threads with matching Author ID");
            return callback(null, null);
        } else {
            winston.debug("Found messages");
            return callback(null, result);
        }
    })
}

function getByGroupIdAndThreadId(groupId, threadId, callback) {
    winston.debug("Getting messages by group ID and thread ID");
    Message.find({ groupId: groupId, threadId: threadId }, function(error, result) {
        if(error) {
            winston.warn("Could not get messages: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get messages: No messages with matching IDs");
            return callback(null, null);
        } else {
            winston.debug("Found messages");
            return callback(null, result);
        }
    })
}

function getByGroupIdAndThreadIdAndAuthorId(groupId, threadId, authorId, callback) {
    winston.debug("Getting all messages that belong to the thread and the user has authored");
    Message.find({ groupId: groupId, threadId: threadId, authorId: authorId }, function(error, result) {
        if(error) {
            winston.warn("Could not get messages: " + error);
            return callback(error, null);
        } else if (!result || result.length === 0) {
            winston.debug("Could not get messages: No messages with matching IDs");
            return callback(null, null);
        } else {
            winston.debug("Found messages");
            return callback(null, result);
        }
    })
}

function getById(messageId, callback) {
    winston.debug("Getting message by ID");
    Message.findOne({ _id: messageId }, function(error, result) {
        if(error) {
            winston.warn("Could not get message: " + error);
            return callback(error, null);
        } else if (!result) {
            winston.debug("Could not get message: ID not found");
            return callback(null, null);
        } else {
            winston.debug("Found message");
            return callback(null, result);
        }
    })
}

function isAuthor(messageId, userId, callback){
    winston.debug("Checking if user is message author");
    getById(messageId, function(getError, message) {
        if (getError || !message) {
            winston.warn("Could not check if user is message author (getError): " + getError)
            return callback(getError, null);
        } else {
            if (String(message.authorId) === String(userId)) {
                winston.debug("User is message author");
                return callback(null, true);
            } else {
                winston.debug("User is not message author");
                return callback(null, false);
            }
        }
    })
}

// UPDATE
function update(messageId, data, callback) {
    winston.debug("Updating message");
    getById(messageId, function(getMessageError, message) {
        if (getMessageError || !message) {
            winston.warn("Could not update message (getMessageError): " + getMessageError);
            return callback(getMessageError, null);
        } else {
            message.content = data.content;
            message.attachment = data.attachment;
            message.save(function(saveMessageError, saveMessageResult) {
                if (saveMessageError || !saveMessageResult) {
                    winston.warn("Could not update message (saveMessageError): " + saveMessageError);
                    return callback(saveMessageError, null);
                } else {
                    winston.debug("Message updated");
                    return callback(null, saveMessageResult);
                }
            })
        }
    })
}

// DELETE
function deleteOne(messageId, callback) {
    winston.debug("Deleting message");
    Message.deleteOne({ _id: messageId }, function(error) {
        if(error) {
            winston.warn("Could not delete message: " + error);
            return callback(error);
        } else {
            winston.debug("Message deleted");
            return callback(null);
        }
    })
}

module.exports = {
    addOne,
    getAll,
    getByAuthorId,
    getByGroupIdAndThreadId,
    getByGroupIdAndThreadIdAndAuthorId,
    getById,
    isAuthor,
    update,
    deleteOne
}