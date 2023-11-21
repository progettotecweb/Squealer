const mongoose = require("mongoose");
const usersDB = require("./users");

const squealSchema = new mongoose.Schema({
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    recipients: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'recipients.type'
            },
            type: {
                type: String,
                enum: ['User', 'Channel']
            }
        },
    ],
    type: {
        type: String,
        enum: ["text", "image", "geolocation"],
        default: "text",
    },
    content: {
        text: {
            type: String,
            default: null
        },
        img: {
            mimetype: {
                type: String,
                default: null
            },
            blob: {
                type: String,
                default: null
            },
        },
        geolocation: {
            type: String,
            default: null
        }
    },
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
        m2: { type: Number, default: 0 },
        m1: { type: Number, default: 0 },
        p1: { type: Number, default: 0 },
        p2: { type: Number, default: 0 },
        usersReactions: {
            type: [
                {
                    userID: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    reaction: {
                        type: String,
                        enum: ["m2", "m1", "p1", "p2"],
                    },
                },
            ],
            default: [],
        }
    },
    cm: {
        Rp: { type: Number, default: 0 },
        Rm: { type: Number, default: 0 },
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
    const res = await Squeal.find({ ownerID: ownerID }).populate("ownerID", "name img");
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

exports.getSquealByID = async function (id) {
    const res = await Squeal.findById(id).populate("ownerID", "name img");
    return res;
};

exports.deleteSquealByID = async function (id) {
    const res = await Squeal.findByIdAndDelete(id);
    return res;
};

exports.updateSquealReactionByID = async function (id, reaction, userid) {
    const res = await Squeal.findById(id);

    if (res.reactions.usersReactions.some((userReaction) => userReaction.userID.toString() === userid)) {

        //find old reaction
        const old = res.reactions.usersReactions.find((userReaction) => userReaction.userID.toString() === userid).reaction;


        if (old === reaction) {
            res.reactions[reaction] -= 1;
            res.reactions.usersReactions = res.reactions.usersReactions.filter((userReaction) => userReaction.userID.toString() !== userid);
            res.save();
            return res;
        } else {
            res.reactions[old] -= 1;
            res.reactions[reaction] += 1;
            res.reactions.usersReactions.find((userReaction) => userReaction.userID.toString() === userid).reaction = reaction;
            res.save();
            return res;
        }
    } else {
        res.reactions.usersReactions.push({ userID: userid, reaction: reaction });
        res.reactions[reaction] += 1;
    }

    res.save();

    return res;
}

exports.getAllSqueals = async function () {
    const res = await Squeal.find({}).populate("ownerID", "name img").populate("recipients.id");
    return res;
};

exports.updateSquealByID = async function (id, newSqueal) {
    console.log("newSqueal", newSqueal);
    Squeal.findByIdAndUpdate(id, newSqueal, { new: true }).then((squeal) => {
        return squeal;
    })
        .catch((err) => {
            console.log(err);
        });
};