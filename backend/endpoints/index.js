/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const homeRoute = require("./home/homeRoute");
const authenticationRoute = require("./authentication/authenticationRoute");
const userRoute = require("./users/userRoute");
const groupRoute = require("./groups/groupRoute");
const membershipRoute = require("./memberships/membershipRoute");
const threadRoute = require("./threads/threadRoute");
const messageRoute = require("./messages/messageRoute");

module.exports = {
    homeRoute,
    authenticationRoute,
    userRoute,
    groupRoute,
    membershipRoute,
    threadRoute,
    messageRoute
};
