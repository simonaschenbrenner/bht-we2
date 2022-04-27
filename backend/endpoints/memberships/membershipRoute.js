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
const membershipService = require("./membershipService");
const AccessControl = require('accesscontrol');

const ac = new AccessControl(config.get("authorization.grants"));

// GET memberships
router.get("/", function(req, res, next) {
    winston.info("membershipRoute.get - get memberships");
    let userId = (req.query.uid) ? decodeURIComponent(req.query.uid) : null;
    let groupId = (req.query.gid) ? decodeURIComponent(req.query.gid) : null;
    winston.silly("user ID: " + userId + ", group ID: " + groupId);
    if(!userId) { // Users with user role can only view their own memberships, hence they must provide an user ID
        if (ac.can(req.role).readAny("memberships").granted) { // User has admin role
            if(!groupId) {
                membershipService.getAll(function(error, data) {
                    if(data) {
                        var result = [];
                        for (let membership of data) {
                            result.push(membership);
                        }
                        res.status(200);
                        res.send(result);
                    } else {
                        winston.error("Could not get memberships: " + error);
                        next(createError(500, "Could not get memberships"));
                    }
                })
            } else {
                membershipService.getByGroupId(groupId, function(error, data) {
                    if(data) {
                        var result = [];
                        for (let membership of data) {
                            result.push(membership);
                        }
                        res.status(200);
                        res.send(result);
                    } else {
                        winston.error("Could not get memberships: " + error);
                        next(createError(500, "Could not get memberships"));
                    }
                })
            }
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to view all memberships"));
        }
    } else { // (userId != null)
        let permission = (req.user === userId) ? ac.can(req.role).readOwn("memberships") : ac.can(req.role).readAny("memberships"); // Users with user role can only view their own memberships
        if (permission.granted) {
            if(!groupId) {
                membershipService.getByUserId(userId, function(error, data) {
                    if(data) {
                        var result = [];
                        for (let membership of data) {
                            result.push(membership);
                        }
                        res.status(200);
                        res.send(result);
                    } else {
                        winston.error("Could not get memberships: " + error);
                        next(createError(500, "Could not get memberships"));
                    }
                })
            } else { // (groupId != null)
                membershipService.getByGroupIdAndUserId(userId, groupId, function(error, membership) {
                    if(membership) {
                        res.status(200);
                        res.send(membership);
                    } else {
                        winston.error("Could not get membership: " + error);
                        next(createError(500, "Could not get membership"));
                    }
                })
            }
        } else {
            winston.debug("User not authorized");
            next(createError(403, "You are not authorized to view these memberships"));
        }
    }
})

// POST add new membership
router.post("/add", function (req, res, next) {
    winston.info("membershipRoute.post - create new membership");
    let permission = (req.user === req.body.userId) ? ac.can(req.role).createOwn("memberships") : ac.can(req.role).createAny("memberships");
    if (permission.granted) {
        membershipService.addOne(req.body, function(error, membership) {
            if(membership) {
                res.status(200);
                res.send(membership);
            } else {
                winston.error("Could not add new membership: " + error);
                next(createError(500, "Could not add new membership"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to add a new membership"));
    }
})

// PUT update membership color
router.put("/edit", function (req, res, next) {
    winston.info("membershipRoute.put - update membership color");
    let permission = (req.user === req.body.userId) ? ac.can(req.role).updateOwn("memberships") : ac.can(req.role).updateAny("memberships");
    if (permission.granted) {
        membershipService.updateColor(req.body, function(error, membership) {
            if(membership) {
                res.status(200);
                res.send(membership);
            } else {
                winston.error("Could not update membership color: " + error);
                next(createError(500, "Could not update membership color"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to update this memberships color"));
    }
})

// DELETE a membership
router.delete("/", function(req, res, next) {
    winston.info("membershipRoute.delete - delete a membership");
    let userId = decodeURIComponent(req.query.uid);
    let groupId = decodeURIComponent(req.query.gid);
    let permission = (req.user === userId) ? ac.can(req.role).deleteOwn("memberships") : ac.can(req.role).deleteAny("memberships");
    if (permission.granted) {
        membershipService.deleteOne(userId, groupId, function(error) {
            if(!error) {
                res.status(200);
                res.send("Membership deleted");
            } else {
                winston.error("Could not delete membership: " + error);
                next(createError(500, "Could not delete membership"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to delete this membership"));
    }
})

module.exports = router;