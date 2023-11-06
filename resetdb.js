const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

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
    //const Post = mongoose.model("Post", postSchema);

    try {
        // Elimino le collezione esistenti
        await db.dropCollection("users");
        //await db.dropCollection("posts");

        //leggo le collezioni
        let usersData = readJsonData("users.json");
        //let postsData = readJsonData("posts.json");

        // Inserisco le collezioni lette
        await User.insertMany(usersData);
        // await Post.insertMany(postsData);
        console.log("Database popolato con successo");
    } catch (err) {
        console.error("Errore durante la popolazione del database:", err);
    }
};
