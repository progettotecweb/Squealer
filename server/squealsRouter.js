const express = require("express");
const router = express.Router();

const usersDB = require("../db/users");
const channelsDB = require("../db/channels");
const squealsDB = require("../db/squeals");
const keywordsDB = require("../db/keywords");

router.get("/:id", async (req, res) => {
    const squeals = await squealsDB.getAllSquealsByOwnerID(req.params.id);
    
    const results = squeals.map( async (squeal) => await squealsDB.transformSqueal(squeal))
    for (let i = 0; i < results.length; i++) {
        results[i] = await results[i]
    }
    res.json({ results: results.reverse() });
});

router.post("/post", async (req, res) => {
    let squeal = req.body;

    // #TODO: squeal validation
    console.log("squeal", squeal);

    // Squeal creation
    const newSqueal = await squealsDB.createNewSqueal(squeal);

    const message = newSqueal.content;
    // keywords begin with #
    const regexp = /#\w+/g;
    const keywords = message.match(regexp);
    console.log(keywords);

    if(keywords) {
        keywords.forEach(async (keyword) => {
            const keywordName = keyword.slice(1);
            await keywordsDB.addSquealToKeyword(keywordName, newSqueal._id);
        });
    }

    const owner = await usersDB.searchUserByID(squeal.ownerID);
    owner.squeals.push(newSqueal._id);
    owner.save();

    // Squeal distribution
    const recipients = squeal.recipients;
    recipients.forEach(async (recipient) => {
        if (recipient.type === "user") {
            const user = await usersDB.searchUserByID(recipient.id);
            user.squeals.push(newSqueal._id);
            user.save();
        } else if (recipient.type === "channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);
            channel.squeals.push(newSqueal._id);
            channel.save();
        }
    });

    res.json({
        success: true,
    });
});

module.exports = router;
