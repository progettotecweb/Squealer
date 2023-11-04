/* 
File: mongo.js 
Author: Fabio Vitali 
Version: 1.0  
Last change on: 10 April 2021 
 
 
Copyright (c) 2021 by Fabio Vitali 
 
   Permission to use, copy, modify, and/or distribute this software for any 
   purpose with or without fee is hereby granted, provided that the above 
   copyright notice and this permission notice appear in all copies. 
 
   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES 
   WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF 
   MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY 
   SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES 
   WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION 
   OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN 
   CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE. 
 
*/

const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const { server_log } = require("../utils/utils.js");

//read json file

function readJsonData(fileName) {
    return (jsonData = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, fileName))
    ));
}

exports.connectToDB = async function () {
    const uri =
        process.env.NODE_ENV === "production"
            ? `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_SITE}/db?writeConcern=majority`
            : `mongodb://127.0.0.1:27017/db?writeConcern=majority`;

    mongoose
        .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => server_log("Connected to MongoDB..."))
        .catch((err) => {
            server_log("Could not connect to MongoDB...", err);
            exit(1);
        });
};

exports.create = async function () {

    console.log("Connected to MongoDB");
    const db = mongoose.connection;
    const Post = mongoose.model("Post", postSchema);

    try {
        // Elimino le collezione esistenti
        await db.dropCollection("users");
        await db.dropCollection("posts");

        //leggo le collezioni
        let usersData = readJsonData("users.json");
        let postsData = readJsonData("posts.json");

        // Inserisco le collezioni lette
        await User.insertMany(usersData);
        await Post.insertMany(postsData);
        console.log("Database popolato con successo");
    } catch (err) {
        console.error("Errore durante la popolazione del database:", err);
    }
};
