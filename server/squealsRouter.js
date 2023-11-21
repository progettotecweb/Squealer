const express = require("express");
const router = express.Router();

const usersDB = require("../db/users");
const channelsDB = require("../db/channels");
const squealsDB = require("../db/squeals");
const keywordsDB = require("../db/keywords");
const { server_log } = require("../utils/utils");

router.get("/:id", async (req, res) => {
    const squeals = await squealsDB.getAllSquealsByOwnerID(req.params.id);
    res.json({ results: squeals.reverse() });
});

router.put("/:id", async (req, res) => {
    const squeal = await squealsDB.getSquealByID(req.params.id);
    if (!squeal) {
        res.status(404).json({ success: false, error: "Squeal not found" });
        return;
    }

    const updatedSqueal = {
        recipients: req.body.recipients,
        reactions: req.body.reactions,
    }

    console.log("updatedSqueal", updatedSqueal);

    await squealsDB.updateSquealByID(req.params.id, updatedSqueal);

    // Squeal distribution
    //first we have to remove the squeal from the old recipients
    squeal.recipients.forEach(async (recipient) => {
        if (recipient.type === "User") {
            const user = await usersDB.searchUserByID(recipient.id);
            const squealIndex = user.squeals.indexOf(req.params.id);
            user.squeals.splice(squealIndex, 1);
            user.save();
        } else if (recipient.type === "Channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);
            const squealIndex = channel.squeals.indexOf(req.params.id);
            channel.squeals.splice(squealIndex, 1);
            channel.save();
        }
    });

    //then we add the squeal to the new recipients
    const recipients = updatedSqueal.recipients;
    recipients.forEach(async (recipient) => {
        if (recipient.type === "User") {
            const user = await usersDB.searchUserByID(recipient.id);
            user.squeals.push(req.params.id);
            user.save();
        } else if (recipient.type === "Channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);
            channel.squeals.push(req.params.id);
            channel.save();
        }
    });



    res.status(200).json({ ok: true });
})

router.put("/reaction/:id", async (req, res) => {
    await squealsDB.updateSquealReactionByID(req.params.id, req.body.reaction, req.body.userid).then((data) => {
        res.status(200).json({ success: true, squeal: data });
    })
});

router.post("/post", async (req, res) => {
    let squeal = req.body;

    // #TODO: squeal validation
    console.log("squeal", squeal);

    // Squeal creation
    const newSqueal = await squealsDB.createNewSqueal(squeal);

    // Keywords
    //check if the squeal has text
    if (newSqueal.content.text) {
        const message = newSqueal.content.text;
        // keywords begin with #
        const regexp = /#\w+/g;
        const keywords = message.match(regexp);
        console.log(keywords);

        if (keywords) {
            keywords.forEach(async (keyword) => {
                const keywordName = keyword.slice(1);
                await keywordsDB.addSquealToKeyword(keywordName, newSqueal._id);
            });
        }
    }

    // Owner
    const owner = await usersDB.searchUserByID(squeal.ownerID);
    owner.squeals.push(newSqueal._id);
    owner.save();

    // Squeal distribution
    const recipients = squeal.recipients;
    recipients.forEach(async (recipient) => {
        if (recipient.type === "User") {
            const user = await usersDB.searchUserByID(recipient.id);
            user.squeals.push(newSqueal._id);
            user.save();
        } else if (recipient.type === "Channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);
            channel.squeals.push(newSqueal._id);
            channel.save();
        }
    });

    res.json({
        success: true,
        squeal: newSqueal
    });
});

router.get("/allSquealsByChannel/:id", async (req, res) => {
    const squeals = await squealsDB.getAllSquealsByRecipientID("channel", req.params.id);
    const results = squeals.map(async (squeal) => await squealsDB.transformSqueal(squeal))
    for (let i = 0; i < results.length; i++) {
        results[i] = await results[i]
    }
    res.status(200).json(results.reverse());
});


router.get("/search/:id", async (req, res) => {
    const squeal = await squealsDB.getSquealByID(req.params.id);
    res.status(200).json(squeal);
});

router.delete("/:id", async (req, res) => {
    const squeal = await squealsDB.getSquealByID(req.params.id);// squeal to be deleted
    const owner = await usersDB.searchUserByID(squeal.ownerID); // owner of the squeal
    const squealIndex = owner.squeals.indexOf(req.params.id);   // index of the squeal in the owner's squeals array
    owner.squeals.splice(squealIndex, 1);                     // remove the squeal from the owner's squeals array   
    owner.save();

    const recipients = squeal.recipients;                    // recipients of the squeal
    recipients.forEach(async (recipient) => {             // for each recipient of the squeal we remove the squeal from their squeals array
        if (recipient.type === "User") {
            const user = await usersDB.searchUserByID(recipient.id);
            const squealIndex = user.squeals.indexOf(req.params.id);
            user.squeals.splice(squealIndex, 1);
            user.save();
        } else if (recipient.type === "Channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);
            const squealIndex = channel.squeals.indexOf(req.params.id);
            channel.squeals.splice(squealIndex, 1);
            channel.save();
        }
    });

    await squealsDB.deleteSquealByID(req.params.id);     // delete the squeal from the squeals collection

    res.status(200).json({ success: true });
});

router.post("/all", async (req, res) => {
    const squeals = await squealsDB.getAllSqueals();
    res.status(200).json(squeals.reverse());
});

module.exports = router;
