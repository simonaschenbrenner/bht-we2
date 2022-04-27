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
const groupService = require("./groupService");
const membershipService = require("../memberships/membershipService")
const AccessControl = require('accesscontrol');
const authenticate = require("../authentication/authenticationMiddleware");

const ac = new AccessControl(config.get("authorization.grants"));

// GET all groups
router.get("/all", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("groupRoute.get - get all groups");
    let userId = (req.query.uid) ? decodeURIComponent(req.query.uid) : null;
    if(!userId) {
        groupService.getAll(function(error, data) {
            if (error || !data) {
                winston.error("Could not get groups: " + error);
                next(createError(500, "Could not get groups"));
            } else {
                if (ac.can(req.role).readAny("groups").granted) {
                    res.status(200);
                    res.send(data);
                } else { // Only public groups
                    let result = [];
                    for (let group of data) {
                        if (group.private === false) result.push(group);
                    }
                    res.status(200);
                    res.send(result);
                }
            }
        })
    } else {
        groupService.getByAdminId(userId, function(error, data) {
            if (error || !data) {
                winston.error("Could not get groups: " + error);
                next(createError(500, "Could not get groups"));
            } else {
                let permission = (req.user === userId) ? ac.can(req.role).readOwn("groups") : ac.can(req.role).readAny("groups");
                if (permission.granted) {
                    res.status(200);
                    res.send(data);
                } else {
                    winston.debug("User not authorized");
                    next(createError(403, "You are not authorized to view this group"));
                }
            }
        })
    }
})

// GET all public groups (no authentication required!)
router.get("/public", function(req, res, next) {
    winston.info("groupRoute.get - get all public groups");
    groupService.getAllPublic(function(error, data) {
        if (error || !data) {
            winston.error("Could not get groups: " + error);
            next(createError(500, "Could not get groups"));
        } else {
            res.status(200);
            res.send(data);
        }
    })
})

// GET groups by name
router.get("/find", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("groupRoute.get - get group by name");
    let name = decodeURIComponent(req.query.name);
    console.log(name);
    groupService.getByName(name, function(error, data) {
        if (error || !data) {
            winston.error("Could not get groups: " + error);
            next(createError(500, "Could not get groups"));
        } else {
            if (ac.can(req.role).readAny("groups").granted) {
                res.status(200);
                res.send(data);
            } else { // Only public groups
                let result = [];
                for (let group of data) {
                    if (group.private === false) result.push(group);
                }
                res.status(200);
                res.send(result);
            }
        }
    })
})

// GET group by ID
router.get("/:group", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("groupRoute.get - get group by ID");
    groupService.getById(req.params.group, function(error, group) {
        if (error || !group) {
            winston.error("Could not get group: " + error);
            next(createError(500, "Could not get group"));
        } else {
            if (ac.can(req.role).readAny("groups").granted || group.private === false) {
                res.status(200);
                res.send(group);
            } else {
                membershipService.getByGroupIdAndUserId(req.user, group._id, function(error, member) {
                    if (error) winston.error("Could not check membership: " + error)
                    else if (member) {
                        if (ac.can(req.role).readOwn("groups").granted) {
                            res.status(200);
                            res.send(group);
                        } else {
                            winston.debug("User not authorized");
                            next(createError(403, "You are not authorized to view this group"));
                        }
                    } else {
                        winston.debug("User not authorized");
                        next(createError(403, "You are not authorized to view this group"));    
                    }
                })
            }
        }
    })
})

