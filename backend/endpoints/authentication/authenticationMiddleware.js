/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const winston = require("../../config/winston");
const createError = require("http-errors");
const authenticationService = require("./authenticationService");
const userService = require("../users/userService");

function authenticate(req, res, next) {
    winston.debug("Authenticating user via token");
    let authHeader = req.headers.authorization;
    if (authHeader) {
        authHeader = authHeader.split(" ");
        if (authHeader[0] === "Bearer") {
            authenticationService.verifyToken(authHeader[1], function(tokenError, token, identifier) {
                winston.silly("Token: " + token);
                winston.silly("User ID: " + identifier._id);
                if (tokenError || !token || !identifier) {
                    winston.debug("Token could not be verified");
                    if (tokenError) winston.error(tokenError);
                    next(createError(401, "Unauthorized"));
                } else {
                    req.user = identifier._id;
                    req.role = null;
                    userService.getById(identifier._id, function(userError, user) {
                        if (userError || !user) {
                            winston.debug("User not found in database");
                            if (userError) winston.error(userError);
                            next(createError(401, "Unauthorized")); 
                        } else {
                            winston.debug("User authenticated")
                            winston.silly("User role: "+ user.role);
                            req.user = user._id;
                            req.role = user.role;
                            res.header("Authorization", `Bearer ${token}`);
                            next();
                        }
                    })
                }
            });
        } else {
            winston.debug("No 'Bearer' keyword in authorization header");
            next(createError(401, "Unauthorized")); 
        }
    } else {
        winston.debug("No authorization header");
        next(createError(401, "Unauthorized")); 
    }
}

module.exports = authenticate;