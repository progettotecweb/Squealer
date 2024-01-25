const mongoose = require("mongoose");
const usersDB = require("./users");
const conditionsDB = require("./conditions");
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
                enum: ["User", "Channel", "Keyword"],
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
            type: String
        },
    ],
    mentions: [
        {
            type: String,
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
            type: String,
            enum: ["popular", "impopular", "controversial", "neutral"],
            default: "neutral",
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
    //await newSqueal.save();
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
    });

    return res;
};

exports.getAllSquealsByRecipientID = function (type, recipientID) {
    const res = Squeal.find({
        recipients: { $elemMatch: { type: type, id: recipientID } },
    })
        .populate("ownerID", "name img")
        .populate({
            path: "replies",
            populate: { path: "ownerID", select: "name img" },
            select: " type ownerID content datetime _id reactions isAReply impressions",
        })
        .exec();

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

const MIN_IMPRESSION_COUNT = 10;

const updateSquealMetadata = async (squeal) => {
    if (!squeal.cm) squeal.cm = {};

    conditionsDB.executeAll(squeal, ["reaction", "view"]);

    if (squeal.impressions < MIN_IMPRESSION_COUNT) return;

    squeal.cm.Rp = squeal.reactions.p1 + 2 * squeal.reactions.p2;
    squeal.cm.Rm = squeal.reactions.m1 + 2 * squeal.reactions.m2;

    if (
        squeal.cm.Rm > squeal.impressions * 0.25 &&
        squeal.cm.Rp > squeal.impressions * 0.25
    ) {
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

    await squeal.save();
};

exports.getAllSqueals = async function () {
    const res = await Squeal.find({})
        .populate("ownerID", "name img")
        .populate("recipients.id", "name");
    //.populate({ path: "recipients.id", model: Channel });
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
};

const populateSquealAggregation = [
    {
        $lookup: {
            from: "users",
            // Assuming the users collection contains the user data
            localField: "ownerID",
            foreignField: "_id",
            as: "ownerID",
            pipeline: [
                {
                    $project: {
                        name: 1,
                        img: 1,
                    },
                },
            ],
        },
    },
    {
        $unwind: "$ownerID",
    },
    {
        $lookup: {
            from: "squeals",
            // Assuming the replies collection contains the reply data
            let: { temp: "$replies" },
            as: "replies",
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $in: ["$_id", "$$temp"],
                        },
                    },
                },
                {
                    $project: {
                        type: 1,
                        content: 1,
                        ownerID: 1,
                        datetime: 1,
                        _id: 1,
                        reactions: 1,
                        isAReply: 1,
                        impressions: 1,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        let: { ownerID: "$ownerID" },
                        as: "ownerID",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$ownerID"],
                                    },
                                },
                            },
                            {
                                $project: {
                                    name: 1,
                                    img: 1,
                                },
                            },
                        ],
                    },
                },
                {
                    $unwind: "$ownerID",
                },
            ],
        },
    },
    {
        $lookup: {
            from: "channels",
            let: { temp: "$recipients.id" },
            as: "recipientsFromCollection3",
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $in: ["$_id", "$$temp"],
                        },
                    },
                },
                {
                    $project: {
                        name: 1,
                        id: 1,
                        type: "Channel",
                    },
                },
            ],
        },
    },
    {
        $lookup: {
            from: "keyowrds",
            let: { temp: "$recipients.id" },
            as: "recipientsFromCollection1",
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $in: ["$_id", "$$temp"],
                        },
                    },
                },
                {
                    $project: {
                        name: 1,
                        id: 1,
                        type: "Keyword",
                    },
                },
            ],
        },
    },
    {
        $lookup: {
            from: "users",
            let: { temp: "$recipients.id" },
            as: "recipientsFromCollection2",
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $in: ["$_id", "$$temp"],
                        },
                    },
                },
                {
                    $project: {
                        name: 1,
                        id: 1,
                        type: "User",
                    },
                },
            ],
        },
    },
    {
        $addFields: {
            recipients: {
                $setUnion: ["$recipientsFromCollection3", "$recipientsFromCollection1", "$recipientsFromCollection2",],
            },
        },
    },
    {
        $project: {
            recipientsFromCollection3: 0,
            recipientsFromCollection1: 0,
            recipientsFromCollection2: 0,
        },
    },
    {
        $sort: {
            datetime: -1,
        },
    },
];

