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
const userService = require("./userService");
const AccessControl = require('accesscontrol');

const ac = new AccessControl(config.get("authorization.grants"));

// GET all users
router.get("/all", function(req, res, next) {
    winston.info("userRoute.get - get all users");
    let permission = ac.can(req.role).readAny("users");
    if (permission.granted) {
        userService.getAll(function(error, data) {
            if(data) {
                var result = [];
                for (let user of data) {
                    result.push(userSubset(user));
                }
                res.status(200);
                res.send(result);
            } else {
                winston.error("Could not get users: " + error);
                next(createError(500, "Could not get users"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to view all users"));
    }
})

// GET one user by Email
router.get("/find", function(req, res, next) {
    winston.info("userRoute.get - get user by email");
    let email = decodeURIComponent(req.query.email);
    let permission = (req.user === req.params.user) ? ac.can(req.role).readOwn("users") : ac.can(req.role).readAny("users");
    if (permission.granted) {
        userService.getByEmail(email, function(error, user) {
            if(user) {
                res.status(200);
                res.send(userSubset(user));
                // res.send(permission.filter(user));
            } else {
                winston.error("Could not get user: " + error);
                next(createError(500, "Could not get user"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to view this user"));
    }

})

// GET one user by ID
router.get("/:user", function(req, res, next) {
    winston.info("userRoute.get - get user by ID");
    let permission = (req.user === req.params.user) ? ac.can(req.role).readOwn("users") : ac.can(req.role).readAny("users");
    if (permission.granted) {
        userService.getById(req.params.user, function(error, user) {
            if(user) {
                res.status(200);
                res.header("Access-Control-Expose-Headers", "Authorization");
                res.send(userSubset(user));
            } else {
                winston.error("Could not get users: " + error);
                next(createError(500, "Could not get users"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to view this user"));
    }
})

// POST add new user
router.post("/add", function(req, res, next) {
    winston.info("userRoute.post - create new user");
    let permission = ac.can(req.role).createAny("users");
    if (permission.granted) {
        userService.addOne(req.body, function(error, user) {
            if(user) {
                res.status(200);
                res.send(userSubset(user));
            } else {
                winston.error("Could not add new user: " + error);
                next(createError(500, "Could not add new user"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to add a new user"));
    }
})

// PUT update user password
router.put("/:user/edit/password", function(req, res, next) {
    winston.info("userRoute.put - update user password");
    let permission = (req.user === req.params.user) ? ac.can(req.role).updateOwn("users", "password") : ac.can(req.role).updateAny("users", "password");
    if (permission.granted) {
        let { passwordOld, passwordNew } = req.body;
        userService.updatePassword(req.params.user, passwordOld, passwordNew, function(error, user) {
            if(user) {
                res.status(200);
                res.send(userSubset(user));
            } else {
                winston.error("Could not update user password: " + error);
                next(createError(500, "Could not update user password"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to update this users password"));
    }
})

// PUT update user name
router.put("/:user/edit/name", function(req, res, next) {
    winston.info("userRoute.put - update user name");
    let permission = (req.user === req.params.user) ? ac.can(req.role).updateOwn("users", "firstName", "lastName") : ac.can(req.role).updateAny("users", "firstName", "lastName");
    if (permission.granted) {
        let { firstName, lastName } = req.body;
        userService.updateName(req.params.user, firstName, lastName, function(error, user) {
            if(user) {
                res.status(200);
                res.send(userSubset(user));
            } else {
                winston.error("Could not update user name: " + error);
                next(createError(500, "Could not update user name"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to update this users name"));
    }
})

// PUT update user email
router.put("/:user/edit/email", function(req, res, next) {
    winston.info("userRoute.put - update user email");
    let permission = (req.user === req.params.user) ? ac.can(req.role).updateOwn("users", "email") : ac.can(req.role).updateAny("users", "email");
    if (permission.granted) {
        let { email } = req.body;
        userService.updateEmail(req.params.user, email, function(error, user) {
            if(user) {
                res.status(200);
                res.send(userSubset(user));
            } else {
                winston.error("Could not update user email: " + error);
                next(createError(500, "Could not update user email"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to update this users email"));
    }
})

// PUT update user role
router.put("/:user/edit/role", function(req, res, next) {
    winston.info("userRoute.put - update user role");
    let permission = ac.can(req.role).updateAny("users");
    if (permission.granted) {
        let { role } = req.body;
        userService.updateRole(req.params.user, role, function(error, user) {
            if(user) {
                res.status(200);
                res.send(userSubset(user));
            } else {
                winston.error("Could not update user role: " + error);
                next(createError(500, "Could not update user role"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to update this users role"));
    }
})

// DELETE a user
router.delete("/:user", function(req, res, next) {
    winston.info("userRoute.delete - delete a user");
    let permission = (req.user === req.params.user) ? ac.can(req.role).deleteOwn("users") : ac.can(req.role).deleteAny("users");
    if (permission.granted) {
        userService.deleteOne(req.params.user, function(error) {
            if(!error) {
                res.status(200);
                res.send("User deleted");
            } else {
                winston.error("Could not delete user: " + error);
                next(createError(500, "Could not delete user"));
            }
        })
    } else {
        winston.debug("User not authorized");
        next(createError(403, "You are not authorized to delete this user"));
    }
})

// Remove hashed password from response to client
function userSubset(user) {
    if (!user) return null;
    else {
        let { _id, email, firstName, lastName, registered, role } = user;
        let subset = { _id, email, firstName, lastName, registered, role };
        return subset;
    }
}

module.exports = router;
