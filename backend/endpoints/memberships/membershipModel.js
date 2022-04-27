/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

const mongoose = require("mongoose");

// Global options
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Schema definition
const membershipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true
    },
    groupId: {
        type: mongoose.ObjectId,
        ref: "Group",
        required: true
    },
    color: {
        type: [Number],
        validate: {
            validator: (v) => {
                let i = 0;
                for (let c of v) {
                    i++;
                    if(c < 0 || c > 255) return false;
                }
                if (i === 3) return true;
                else return false;
            },
            message: "Color invalid"
        },
        default: [Math.trunc(Math.random()*256), Math.trunc(Math.random()*256), Math.trunc(Math.random()*256)]
    }
})

// Compound Index to avoid duplicates
membershipSchema.index({ "userId": 1, "groupId": 1 }, { unique: true });

// Create Model
const Membership = mongoose.model("Membership", membershipSchema);

module.exports = Membership;
    