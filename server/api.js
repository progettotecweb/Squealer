const express = require("express");
const router = express.Router();

const usersDB = require("../db/users");
const channelsDB = require("../db/channels");
const squealsDB = require("../db/squeals");
const keywordsDB = require("../db/keywords");
const { personalRoute, auth } = require("../utils/utils");

router.use("/squeals", require("./squealsRouter"));

router.get("/search", async (req, res) => {
    const query = req.query.q

    const type = query[0]

    switch (type) {
        case "@": {
            const users = await usersDB.searchUser("name", query.slice(1))
            res.json({ results: users.map(user => { return { name: user.name, id: user._id } }) })
            break;
        }
        case "§": {
            const channels = await channelsDB.searchChannel("name", query.slice(1))
            res.json({ results: channels.map(channel => { return { name: channel.name, id: channel._id } }) })
            break;
        }
        case "#": {
            const keywords = await keywordsDB.searchKeyword("name", query.slice(1))
            res.json({ results: keywords.map(keyword => { return { name: keyword.name, id: keyword._id } }) })
            break;
        }
        default: {
            res.json({ results: [] })
            break;
        }
    }
})

router.get("/globalFeed", async (req, res) => {
    const feed = await squealsDB.getGlobalFeed()
    res.json(feed)
})

//this should be a personal route
router.post("/shop/:id",auth, async (req, res) => {
    const type = req.params.id

    const user = await usersDB.searchUserByID(req.body.user, "name msg_quota")

    // if(req.body.user !== req.user.id) {
    //     res.status(401).json({error: "Unauthorized"})
    //     return
    // }

    switch (type) {
        case "daily": {
            user.msg_quota.daily += 250;
            break;
        }
        case "weekly": {
            user.msg_quota.weekly += 1000;
            break;
        }
        case "monthly": {
            user.msg_quota.monthly += 5000;
            break;
        }
        case "vip": {
            user.role="Pro";
            break;
        }
        case "maxi": {
            user.msg_quota.monthly += 5000;
            user.msg_quota.weekly += 1000;
            user.msg_quota.daily += 250;
            break;
        }
        default: {
            break;
        }
        
    }

    await user.save();

    res.json({ success: true })

})

module.exports = router;