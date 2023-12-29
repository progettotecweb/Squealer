/**
 * Channels database model
 */

const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const channelSchema = new mongoose.Schema({
    name: String,
    description: String,
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    administrators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    visibility: { type: String, default: "public" },
    can_user_post: { type: Boolean, default: false },
    squeals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Squeal",
        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    official: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false }
});

const Channel = mongoose.model("Channel", channelSchema);
exports.Channel = Channel;

function readJsonData(fileName) {
    return (jsonData = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, fileName))
    ));
}

exports.loadChannels = async function () {
    const channels = readJsonData("channels.json");
    await Channel.insertMany(channels);
    return channels;
}

exports.searchChannelByID = async function (id) {
    const channel = await Channel.findById(id);
    return channel;
}

exports.searchChannelByName = async function (name) {
    const channel = await Channel.findOne({ name: name });
    return channel;
}

exports.searchChannel = async function (property, query) {
    const channel = await Channel.where(property).equals(new RegExp(query, "i")).exec();
    return channel;
}

exports.createNewChannel = async function (channel) {
    const newChannel = new Channel(channel);
    await newChannel.save();
    return newChannel;
}

exports.updateChannel = async function (id, channel) {
    Channel.findByIdAndUpdate(id, channel, { new: true }).then((channel) => {
        return channel;
    })
        .catch((err) => {
            console.log(err);
        });
}

exports.getAllChannels = async function () {
    const channels = await Channel.find({}).populate("owner_id", "name");
    return channels;
}