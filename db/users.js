/**
 *  Users database model
 */

const { CronJob } = require("cron");
const mongoose = require("mongoose");
const { Channel } = require("./channels");
const squealsDB = require("./squeals");

const DAILY_MSG_QUOTA = 1000;
const WEEKLY_MSG_QUOTA = DAILY_MSG_QUOTA * 6;
const MONTHLY_MSG_QUOTA = DAILY_MSG_QUOTA * 24;

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    bio: { type: String, default: "" },
    password: String,
    salt: String,
    role: {
        type: String,
        enum: ["User", "Pro", "SMM", "Mod"],
        default: "User",
    },
    msg_quota: {
        daily: { type: Number, default: DAILY_MSG_QUOTA },
        weekly: { type: Number, default: WEEKLY_MSG_QUOTA },
        monthly: { type: Number, default: MONTHLY_MSG_QUOTA },
        extra: { type: Number, default: 0 },
        debt: {
            daily: { type: Number, default: 0 },
            weekly: { type: Number, default: 0 },
            monthly: { type: Number, default: 0 },
        },
    },
    popularity: { type: Number, default: 0 },
    blocked: { type: Boolean, default: false },
    controls: {
        user_id: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    controlled_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    img: String,
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channels",
        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    squeals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Squeal",
        },
    ],
    notifications: [
        {
            notificationType: {
                type: String,
                enum: ["mention", "reply", "new", "general"],
            },
            text: String,
            link: String,
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            createdAt: Date,
        },
    ],
    metadata: {
        popularCount: { type: Number, default: 0 },
        impopularCount: { type: Number, default: 0 },
        controversialCount: { type: Number, default: 0 },
    }
});

const User = mongoose.model("User", userSchema);

exports.searchUserByID = async function (id, select = "") {
    const user = await User.findById(id, select)
        .populate("notifications.author", "name img")
        .populate("controlled_by", "name img _id");
    return user;
};

exports.searchUserByName = async function (name) {
    const user = await User.findOne({ name: name }).populate(
        "notifications.author",
        "name img"
    );
    return user;
};

exports.getSMMSByName = async function (name) {
    const users = await User.find(
        {
            name: new RegExp(name, "i"),
            role: "SMM",
        },
        "name img _id"
    );
    return users;
};

exports.setSMM = async function (user_id, smm_id) {
    //add user_id to smm_id controls->user_id array
    const smm = await User.findByIdAndUpdate(smm_id, {
        $push: { "controls.user_id": user_id },
    });
    //add smm_id to user.controlled_by
    const user = await User.findByIdAndUpdate(user_id, {
        controlled_by: smm_id,
    });

    return user;
};

exports.removeSMM = async function (user_id, smm_id) {
    //remove user_id from smm_id controls->user_id array
    const smm = await User.findByIdAndUpdate(smm_id, {
        $pull: { "controls.user_id": user_id },
    });
    //remove smm_id from user.controlled_by
    const user = await User.findByIdAndUpdate(user_id, {
        controlled_by: null,
    });

    return user;
};

exports.searchUser = async function (property, query) {
    const user = await User.where(property)
        .equals(new RegExp(query, "i"))
        .populate("notifications.author", "name img")
        .exec();
    return user;
};

exports.createNewUser = async function (user) {
    const newUser = new User(user);
    newUser.save();
    return newUser;
};

exports.getAllUsers = async function () {
    const users = await User.find();
    return users;
};

//update user
exports.updateUser = async function (id, updatedUserData) {
    User.findByIdAndUpdate(id, updatedUserData, { new: true })
        .then((user) => {
            return user;
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.initUserJobs = function () {
    const dailyJob = CronJob.from({
        cronTime: "0 0 0 * * *",
        onTick: this.resetMsgQuotaDaily,
        start: true,
        timeZone: "Europe/Bucharest",
    });
    
    const weeklyJob = CronJob.from({
        cronTime: "0 0 0 * * 1",
        onTick: this.resetMsgQuotaWeekly,
        start: true,
        timeZone: "Europe/Bucharest",
    });
    
    const monthlyJob = CronJob.from({
        cronTime: "0 0 0 1 * *",
        onTick: this.resetMsgQuotaMonthly,
        start: true,
        timeZone: "Europe/Bucharest",
    });

    return [dailyJob, weeklyJob, monthlyJob];
}

exports.resetMsgQuotaDaily = async function () {
    const users = await User.find();
    users.forEach((user) => {
        user.msg_quota.daily = DAILY_MSG_QUOTA + user.msg_quota.extra;
        user.save();
    });
};

exports.resetMsgQuotaWeekly = async function () {
    const users = await User.find();
    users.forEach((user) => {
        user.msg_quota.weekly = WEEKLY_MSG_QUOTA + user.msg_quota.extra * 6;
        user.save();
    });
};

exports.resetMsgQuotaMonthly = async function () {
    const users = await User.find();
    users.forEach((user) => {
        user.msg_quota.monthly = MONTHLY_MSG_QUOTA + user.msg_quota.extra * 24;
        user.save();
    });
};

// feed is comprised of personal messages (squeals that have only the user as a recipient) and squeals of followed channels
exports.getFeed = async function (user, page = 0, limit = 10) {
    const skip = page * limit;
    // get all squeals that have only the user as a recipient

    // get all squeals of followed channels (the output should be a single array of squeals)
    try {
        const followedChannelsSqueals = await Channel.aggregate([
            {
                $match: {
                    _id: {
                        $in: user.following,
                    },
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
                $unionWith: {
                    coll: "squeals",
                    pipeline: [
                        {
                            $match: {
                                recipients: {
                                    $elemMatch: {
                                        type: "User",
                                        id: new mongoose.Types.ObjectId(
                                            user._id
                                        ),
                                    },
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                squeals: {
                                    $push: "$$ROOT",
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                squeals: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$squeals",
            },
            {
                // remove duplicates
                $group: {
                    _id: "$squeals._id",
                    squeals: {
                        $first: "$squeals",
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    // Assuming the users collection contains the user data
                    as: "squeals.ownerID",
                    let: { temp: "$squeals.ownerID" },

                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$temp"],
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
                    let: { temp: "$squeals.replies" },
                    as: "squeals.replies",
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
                    from: "keywords",
                    let: { temp: "$squeals.recipients.id" },
                    as: "squeals.recipientsFromCollection1",
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
                                id: "$_id",
                                _id: 0,
                                type: "Keyword",
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    let: { temp: "$squeals.recipients.id" },
                    as: "squeals.recipientsFromCollection2",
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
                                id: "$_id",
                                _id: 0,
                                type: "User",
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "channels",
                    let: { temp: "$squeals.recipients.id" },
                    as: "squeals.recipientsFromCollection3",
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
                                id: "$_id",
                                _id: 0,
                                type: "Channel",
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    "squeals.recipients": {
                        $setUnion: [
                            "$squeals.recipientsFromCollection1",
                            "$squeals.recipientsFromCollection2",
                            "$squeals.recipientsFromCollection3",
                        ],
                    },
                },
            },
            {
                $project: {
                    "squeals.recipientsFromCollection1": 0,
                    "squeals.recipientsFromCollection2": 0,
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
                                $not: {
                                    $and: [
                                        { $eq: ["$$squeal.isAReply", true] },
                                        {
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
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        ]);

        const feed = followedChannelsSqueals[0]?.squeals || [];

        return feed;
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e.message });
    }
};

exports.deleteUser = async function (id) {
    await User.findByIdAndDelete(id);
};
