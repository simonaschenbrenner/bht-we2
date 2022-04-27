/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const express = require("express");
const morgan = require("morgan"); // Logger
const winston = require("./config/winston"); // Logger
const authenticate = require("./endpoints/authentication/authenticationMiddleware");
const index = require("./endpoints/index.js"); // Routes
const database = require("./data/db");
const startup = require("./data/startup");
const createError = require("http-errors");
const cors = require("cors");

// Express setup
const app = express();
app.use(morgan("combined", { stream: winston.stream }));

app.use("*", cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content- Type, Accept");
    res.header("Access-Control-Expose-Headers", "Authorization");
    next();
})

app.use(function(req, res, next) { // Log requests
    winston.info(`${req.ip} ${req.method} ${req.originalUrl}`);
    next();
});
app.use(express.json());

// Routes setup
app.use("/", index.homeRoute);
app.use("/login", index.authenticationRoute);
app.use("/users", (req, res, next) => authenticate(req, res, next), index.userRoute);
app.use("/groups", index.groupRoute);
app.use("/memberships", (req, res, next) => authenticate(req, res, next), index.membershipRoute);
app.use("/threads", index.threadRoute);
app.use("/messages", (req, res, next) => authenticate(req, res, next), index.messageRoute);

// Database setup
database.initDB(function(dbError, db) {
    if(db) {
        winston.info("Database initiated");
        startup.createInitialEntities(function(startupError) {
            if(startupError) winston.warn("No initial entities for " + startupError + " created, you may want to drop the database before restarting the server");
            else winston.info("Database populated with initial entities");
        })
    } else winston.error("Database not initiated: " + dbError);
})

// Error handling
app.use(function(req, res, next) { next(createError(404, "Not found")); }); // Catch 404 and forward to error handler
app.use(function(err, req, res, next) { // error handler
    winston.error(`${err.status || 500} ${err.message} - ${req.ip} ${req.method} ${req.originalUrl}`);
    res.status(err.status || 500);
    res.send(`Error ${err.status} "${err.message}"`);
});

module.exports = app;
