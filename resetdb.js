const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

//USERS
const DAILY_MSG_QUOTA = 1000;
const WEEKLY_MSG_QUOTA = DAILY_MSG_QUOTA * 6;
const MONTHLY_MSG_QUOTA = DAILY_MSG_QUOTA * 24;

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
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
});

//CHANNELS
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

//SQUEALS
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
        enum: ["text", "image", "geo"],
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
            latitude: {
                type: Number,
                default: null
            },
            longitude: {
                type: Number,
                default: null
            },
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
const Channel = mongoose.model("Channel", channelSchema);
const User = mongoose.model("User", userSchema);
connectToDB();
create();

//read json file

function readJsonData(fileName) {
    //console.log("path:", path.resolve("../db/", fileName));
    return (jsonData = JSON.parse(
        fs.readFileSync(path.resolve("../Squealer/db/", fileName))
    ));
}

async function connectToDB() {
    const uri =
        process.env.NODE_ENV === "production"
            ? `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_SITE}/db?writeConcern=majority`
            : `mongodb://127.0.0.1:27017/db?writeConcern=majority`;

    mongoose
        .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("Connected to MongoDB..."))
        .catch((err) => {
            console.log("Could not connect to MongoDB...", err);
            exit(1);
        });
};

async function create() {
    console.log("Connected to MongoDB");
    const db = mongoose.connection;

    try {
        // Elimino le collezione esistenti
        await db.dropCollection("users");
        await db.dropCollection("channels");
        await db.dropCollection("squeals");
        await db.dropCollection("keywords");

        //leggo le collezioni
        let usersData = readJsonData("users.json");
        let channelsData = readJsonData("channels.json");
        // let squealsData = readJsonData("squeals.json");

        // Inserisco le collezioni lette
        await User.insertMany(usersData);
        await Channel.insertMany(channelsData);
        //await Squeal.insertMany(squealsData);

        console.log("Database popolato con successo");
    } catch (err) {
        console.error("Errore durante la popolazione del database:", err);
    }
};
