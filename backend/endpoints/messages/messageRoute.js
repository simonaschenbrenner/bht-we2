/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const express = require("express");
const winston = require("../../config/winston");
const config = require("config");
const router = express.Router();
const createError = require("http-errors");
const messageService = require("./messageService");
const membershipService = require("../memberships/membershipService");
const AccessControl = require('accesscontrol');

const ac = new AccessControl(config.get("authorization.grants"));

// GET messages
router.get("/all", function(req, res, next) {
    winston.info("messageRoute.get - get messages");
    let userId = (req.query.uid) ? decodeURIComponent(req.query.uid) : null;
    let groupId = (req.query.gid) ? decodeURIComponent(req.query.gid) : null;
    let threadId = (req.query.tid) ? decodeURIComponent(req.query.tid) : null;
    let canReadAny = ac.can(req.role).readAny("messages").granted;
    let canReadOwn = ac.can(req.role).readOwn("messages").granted;
    winston.silly("user ID: " + userId + ", group ID: " + groupId + ", thread ID: " + threadId);
    if(!userId) {
        if(!groupId && !threadId) {
            if (canReadAny) { // User has admin role
                messageService.getAll(function(error, data) {
                    if(data) {
                        res.status(200);
                        res.send(data);
                    } else {
                        winston.error("Could not get messages: " + error);
                        next(createError(500, "Could not get messages"));
                    }
                })
            } else {
                winston.debug("User not authorized");
                next(createError(403, "You are not authorized to view all messages"));        
            }
        } else if (groupId && threadId) {
            membershipService.getByGroupIdAndUserId(req.user, groupId, function(error, member) {
                if (error) winston.error("Could not check membership: " + error);
                if (canReadAny || (member && canReadOwn)) {
                    messageService.getByGroupIdAndThreadId(groupId, threadId, function(error, data) {
                        if(data) {
                            res.status(200);
                            res.send(data);
                        } else {
                            winston.error("Could not get messages: " + error);
                            next(createError(500, "Could not get messages"));
                        }
                    })
                } else {
                    winston.debug("User not authorized");
                    next(createError(403, "You are not authorized to view these messages")); 
                }
            })
        } else {
            winston.debug("Group ID or Thread ID missing from request");
            next(createError(500, "You must provide both the group ID and the thread ID to view messages")); 
        }
    } else { // (userId != null)
        if (!groupId && !threadId) {
            if (canReadAny || (userId === req.user && canReadOwn)) {
                messageService.getByAuthorId(userId, function(error, data) {
                    if(data) {
                        res.status(200);
                        res.send(data);
                    } else {
                        winston.error("Could not get messages: " + error);
                        next(createError(500, "Could not get messages"));
                    }
                })
            } else {
                winston.debug("User not authorized");
                next(createError(403, "You are not authorized to view these messages")); 
            }
        } else if (groupId && threadId) {
            if (canReadAny || (userId === req.user && canReadOwn)) {
                messageService.getByGroupIdAndThreadIdAndAuthorId(groupId, threadId, userId, function(error, data) {
                    if(data) {
                        res.status(200);
                        res.send(data);
                    } else {
                        winston.error("Could not get messages: " + error);
                        next(createError(500, "Could not get messages"));
                    }
                })
            } else {
                winston.debug("User not authorized");
                next(createError(403, "You are not authorized to view these messages"));
            }
        } else {
            winston.debug("Group ID or Thread ID missing from request");
            next(createError(500, "You must provide both the group ID and the thread ID to view messages"));  
        }
    }
})

// GET message by ID
router.get("/:message", function(req, res, next) {
    winston.info("messageRoute.get - get message by ID");
    messageService.getById(req.params.message, function(error, message) {
        if (error || !message) {
            winston.error("Could not get message: " + error);
            next(createError(500, "Could not get message"));
        } else {
            if (ac.can(req.role).readAny("messages").granted) {
                res.status(200);
                res.send(message);
            } else {
                membershipService.getByGroupIdAndUserId(message.groupId, req.user, function(error, member) {
                    if (error) winston.error("Could not check membership: " + error);
                    if (member && ac.can(req.role).readOwn("messages").granted) {
                        res.status(200);
                        res.send(message);
                    }
                })
            }
        }
    })
})

// POST add new message
router.post("/add", function(req, res, next) {
    winston.info("messageRoute.post - create new message");
    let canCreateAny = ac.can(req.role).createAny("messages").granted;
    let canCreateOwn = ac.can(req.role).createOwn("messages").granted;
    membershipService.getByGroupIdAndUserId(req.user, req.body.groupId, function(error, member) {
        if (error) winston.error("Could not check membership: " + error);
        if (canCreateAny || (member && canCreateOwn)) {
            let contentData = (req.body.content) ? req.body.content : null;
            let attachmentData = (req.body.attachment) ? req.body.attachment : null;
            let messageData = { authorId: req.user, groupId: req.body.groupId, threadId: req.body.threadId, content: contentData, attachment: attachmentData };
            messageService.addOne(messageData, function(error, message) {
                if (message) {
                    res.status(200);
                    res.send(message);
                } else {
                    winston.error("Could not add new message: " + error);
                    next(createError(500, "Could not add new message"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to add a new message"));    
        }
    })
})

// PUT update message
router.put("/:message", function(req, res, next) {
    winston.info("messageRoute.put - update message");
    messageService.isAuthor(req.params.message, req.user, function(error, isMessageAuthor) {
        let canUpdateAny = ac.can(req.role).updateAny("messages").granted;
        let canUpdateOwn = ac.can(req.role).updateOwn("messages").granted;
        if (error) {
            winston.error("Could not update message: " + error);
            next(createError(500, "Could not update message"));
        } else if (canUpdateAny || (isMessageAuthor && canUpdateOwn)) {
            let contentData = (req.body.content) ? req.body.content : null;
            let attachmentData = (req.body.attachment) ? req.body.attachment : null;
            messageService.update(req.params.message, { content: contentData, attachment: attachmentData }, function (error, message) {
                if (message) {
                    res.status(200);
                    res.send(message);
                } else {
                    winston.error("Could not update message: " + error);
                    next(createError(500, "Could not update message"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to update this message"));            
        }
    })
})

// DELETE a message
router.delete("/:message", function(req, res, next) {
    winston.info("messageRoute.delete - delete a message");
    messageService.isAuthor(req.params.message, req.user, function(error, isMessageAuthor) {
        let canDeleteAny = ac.can(req.role).deleteAny("messages").granted;
        let canDeleteOwn = ac.can(req.role).deleteOwn("messages").granted;
        if (error) {
            winston.error("Could not delete message: " + error);
            next(createError(500, "Could not delete message"));
        } else if (canDeleteAny || (isMessageAuthor && canDeleteOwn)) {
            messageService.deleteOne(req.params.message, function(error) {
                if(!error) {
                    res.status(200);
                    res.send("Message deleted");
                } else {
                    winston.error("Could not delete message: " + error);
                    next(createError(500, "Could not delete message"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to delete this message"));
        }
    })
})

module.exports = router;