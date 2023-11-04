const express = require("express");
const router = express.Router();

const usersDB = require("../db/users");
const channelsDB = require("../db/channels");

router.use("/squeals", require("./squealsRouter"));

router.get("/search", async (req, res) => {
    const query = req.query.q

    const type = query[0]

    switch(type) {
        case "@": {
            const users = await usersDB.searchUser("name", query.slice(1))
            res.json({results: users.map(user => {return {name: user.name, id: user._id}})})
            break;
        }
        case "§": {
            const channels = await channelsDB.searchChannel("name", query.slice(1))
            res.json({results: channels.map(channel => {return {name: channel.name, id: channel._id}})})
            break;
        }
        default: {
            res.json({results: []})
            break;
        }
    }
})

module.exports = router;