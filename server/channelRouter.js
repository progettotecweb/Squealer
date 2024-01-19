const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const channelsDB = require("../db/channels");
const usersDB = require("../db/users");
const squealsDB = require("../db/squeals");

const { getToken } = require("../SquealerApp/node_modules/next-auth/jwt");

router.get("/", async (req, res) => {
    const channels = await channelsDB.searchChannel("visibility", "public");
    res.json({ results: channels });
});

router.post("/allChannels", async (req, res) => {
    const channels = await channelsDB.getAllChannels();

    res.status(200).json(channels);
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

            res.status(200).json({ ok: true });
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }

    res.status(400).json({ error: "something went bad" });
});

router.post("/unfollow", async (req, res) => {
    const channelID = req.body.channelID;
    const userID = req.body.userID;

    console.log("channelID", channelID);
    console.log("userID", userID);

    try {
        const channel = await channelsDB.searchChannelByID(channelID);
        console.log("Followers", channel.followers);
        const isFollowing = channel.followers.includes(
            new mongoose.Types.ObjectId(userID)
        );
        console.log("isFollowing", isFollowing);
        if (channel.followers.includes(userID)) {
            channel.followers = channel.followers.filter((id) => id != userID);
            await channel.save();

            const user = await usersDB.searchUserByID(userID);
            if (user.following.includes(channelID)) {
                user.following = user.following.filter((id) => id != channelID);
                await user.save();
            }

            res.status(200).json({ ok: true });
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }

    res.status(400).json({ error: "something went bad" });
});

router.get("/id/:id", async (req, res) => {
    const channel = await channelsDB.searchChannelByID(req.params.id);

    if (!channel) {
        res.status(404).json({
            ok: false,
            error: "Channel not found",
        });
        return;
    }

    res.status(200).json(channel);
});

router.get("/:name", async (req, res) => {
    let channel = await channelsDB.searchChannelByName(req.params.name);

    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token && channel.visibility === "private") {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (token) {
        const user = await usersDB.searchUserByID(token.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (
            channel.visibility === "private" &&
            !channel.followers.includes(user._id) &&
            !channel.administrators.includes(user._id) &&
            user._id.toString() !== channel.owner_id.toString()
        ) {
            return res.status(401).json({ error: "Unauthorized" });
        }
    }

    const squeals = await squealsDB.getAllSquealsByRecipientID(
        "Channel",
        channel._id
    );

    channel = {
        ...channel._doc,
        squeals: squeals,
    };

    res.status(200).json(channel);
});

router.put("/id/:id", async (req, res) => {
    const channel = await channelsDB.searchChannelByID(req.params.id);
    if (!channel) {
        res.status(404).json({
            ok: false,
            error: "Channel not found",
        });
        return;
    } else {
        const updatedAdmins = req.body.administrators;

        console.log(updatedAdmins.length);

        const toBeRemoved = updatedAdmins
            .filter((adm) => adm.state === "removing")
            .map((adm) => adm?._id || adm?.id);

        console.log(toBeRemoved);

        const toBeAdded = updatedAdmins.filter((adm) => adm.state === "adding").map((adm) => adm?._id || adm?.id);

        console.log(toBeAdded);

        console.log(channel.administrators);

        const newAdmins = channel.administrators
            .filter((adm) => !toBeRemoved.includes(adm.toString()) && !toBeAdded.includes(adm.toString()))
            .map((adm) => adm?._id || adm?.id);

        const updatedChannel = {
            name: req.body.name,
            description: req.body.description,
            administrators: [
                ...new Set([
                    ...newAdmins,
                    ...toBeAdded
                ]),
            ],
            visibility: req.body.visibility,
            can_user_post: req.body.can_user_post,
            squeals: req.body.squeals,
            followers: req.body.followers,
            blocked: req.body.blocked,
            banner: req.body.img,
        };

        const newc = await channelsDB.updateChannel(
            req.params.id,
            updatedChannel
        );

        res.status(200).json({
            channel: newc,
            ok: true,
        });
    }
});

router.post("/createprivate", async (req, res) => {
    const { name, description, img, isPublic, user } = req.body;

    const channel = await channelsDB.searchChannelByName(name);
    if (channel) {
        res.status(404).json({
            ok: false,
            error: "Channel already exists",
        });
        return;
    }

    const newChannel = await channelsDB.createChannel({
        name: name.toLowerCase(),
        owner_id: user,
        description: description,
        visibility: isPublic ? "public" : "private",
        banner: img,
        followers: new Array(user),
        administrators: new Array(user),
    });

    res.status(200).json({
        ok: true,
        channel: newChannel,
    });
});

router.put("/createprivate", async (req, res) => {
    const { name, description, img, isPublic, user } = req.body;

    console.log(name);

    const channel = await channelsDB.updateChannelByName(name, {
        name: name.toLowerCase(),
        owner_id: user,
        description: description,
        visibility: isPublic ? "public" : "private",
        banner: img,
        followers: new Array(user),
        administrators: new Array(user),
    });

    console.log(channel);

    if (channel) {
        res.status(500).json({
            ok: false,
            error: "Channel could not be updated",
        });
        return;
    }

    res.status(200).json({
        ok: true,
        channel: channel,
    });
});

module.exports = router;
