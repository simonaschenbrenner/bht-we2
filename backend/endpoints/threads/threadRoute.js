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
const threadService = require("./threadService");
const groupService = require("../groups/groupService");
const membershipService = require("../memberships/membershipService");
const AccessControl = require('accesscontrol');
const authenticate = require("../authentication/authenticationMiddleware");

const ac = new AccessControl(config.get("authorization.grants"));

// GET threads of public group (no authentication required!)
router.get("/public", function(req, res, next) {
    winston.info("threadRoute.get - get threads of public group");
    let groupId = decodeURIComponent(req.query.gid);
    if (!groupId) {
        winston.error("Could not get threads of public group: No group ID provided");
        next(createError(500, "Could not get threads"));
    } else {
        groupService.isPublic(groupId, function(error, public) {
            if (error) {
                winston.error("Could not check if group is public: " + error);
                next(createError(500, "Could not check if group is public"));
            } else if (!public) {
                winston.debug("Group is private");
                next(createError(403, "You are not authorized to view threads of this group"));     
            } else {
                threadService.getByGroupId(groupId, function(error, threads) {
                    if(error) {
                        winston.error("Could not get threads: " + error);
                        next(createError(500, "Could not get threads"));
                    } else if (!threads) {
                        res.status(200);
                        res.send([]);
                    } else {
                        res.status(200);
                        res.send(threads);
                    }
                })
            }  
        })
    }
})

// GET threads
router.get("/all", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("threadRoute.get - get threads");
    let userId = (req.query.uid) ? decodeURIComponent(req.query.uid) : null;
    let groupId = (req.query.gid) ? decodeURIComponent(req.query.gid) : null;
    let canReadAny = ac.can(req.role).readAny("threads").granted;
    let canReadOwn = ac.can(req.role).readOwn("threads").granted;
    winston.silly("user ID: " + userId + ", group ID: " + groupId);
    if(!userId) {
        if(!groupId) {
            if (canReadAny) { // User has admin role
                threadService.getAll(function(error, data) {
                    if(data) {
                        res.status(200);
                        res.send(data);
                    } else {
                        winston.error("Could not get threads: " + error);
                        next(createError(500, "Could not get threads"));
                    }
                })
            } else {
                winston.debug("User not authorized");
                next(createError(403, "You are not authorized to view all threads"));        
            }
        } else { // (groupId != null)
            membershipService.getByGroupIdAndUserId(req.user, groupId, function(error, member) {
                if (error) winston.error("Could not check membership: " + error);
                if (canReadAny || (member && canReadOwn)) {
                    threadService.getByGroupId(groupId, function(error, data) {
                        if(data) {
                            res.status(200);
                            res.send(data);
                        } else {
                            winston.error("Could not get threads: " + error);
                            next(createError(500, "Could not get threads"));
                        }
                    })
                } else {
                    winston.debug("User not authorized");
                    next(createError(403, "You are not authorized to view these threads")); 
                }
            })
        }
    } else { // (userId != null)
        if (!groupId) {
            if (canReadAny || (userId === req.user && canReadOwn)) {
                threadService.getByAdminId(userId, function(error, data) {
                    if(data) {
                        res.status(200);
                        res.send(data);
                    } else {
                        winston.error("Could not get threads: " + error);
                        next(createError(500, "Could not get threads"));
                    }
                })
            } else {
                winston.debug("User not authorized");
                next(createError(403, "You are not authorized to view these threads")); 
            }
        } else { // (groupId != null)
            if (canReadAny || (userId === req.user && canReadOwn)) {
                threadService.getByGroupIdAndAdminId(groupId, userId, function(error, data) {
                    if(data) {
                        res.status(200);
                        res.send(data);
                    } else {
                        winston.error("Could not get threads: " + error);
                        next(createError(500, "Could not get threads"));
                    }
                })
            } else {
                winston.debug("User not authorized");
                next(createError(403, "You are not authorized to view these threads"));
            }
        }
    }
})

// GET threads by name
router.get("/find", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("threadRoute.get - get threads by name");
    let name = (req.query.name) ? decodeURIComponent(req.query.name) : null;
    let groupId = (req.query.gid) ? decodeURIComponent(req.query.gid) : null;
    winston.silly("name: " + name + ", group ID: " + groupId);
    if (!groupId || !name) {
        let errorMessage = "No groupId and name provided";
        winston.warn("Could not get threads: " + errorMessage);
        next(createError(500, "Could not find threads: " + errorMessage));
    } else {
        threadService.getByGroupIdAndName(groupId, name, function(error, data) {
            if (error || !data) {
                winston.error("Could not get threads: " + error);
                next(createError(500, "Could not get threads"));
            } else {
                if (ac.can(req.role).readAny("threads").granted) {
                    res.status(200);
                    res.send(data);
                } else {
                    membershipService.getByGroupIdAndUserId(groupId, req.user, function(error, member) {
                        if (error) winston.error("Could not check membership: " + error);
                        if (member && ac.can(req.role).readOwn("threads").granted) {
                            res.status(200);
                            res.send(data);
                        }
                    })
                }
            }
        })
    }
})