// POST add new group
router.post("/add", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("groupRoute.post - create new group");
    if (ac.can(req.role).createAny("groups").granted) {
        let groupData = { name: req.body.name, adminId: req.user, private: req.body.private };
        groupService.addOne(groupData, function(error, group) {
            if (group) {
                res.status(200);
                res.send(group);
            } else {
                winston.error("Could not add new group: " + error);
                next(createError(500, "Could not add new group"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to add a new group"));    
    }
})

// PUT update group name
router.put("/:group/edit/name", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("groupRoute.put - update group name");
    groupService.isAdmin(req.params.group, req.user, function(error, isGroupAdmin) {
        let canUpdateAny = ac.can(req.role).updateAny("groups").granted;
        let canUpdateOwn = ac.can(req.role).updateOwn("groups").granted;
        if (error) {
            winston.error("Could not update group name: " + error);
            next(createError(500, "Could not update group name"));
        } else if (canUpdateAny || (isGroupAdmin && canUpdateOwn)) {
            groupService.updateName(req.params.group, req.body.name, function (error, group) {
                if (group) {
                    res.status(200);
                    res.send(group);
                } else {
                    winston.error("Could not update group name: " + error);
                    next(createError(500, "Could not update group name"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to update this group name"));            
        }
    })
})

// PUT update group admin ID
router.put("/:group/edit/admin", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("groupRoute.put - update group admin ID");
    groupService.isAdmin(req.params.group, req.user, function(error, isGroupAdmin) {
        let canUpdateAny = ac.can(req.role).updateAny("groups").granted;
        let canUpdateOwn = ac.can(req.role).updateOwn("groups").granted;
        if (error) {
            winston.error("Could not update group admin ID: " + error);
            next(createError(500, "Could not update group admin ID"));
        } else if (canUpdateAny || (isGroupAdmin && canUpdateOwn)) {
            groupService.updateAdminId(req.params.group, req.body.adminId, function (error, group) {
                if (group) {
                    res.status(200);
                    res.send(group);
                } else {
                    winston.error("Could not update group admin ID: " + error);
                    next(createError(500, "Could not update group admin"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to update this group admin"));            
        }
    })
})

// PUT update group visbility
router.put("/:group/edit/visibility", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("groupRout.put - update group visibility");
    groupService.isAdmin(req.params.group, req.user, function(error, isGroupAdmin) {
        let canUpdateAny = ac.can(req.role).updateAny("groups").granted;
        let canUpdateOwn = ac.can(req.role).updateOwn("groups").granted;
        if (error) {
            winston.error("Could not update group visibility: " + error);
            next(createError(500, "Could not update group visibility"));
        } else if (canUpdateAny || (isGroupAdmin && canUpdateOwn)) {
            let private = (decodeURIComponent(req.query.private) === "true") ? true : false;
            if (private) {
                groupService.updatePrivate(req.params.group, function(error, group) {
                    if (group) {
                        res.status(200);
                        res.send(group);
                    } else {
                        winston.error("Could not update group visibility to private: " + error);
                        next(createError(500, "Could not update group visibility to private"));
                    }
                })
            } else {
                groupService.updatePublic(req.params.group, function(error, group) {
                    if (group) {
                        res.status(200);
                        res.send(group);
                    } else {
                        winston.error("Could not update group visibility to public: " + error);
                        next(createError(500, "Could not update group visibility to public"));
                    }
                })
            }
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to update this group visibility"));            
        }
    })
})

// DELETE a group
router.delete("/:group", (req, res, next) => authenticate(req, res, next), function(req, res, next) {
    winston.info("groupRoute.delete - delete a group");
    groupService.isAdmin(req.params.group, req.user, function(error, isGroupAdmin) {
        let canDeleteAny = ac.can(req.role).deleteAny("groups").granted;
        let canDeleteOwn = ac.can(req.role).deleteOwn("groups").granted;
        if (error) {
            winston.error("Could not delete group: " + error);
            next(createError(500, "Could not delete group"));
        } else if (canDeleteAny || (isGroupAdmin && canDeleteOwn)) {
            groupService.deleteOne(req.params.group, function(error) {
                if(!error) {
                    res.status(200);
                    res.send("Group deleted");
                } else {
                    winston.error("Could not delete group: " + error);
                    next(createError(500, "Could not delete group"));
                }
            })
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to delete this group"));
        }
    })
})

module.exports = router;