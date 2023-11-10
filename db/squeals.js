const mongoose = require("mongoose");
const usersDB = require("./users");

const squealSchema = new mongoose.Schema({
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    recipients: [
        {
            type: {
                type: String,
                enum: ["user", "channel"],
            },
            id: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "type",
            },
        },
    ],
    content: String,
    keywords: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Keywords",
        },
    ],
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "private",
    },
    reactions: {
        "-2": { type: Number, default: 0 },
        "-1": { type: Number, default: 0 },
        "+1": { type: Number, default: 0 },
        "+2": { type: Number, default: 0 },
    },
    CM: {
        "R+": { type: Number, default: 0 },
        "R-": { type: Number, default: 0 },
        label: {
            type: {
                type: String,
                enum: ["popular", "impopular", "spam", "offensive", "neutral"],
                default: "neutral",
            },
            //description: { type: String, default: ""},
        },
    },
    impressions: { type: Number, default: 0 },
    datetime: { type: Date, default: Date.now },
    controversial: { type: Boolean, default: false },
    automatic: { type: Boolean, default: false },
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Squeal",
        },
    ],
    isAReply: { type: Boolean, default: false },
});

const Squeal = mongoose.model("Squeal", squealSchema);

exports.createNewSqueal = async function (squeal) {
    const newSqueal = new Squeal(squeal);
    newSqueal.save();
    return newSqueal;
};

exports.getAllSquealsByOwnerID = async function (ownerID) {
    const res = await Squeal.find({ ownerID: ownerID });
    return res;
};

exports.getAllSquealsByRecipientID = function (type, recipientID) {
    const res = Squeal.find({
        recipients: { $elemMatch: { type: type, id: recipientID } },
    });
    return res;
};

exports.transformSqueal = async (dbSqueal) => {
    const user = await usersDB.searchUserByID(dbSqueal.ownerID);

    const squeal = {
        ...dbSqueal._doc,
        userInfo: {
            name: user.name,
        },
    };
    return squeal;
};

