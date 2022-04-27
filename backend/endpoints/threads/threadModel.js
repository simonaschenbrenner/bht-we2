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
const threadSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.ObjectId,
        ref: "Group",
        required: true
    },
    name: {
        type: String,
        required: true,
        validate: {
            validator: (v) => {
                return /[\w-+&#()/|]{2,10}(?:[ ]?[\w-+&#()/|]{1,10}){0,9}\S$/.test(v);
            },
            message: "Name invalid"
        }
    },
    adminId: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true
    },
    published: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
})

// Change updated path after a change to the model
threadSchema.post("updateOne", { document: true, query: false }, () => this.updated = Date.now);
threadSchema.post("save", () => this.updated = Date.now);

// Create Model
const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;