// GET thread by ID
router.get("/:thread", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("threadRoute.get - get thread by ID");
    threadService.getById(req.params.thread, function(error, thread) {
        if (error || !thread) {
            winston.error("Could not get thread: " + error);
            next(createError(500, "Could not get thread"));
        } else {
            if (ac.can(req.role).readAny("threads").granted) {
                res.status(200);
                res.send(thread);
            } else {
                membershipService.getByGroupIdAndUserId(thread.groupId, req.user, function(error, member) {
                    if (error) winston.error("Could not check membership: " + error);
                    if (member && ac.can(req.role).readOwn("threads").granted) {
                        res.status(200);
                        res.send(thread);
                    }
                })
            }
        }
    })
})

// POST add new thread
router.post("/add", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("threadRoute.post - create new thread");
    let canCreateAny = ac.can(req.role).createAny("threads").granted;
    let canCreateOwn = ac.can(req.role).createOwn("threads").granted;
    membershipService.getByGroupIdAndUserId(req.user, req.body.groupId, function(error, member) {
        if (error) winston.error("Could not check membership: " + error);
        if (canCreateAny || (member && canCreateOwn)) {
            let threadData = { name: req.body.name, groupId: req.body.groupId, adminId: req.user };
            threadService.addOne(threadData, function(error, thread) {
                if (thread) {
                    res.status(200);
                    res.send(thread);
                } else {
                    winston.error("Could not add new thread: " + error);
                    next(createError(500, "Could not add new thread"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to add a new thread"));    
        }
    })
})

// PUT update thread name
router.put("/:thread/edit/name", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("threadRoute.put - update thread name");
    threadService.isAdmin(req.params.thread, req.user, function(error, isThreadAdmin) {
        let canUpdateAny = ac.can(req.role).updateAny("threads").granted;
        let canUpdateOwn = ac.can(req.role).updateOwn("threads").granted;
        if (error) {
            winston.error("Could not update thread name: " + error);
            next(createError(500, "Could not update thread name"));
        } else if (canUpdateAny || (isThreadAdmin && canUpdateOwn)) {
            threadService.updateName(req.params.thread, req.body.name, function (error, thread) {
                if (thread) {
                    res.status(200);
                    res.send(thread);
                } else {
                    winston.error("Could not update thread name: " + error);
                    next(createError(500, "Could not update thread name"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to update this thread name"));            
        }
    })
})

// PUT update thread admin ID
router.put("/:thread/edit/admin", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("threadRoute.put - update thread admin ID");
    threadService.isAdmin(req.params.thread, req.user, function(error, isThreadAdmin) {
        let canUpdateAny = ac.can(req.role).updateAny("threads").granted;
        let canUpdateOwn = ac.can(req.role).updateOwn("threads").granted;
        if (error) {
            winston.error("Could not update thread admin ID: " + error);
            next(createError(500, "Could not update thread admin ID"));
        } else if (canUpdateAny || (isThreadAdmin && canUpdateOwn)) {
            threadService.updateAdminId(req.params.thread, req.body.adminId, function (error, thread) {
                if (thread) {
                    res.status(200);
                    res.send(thread);
                } else {
                    winston.error("Could not update thread admin ID: " + error);
                    next(createError(500, "Could not update thread admin"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to update this thread admin"));            
        }
    })
})

// DELETE a thread
router.delete("/:thread", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("threadRoute.delete - delete a thread");
    threadService.isAdmin(req.params.thread, req.user, function(error, isThreadAdmin) {
        let canDeleteAny = ac.can(req.role).deleteAny("threads").granted;
        let canDeleteOwn = ac.can(req.role).deleteOwn("threads").granted;
        if (error) {
            winston.error("Could not delete thread: " + error);
            next(createError(500, "Could not delete thread"));
        } else if (canDeleteAny || (isThreadAdmin && canDeleteOwn)) {
            threadService.deleteOne(req.params.thread, function(error) {
                if(!error) {
                    res.status(200);
                    res.send("Thread deleted");
                } else {
                    winston.error("Could not delete thread: " + error);
                    next(createError(500, "Could not delete thread"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to delete this group"));
        }
    })
})

module.exports = router;