exports.getAllSquealsByFilter = async function (query, page = 0, limit = 10) {
    const skip = page * limit;

    if (query.startsWith("#")) {
        const squeals = await Squeal.aggregate([
            {
                $match: {
                    //match only squeals that have part of that keyword
                    keywords: query,
                    visibility: "public",
                },
            },
            ...populateSquealAggregation,
        ]);

        return squeals;
    } else if (query.startsWith("@")) {
        const squeals = await Squeal.aggregate([
            {
                $match: {
                    //match only squeals that have part of that keyword
                    mentions: query,
                    visibility: "public",
                },
            },
            ...populateSquealAggregation,
        ]);

        return squeals;
    } else {
        return [];
    }
};

exports.getGlobalFeed = async function (page = 0, limit = 10) {
    const skip = page * limit;

    const publicSqueals = await Channel.aggregate([
        {
            $match: {
                official: true,
            },
        },
        {
            $project: {
                _id: 1,
                squeals: 1,
            },
        },
        {
            $unwind: "$squeals",
        },
        {
            $lookup: {
                from: "squeals",
                localField: "squeals",
                foreignField: "_id",
                as: "squeals",
            },
        },
        {
            $unwind: "$squeals",
        },
        {
            $lookup: {
                from: "users",
                // Assuming the users collection contains the user data
                localField: "squeals.ownerID",
                foreignField: "_id",
                as: "squeals.ownerID",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            img: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$squeals.ownerID",
        },
        {
            $addFields: {
                "squealDetails.ownerID": {
                    name: "$squealDetails.ownerID.name",
                    img: "$squealDetails.ownerID.img",
                },
            },
        },
        {
            $lookup: {
                from: "squeals",
                // Assuming the replies collection contains the reply data
                localField: "squeals.replies",
                foreignField: "_id",
                as: "squeals.replies",
                pipeline: [
                    {
                        $project: {
                            type: 1,
                            content: 1,
                            ownerID: 1,
                            createdAt: 1,
                            datetime: 1,
                            _id: 1,
                            reactions: 1,
                            isAReply: 1,
                            impressions: 1,
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "ownerID",
                            foreignField: "_id",
                            as: "ownerID",
                            pipeline: [
                                {
                                    $project: {
                                        name: 1,
                                        img: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: "$ownerID",
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "channels",
                localField: "squeals.recipients.id",
                foreignField: "_id",
                as: "squeals.recipientsFromCollection3",
                pipeline: [
                    {
                        $match: {
                            official: true,
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            id: "$id",
                            type: "Channel",
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                "squeals.recipients": {
                    $setUnion: ["$squeals.recipientsFromCollection3"],
                },
            },
        },
        {
            $project: {
                "squeals.recipientsFromCollection3": 0,
            },
        },
        {
            $sort: {
                "squeals.datetime": -1,
            },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        {
            $group: {
                _id: null,
                squeals: {
                    $push: "$squeals",
                },
            },
        },
        {
            $project: {
                _id: 0,
                squeals: 1,
            },
        },
        {
            $addFields: {
                squeals: {
                    $filter: {
                        input: "$squeals",
                        as: "squeal",
                        cond: {
                            $or: [
                                { $eq: ["$$squeal.isAReply", false] },
                                {
                                    $not: {
                                        $in: [
                                            "$$squeal.replyingTo",
                                            {
                                                $map: {
                                                    input: "$squeals",
                                                    as: "s",
                                                    in: "$$s._id",
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    ]);

    const feed = publicSqueals[0]?.squeals || [];

    return feed;
};
