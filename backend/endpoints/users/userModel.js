/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("config");
const winston = require("../../config/winston");

// Global options
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Schema definition
const validEmailRegEx = config.db.validEmailRegEx;
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => {
                for (s of validEmailRegEx) {
                    if (new RegExp(s).test(v)) return true;
                }
                return false;
            },
            message: "Email address invalid"
        }
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        validate: {
            validator: (v) => {
                return /[A-Za-z]{2,10}[ -]?[A-Za-z]{0,10}/.test(v);
            },
            message: "First name invalid"
        }
    },
    lastName: {
        type: String,
        required: false,
        validate: {
            validator: (v) => {
                return /[A-Za-z]{2,15}[ -]?[A-Za-z]{0,15}/.test(v);
            },
            message: "Last name invalid"
        }
    },
    registered: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    }
})

// Hash password before saving
userSchema.pre("save", function (next) {
    var user = this;
    if (user.isModified("password")) {
        winston.silly("password modified, hashing")
        bcrypt.hash(user.password, 10).then((hashedPassword) => {
            user.password = hashedPassword;
            next();
        })
    } else next(); 
})

// Compare password
userSchema.methods.comparePassword = function(candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) return next(err, null);
        else next(null, isMatch);
    })
}

// Create Model
const User = mongoose.model("User", userSchema);

module.exports = User;