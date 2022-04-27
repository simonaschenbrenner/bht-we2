/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const express = require("express");
const router = express.Router();

// GET home page
router.get("/", function(req, res, next) {
    res.send("Willkommen bei Mensa – Community-Website für Studierende");
});

module.exports = router;
