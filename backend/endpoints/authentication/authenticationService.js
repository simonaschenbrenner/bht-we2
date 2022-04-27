/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const jwt = require("jsonwebtoken");
const config = require("config");
const winston = require("../../config/winston");
const userService = require("../users/userService");

const tokenKey = config.get("session.tokenKey");
const tokenAlgorithm = config.get("session.tokenAlgorithm")
const tokenExpiry = config.get("session.tokenExpiry")
const tokenRenewal = config.get("session.tokenRenewal")

function login(email, password, callback) {
    winston.debug("Authenticating user via credentials");
    if(!email) {
        winston.debug("Could not authenticate: No username provided");
        return callback();
    }
    if(!password) {
        winston.debug("Could not authenticate: No password provided");
        return callback();
    }
    userService.getByEmail(email, (getError, user) => {
        if(getError) {
            winston.warn("Could not authenticate (getError): " + getError);
            return callback(getError);
        }
        else if(user) {
            user.comparePassword(password, function (compareError, isMatch) {
                if (!compareError && isMatch) {
                    winston.debug("User authenticated, creating token");
                    return createToken(user, callback);
                } else if (compareError) {
                    winston.warn("Could not authenticate (compareError): " + compareError);
                    return callback(compareError);
                } else {
                    let errorMessage = "Wrong password";
                    winston.debug(errorMessage);
                    return callback(errorMessage);
                }
            })
        } else {
            let errorMessage = "Wrong email";
            winston.debug(errorMessage);
            return callback(errorMessage);
        }
    });
}

function verifyToken(token, callback) {
    winston.debug("Verifying token");
    jwt.verify(token, tokenKey, { algorithm: tokenAlgorithm }, (error, payload) => {
        if (error || !payload) {
            winston.warn("Could not verify token, user not authenticated: " + error)
            return callback(error);
        } else {
            winston.debug("Token verified");
            let identifier = { "_id": payload._id }
            const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
            if (payload.exp - nowUnixSeconds < tokenRenewal) {
                winston.debug("Token about to expire, creating new token");
                return createToken(identifier, callback);
            }
        return callback(null, token, identifier);
        }
    })
}

function createToken(user, callback) {
    jwt.sign({ "_id": user._id }, tokenKey, { algorithm: tokenAlgorithm, expiresIn: tokenExpiry }, function(error, token) {
        if(error || !token) {
            winston.error("Could not create new token: " + error);
            return callback(error);
        } else {
            winston.silly("New Token: " + token);
            winston.silly("User ID: " + user._id);
            return callback(null, token, user);
        }
    });
}

module.exports = {
    login,
    verifyToken
}