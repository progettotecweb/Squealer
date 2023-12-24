const mongoose = require("mongoose");
const usersDB = require("./users");
const { Channel } = require("./channels");
const { CronJob } = require("cron");

const squealSchema = new mongoose.Schema({
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    recipients: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "recipients.type",
            },
            type: {
                type: String,
                enum: ["User", "Channel"],
            },
        },
    ],
    type: {
        type: String,
        enum: ["text", "image", "video", "geolocation"],
        default: "text",
    },
    content: {
        text: {
            type: String,
            default: null,
        },
        img: {
            mimetype: {
                type: String,
                default: null,
            },
            blob: {
                type: String,
                default: null,
            },
        },
        video: {
            mimetype: {
                type: String,
                default: null,
            },
            blob: {
                type: String,
                default: null,
            },
        },
        geolocation: {
            latitude: {
                type: Number,
                default: null,
            },
            longitude: {
                type: Number,
                default: null,
            },
        },
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
        },
    },
    cm: {
        Rp: { type: Number, default: 0 },
        Rm: { type: Number, default: 0 },
        label: {
            type: {
                type: String,
                enum: ["popular", "impopular", "controversial", "neutral"],
                default: "neutral",
            },
            //description: { type: String, default: ""},
        },
    },
    impressions: { type: Number, default: 0 },
    datetime: { type: Date, default: Date.now },
    controversial: { type: Boolean, default: false },
    automatic: { type: Boolean, default: false },
    cronJobExpr: { type: String, default: null },
    repetitionCount: { type: Number, default: 0 },
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Squeal",
        },
    ],
    isAReply: { type: Boolean, default: false },
    replyingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Squeal",
    },
    analysis: {
        labels: [
            {
                type: "String",
                enum: [
                    "toxic",
                    "severe_toxic",
                    "obscene",
                    "threat",
                    "insult",
                    "identity_hate",
                    "neutral",
                ],
            },
        ],
        toBeRewieved: { type: Boolean, default: false },
    },
});

const Squeal = mongoose.model("Squeal", squealSchema);

exports.createNewSqueal = async function (squeal) {
    const newSqueal = new Squeal(squeal);
    await newSqueal.save();
    return newSqueal;
};

exports.getAllSquealsByOwnerID = async function (ownerID) {
    let res = await Squeal.find({ ownerID: ownerID })
        .populate("ownerID", "name img")
        .populate({
            path: "replies",
            populate: { path: "ownerID", select: "name img" },
            select: " type ownerID content datetime _id reactions isAReply impressions",
        })
        .exec();

    //if a squeal is a reply of a squeal already in the array, remove it
    res.forEach((squeal) => {
        if (squeal.isAReply) {
            if (
                res.some(
                    (s) => s._id.toString() === squeal.replyingTo.toString()
                )
            ) {
                res = res.filter(
                    (s) => s._id.toString() !== squeal._id.toString()
                );
            }
        }
    })

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

    if (
        res.reactions.usersReactions.some(
            (userReaction) => userReaction.userID.toString() === userid
        )
    ) {
        //find old reaction
        const old = res.reactions.usersReactions.find(
            (userReaction) => userReaction.userID.toString() === userid
        ).reaction;

        if (old === reaction) {
            res.reactions[reaction] -= 1;
            res.reactions.usersReactions = res.reactions.usersReactions.filter(
                (userReaction) => userReaction.userID.toString() !== userid
            );
            res.save();
            return res;
        } else {
            res.reactions[old] -= 1;
            res.reactions[reaction] += 1;
            res.reactions.usersReactions.find(
                (userReaction) => userReaction.userID.toString() === userid
            ).reaction = reaction;
            res.save();
            return res;
        }
    } else {
        res.reactions.usersReactions.push({
            userID: userid,
            reaction: reaction,
        });
        res.reactions[reaction] += 1;
    }

    await updateSquealMetadata(res);

    await res.save();

    return res;
};

const updateSquealMetadata = async (squeal) => {
    squeal.cm.Rp = squeal.reactions.p1 + 2 * squeal.reactions.p2;
    squeal.cm.Rm = squeal.reactions.m1 + 2 * squeal.reactions.m2;

    if (squeal.cm.Rm > squeal.impressions * 0.25 && squeal.cm.Rp > squeal.impressions * 0.25) {
        squeal.cm.label = "controversial";
        const contr = Channel.findOne({ name: "Controversial" }, "_id");
        squeal.recipients.push({ id: contr._id, type: "Channel" });

        return;
    }

    if (squeal.cm.Rp > squeal.impressions * 0.25) {
        squeal.cm.label = "popular";
    }

    if (squeal.cm.Rm > squeal.impressions * 0.25) {
        squeal.cm.label = "impopular";
    }

    
}

exports.getAllSqueals = async function () {
    const res = await Squeal.find({})
        .populate("ownerID", "name img")
        .populate({ path: "recipients.id", model: Channel });
    return res;
};

exports.updateSquealByID = async function (id, newSqueal) {
    console.log("newSqueal", newSqueal);
    await Squeal.findByIdAndUpdate(id, newSqueal, { new: true })
        .then((squeal) => {
            return squeal;
        })
        .catch((err) => {
            console.log(err);
        });
};

const jobs = [];

exports.getAllScheduledActiveSquealsByID = async function (id) {
    const temp = jobs.filter((job) => job.ownerID.toString() === id);
    const squeals = temp.map((squeal) => squeal.id);
    const res = await Squeal.find({ _id: { $in: squeals } }).populate(
        "ownerID",
        "name img"
    );
    return res;
};

exports.stopSquealScheduling = async function (id) {
    //find job in array, stop it and remove it
    console.log("jobs before", jobs);
    const job = jobs.find((job) => job.id.toString() === id);
    if (job) {
        job.job.stop();
        jobs.splice(jobs.indexOf(job), 1);
    }
    console.log("jobs after", jobs);
};

exports.scheduleSqueal = async function (id, cronJobExpr, ownerID) {
    const job = CronJob.from({
        cronTime: cronJobExpr,
        onTick: async () => {
            const doc = await Squeal.findById(id);

            var newSqueal = doc;
            doc.repetitionCount += 1;
            await doc.save();

            newSqueal._id = undefined;
            newSqueal.datetime = Date.now();
            newSqueal.reactions = undefined;
            newSqueal.cm = undefined;
            newSqueal.impressions = undefined;
            newSqueal.controversial = undefined;
            newSqueal.automatic = false;
            newSqueal.cronJobExpr = null;

            newSqueal.isNew = true;
            newSqueal.content.text = newSqueal.content.text
                .replace("{COUNT}", doc.repetitionCount)
                .replace("{TIME}", new Date().toLocaleTimeString())
                .replace("{DATE}", new Date().toLocaleDateString());
            await newSqueal.save();
        },
        start: true,
    });

    jobs.push({ id, job, ownerID });
    console.log("jobs", jobs);
};

exports.updateSquealImpressions = async function (id) {
    const squeal = await Squeal.findById(id);
    squeal.impressions += 1;
    await updateSquealMetadata(squeal);
    await squeal.save();
}
