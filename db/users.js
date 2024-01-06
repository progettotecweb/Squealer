/**
 *  Users database model
 */

const { CronJob } = require("cron");
const mongoose = require("mongoose");

const DAILY_MSG_QUOTA = 1000;
const WEEKLY_MSG_QUOTA = DAILY_MSG_QUOTA * 6;
const MONTHLY_MSG_QUOTA = DAILY_MSG_QUOTA * 24;

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
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
    img: {
        mimetype: String,
        blob: String,
    },
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channels",
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
});

const User = mongoose.model("User", userSchema);

exports.searchUserByID = async function (id) {
    const user = await User.findById(id).populate(
        "notifications.author",
        "name img"
    );
    return user;
};

exports.searchUserByIDAndPopulateSqueals = async function (id) {
        const user = await User.findById(id).populate({
            path: 'squeals',
            select: 'content reactions replies impressions controversial',
            
            
        });
        return user;
    
};

exports.searchUserByName = async function (name) {
    const user = await User.findOne({ name: name }).populate(
        "notifications.author",
        "name img"
    );
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
