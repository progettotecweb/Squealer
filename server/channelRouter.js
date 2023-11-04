const express = require("express");
const router = express.Router();

const channelsDB = require("../db/channels");
const usersDB = require("../db/users");
const squealsDB = require("../db/squeals");

router.get("/", async (req, res) => {
    const channels = await channelsDB.searchChannel("visibility", "public");
    res.json({ results: channels });
});

router.post("/follow", async (req, res) => {
    const channelID = req.body.channelID;
    const userID = req.body.userID;

    try {
        const channel = await channelsDB.searchChannelByID(channelID);
        if (!channel.followers.includes(userID)) {
            channel.followers.push(userID);
            await channel.save();

            const user = await usersDB.searchUserByID(userID);
            if (!user.following.includes(channelID)) {
                user.following.push(channelID);
                await user.save();
            }

            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

router.get("/:name", async (req, res) => {
    let channel = await channelsDB.searchChannelByName(req.params.name);

    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const squeals = await squealsDB.getAllSquealsByRecipientID("channel", channel._id);
    const results = squeals.map( async (squeal) => await squealsDB.transformSqueal(squeal))
    for (let i = 0; i < results.length; i++) {
        results[i] = await results[i]
    }

    channel = {
        ...channel._doc,
        squeals: results.reverse()
    }
    
    res.status(200).json(channel);
});

module.exports = router;
