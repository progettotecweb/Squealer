const express = require('express');
const router = express.Router();

const channelsDB = require('../db/channels');

router.get('/', async (req, res) => {
    const channels = await channelsDB.searchChannel("visibility", "public");
    res.json({results: channels});
})

router.post("/follow", async (req, res) => {
    const channelID = req.body.channelID;
    const userID = req.body.userID;

    try {
    const channel = await channelsDB.searchChannelByID(channelID);
    channel.followers.push(userID);
    await channel.save();
    res.json({message: "Followed channel"});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
})

router.get('/:name', async (req, res) => {
    const channel = await channelsDB.searchChannelByName(req.params.name);
    
    if(!channel) return res.status(404).json({error: "Channel not found"});
    
    res.status(200).json(channel);
})

module.exports = router;