const express = require("express");
const router = express.Router();

const default_img = require("../utils/default_image.json");
const bcrypt = require("bcrypt");
const usersDB = require("../db/users");
const channelsDB = require("../db/channels");

router.post("/register", async (req, res) => {
    const user = await usersDB.searchUserByName(req.body.username);

    if (user) {
        res.status(400).json({
            ok: false,
            error: "Username already in use",
        });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    //hash password with salt and bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const officialChannels = await channelsDB.getOfficialChannels();

    const newUser = {
        name: req.body.username,
        password: hashedPassword,
        salt: salt,
        img: req.body.img || default_img,
        bio: req.body.bio,
        following: officialChannels,
    };

    

    const u = await usersDB.createNewUser(newUser);

    officialChannels.forEach(async (channel) => {
        channel.followers.push(u._id);
        await channel.save();
    });

    res.status(200).json({
        ok: true,
    });
});

router.post("/login", async (req, res) => {
    const user = await usersDB.searchUserByName(req.body.username);

    if (!user) {
        res.status(400).json({
            ok: false,
            error: "Username not found",
        });
        return;
    }

    // bcrypt.compare(req.body.password, user.password, (err, result) => {
    //     if (err || !result) {
    //         res.status(400).json({
    //             ok: false,
    //             error: "Wrong password",
    //         });
    //         return;
    //     }
    // })

    const secondTry = bcrypt.compareSync(req.body.password, user.password);

    if (!secondTry) {
        res.status(400).json({
            ok: false,
            error: "Wrong password",
        });
        return;
    }

    // what im sending to the session
    const actualUser = {
        name: user.name,
        id: user._id,
        role: user.role,
    };
    res.status(200).json(actualUser);
});

//get user from id
router.get("/:id", async (req, res) => {
    const user = await usersDB.searchUserByID(req.params.id);

    if (!user) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    res.status(200).json(user);
});

//get user from name
router.get("/name/:name", async (req, res) => {
    const user = await usersDB.searchUserByName(req.params.name);

    if (!user) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    res.status(200).json(user);
});

//get all users
router.post("/all", async (req, res) => {
    const users = await usersDB.getAllUsers();

    res.status(200).json(users);
});

//update user
router.put("/:id", async (req, res) => {
    const user = await usersDB.searchUserByID(req.params.id);
    if (!user) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    const updatedUser = {
        name: req.body.name,
        password: req.body.password,
        salt: req.body.salt,
        img: req.body.img,
        blocked: req.body.blocked,
        role: req.body.role,
        msg_quota: req.body.msg_quota,
        popularity: req.body.popularity,
        following: req.body.following,
        squeals: req.body.squeals,
    };

    await usersDB.updateUser(req.params.id, updatedUser);

    res.status(200).json({
        ok: true,
    });
});

router.put("/:id/edit", async (req, res) => {
    const user = await usersDB.searchUserByID(req.params.id);
    if (!user) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    const updatedUser = {
        img: req.body.img,
        bio: req.body.bio,
    };

    console.log(req.body);

    if (req.body.newPassword) {
        const matches = bcrypt.compareSync(req.body.oldPassword, user.password);
        if (!matches) {
            res.status(400).json({
                ok: false,
                error: "Wrong password",
            });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        //hash password with salt and bcrypt
        const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
        updatedUser.password = hashedPassword;
        updatedUser.salt = salt;
    }

    console.log(updatedUser);

    await usersDB.updateUser(req.params.id, updatedUser);

    res.status(200).json({
        ok: true,
    });
});

// feed
router.get("/:id/feed", async (req, res) => {
    const user = await usersDB.searchUserByID(req.params.id);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;

    if (!user) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    const feed = await usersDB.getFeed(user, page, limit);
    res.status(200).json(feed);
});

router.delete("/:id", async (req, res) => {
    const user = await usersDB.searchUserByID(req.params.id);
    if (!user) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    await usersDB.deleteUser(req.params.id);

    res.status(200).json({
        ok: true,
    });
})

module.exports = router;
