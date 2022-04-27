/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const mongoose = require("mongoose");
const winston = require("../config/winston");
const config = require("config");

var db;

function initDB(callback) {
    if (db) {
        if (callback) return callback(null, db);
        else return db;
    } else {
        mongoose.connect(config.db.url, config.db.options);
        db = mongoose.connection;
        db.on("error", console.error.bind(console, "Database connection error: "));
        db.once("open", function() {
            winston.debug("Database connected");
            if (callback) return callback(null, db);
            else return db;
        });
    }
}

function getDB() {
    if (db) return db;
    else return initDB;
}

module.exports = {
    initDB,
    getDB
}