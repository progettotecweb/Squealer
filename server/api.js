const express = require("express");
const router = express.Router();

const usersDB = require("../db/users");
const channelsDB = require("../db/channels");
const squealsDB = require("../db/squeals");
const keywordsDB = require("../db/keywords");
const { personalRoute, auth } = require("../utils/utils");

const mediaDB = require("../db/media");

router.use("/squeals", require("./squealsRouter"));

router.get("/search", async (req, res) => {
    const query = req.query.q;

    const type = query[0];

    switch (type) {
        case "@": {
            const users = await usersDB.searchUser("name", query.slice(1));
            res.json({
                results: users.map((user) => {
                    return { name: user.name, id: user._id };
                }),
            });
            break;
        }
        case "§": {
            const channels = await channelsDB.searchChannel(
                "name",
                query.slice(1)
            );
            res.json({
                results: channels.map((channel) => {
                    return { name: channel.name, id: channel._id };
                }),
            });
            break;
        }
        case "#": {
            const keywords = await keywordsDB.searchKeyword(
                "name",
                query.slice(1)
            );
            res.json({
                results: keywords.map((keyword) => {
                    return { name: keyword.name, id: keyword._id };
                }),
            });
            break;
        }
        default: {
            res.json({ results: [] });
            break;
        }
    }
});

router.get("/globalFeed", async (req, res) => {
    const feed = await squealsDB.getGlobalFeed();
    res.json(feed);
});

//this should be a personal route
router.post("/shop/:id", auth, async (req, res) => {
    const type = req.params.id;

    const user = await usersDB.searchUserByID(req.body.user, "name msg_quota role");

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
            //check if user role is user
            if (user.role !== "User") {
                break;
            } else {
                user.role = "Pro";
                break;
            }
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

    res.json({ success: true });
});

router.get("/media/:id", async (req, res) => {
    const media = await mediaDB.getMediaByID(req.params.id);

    if (!media) {
        res.status(404).json({ error: "Media not found" });
        return;
    }

    var img = Buffer.from(media.data, "base64");

    res.writeHead(200, {
        "Content-Type": media.mimetype,
        "Content-Length": img.length,
        "Cache-Control": "must-revalidate",
    });

    res.end(img);
});

router.head("/media/:id", async (req, res) => {
    const media = await mediaDB.getMediaByID(req.params.id);

    if (!media) {
        res.status(404).json({ error: "Media not found" });
        return;
    }

    res.writeHead(200, {
        "Content-Type": media.mimetype,
    });

    res.end();
})

module.exports = router;
