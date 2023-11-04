/**
 *  Users database model
 */

const mongoose = require("mongoose");

const DAILY_MSG_QUOTA = 1000;
const WEEKLY_MSG_QUOTA = DAILY_MSG_QUOTA * 6;
const MONTHLY_MSG_QUOTA = DAILY_MSG_QUOTA * 24;

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    salt: String,
    role: {
        type: String,
        enum: ["User", "Pro", "SMM", "Mod", "User"],
        default: "User",
    },
    msg_quota: {
        daily: { type: Number, default: DAILY_MSG_QUOTA },
        weekly: { type: Number, default: WEEKLY_MSG_QUOTA },
        monthly: { type: Number, default: MONTHLY_MSG_QUOTA },
        extra: { type: Number, default: 0 },
    },
    popularity: { type: Number, default: 0 },
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
});

const User = mongoose.model("User", userSchema);

exports.searchUserByID = async function (id) {
    const user = await User.findById(id);
    return user;
};

exports.searchUserByName = async function (name) {
    const user = await User.findOne({ name: name });
    return user;
};

exports.searchUser = async function (property, query) {
    const user = await User.where(property)
        .equals(new RegExp(query, "i"))
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