/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const express = require("express");
const winston = require("../../config/winston");
const router = express.Router();
const createError = require("http-errors");
const authenticationService = require("./authenticationService");

// POST login
router.post("/", function(req, res, next) {
    winston.info("login.post");
    let authHeader = req.headers.authorization;
    if (authHeader) {
        authHeader = authHeader.split(" ");
        if (authHeader[0] === "Basic") {
            let credentials = Buffer.from(authHeader[1], 'base64').toString('ascii');
            let [username, password] = credentials.split(':');
            authenticationService.login(username, password, function(err, token, user) {
                if (token) {
                    res.header("Authorization", `Bearer ${token}`);
                    if (user) {
                        res.status(200);
                        res.header("Authorization", `Bearer ${token}`);
                        res.send({ id: user._id, firstName: user.firstName, role: user.role });
                    } else {
                        winston.error("User is null, even though token has been created: " + err);
                        next(createError(500, "Could not authenticate"));
                    }
                } else {
                    winston.error("Could not authenticate: " + err);
                    next(createError(500, "Could not authenticate"));
                }
            })
        } else {
            winston.debug("No 'Basic' keyword in authorization header");
            next(createError(500, "Could not authenticate"));
        }
    } else {
        winston.debug("No authorization header");
        next(createError(500, "Could not authenticate"));
    }
});

module.exports = router;