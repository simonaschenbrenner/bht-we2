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
const attachmentSchema = new mongoose.Schema({
    mime: String,
    data: Buffer
})

const messageSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true
    },
    groupId: {
        type: mongoose.ObjectId,
        ref: "Group",
        required: true
    },
    threadId: {
        type: mongoose.ObjectId,
        ref: "Thread",
        required: true
    },
    published: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    content: String,
    attachment: attachmentSchema
})

// Change updated path after a change to the model
messageSchema.post("updateOne", { document: true, query: false }, () => this.updated = Date.now);
messageSchema.post("save", () => this.updated = Date.now);

// Create Model
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;