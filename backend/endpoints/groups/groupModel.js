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
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: (v) => {
                return /[\w-+&#()/|]{2,10}(?:[ ]?[\w-+&#()/|]{1,5}){0,4}\S$/.test(v);
            },
            message: "Name invalid"
        }
    },
    published: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    adminId: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true
    },
    private: {
        type: Boolean,
        default: true
    }
})

// Change updated path after a change to the model
groupSchema.post("updateOne", { document: true, query: false }, () => this.updated = Date.now);
groupSchema.post("save", () => this.updated = Date.now);

// Create Model
const Group = mongoose.model("Group", groupSchema);

module.exports = Group;