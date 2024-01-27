const express = require("express");
const router = express.Router();

const mediaDB = require("../db/media");

const default_img = require("../utils/default_image.json");
const bcrypt = require("bcrypt");
const usersDB = require("../db/users");
const channelsDB = require("../db/channels");
const subscriptionsDB = require("../db/subscriptions");
const webpush = require("web-push");
const { default: mongoose } = require("mongoose");

//get SMM user by name
router.get("/smm", async (req, res) => {
    const query = req.query.q;

    const users = await usersDB.getSMMSByName(query);

    if (!users) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    res.status(200).json(users);
});

//add SMM to user
router.post("/setSmm", async (req, res) => {
    //get the user id that requested to be controlled by SMM and the SMM id
    const user_id = req.body.user_id;
    const smm_id = req.body.smm_id;

    //check if user is already controlled by a SMM
    const user = await usersDB.searchUserByID(user_id);
    if (user.controlled_by) {
        res.status(400).json({
            ok: false,
            error: "You already have a SMM! Please remove it first.",
        });
        return;
    }

    //link the user to the SMM
    const updatedUser = await usersDB.setSMM(user_id, smm_id);

    if (!updatedUser) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    return res.status(200).json(updatedUser);
});

//remove SMM from user
router.post("/removeSmm", async (req, res) => {
    //get the user id that requested to be controlled by SMM and the SMM id
    const user_id = req.body.user_id;
    const smm_id = req.body.smm_id;

    //check if user is not controlled by the SMM
    const user = await usersDB.searchUserByID(user_id);
    if (user.controlled_by?._id?.toString() != smm_id) {
        res.status(400).json({
            ok: false,
            error: "User is not controlled by the SMM",
        });
        return;
    }

    //link the user to the SMM
    const updatedUser = await usersDB.removeSMM(user_id, smm_id);

    if (!updatedUser) {
        res.status(404).json({
            ok: false,
            error: "User not found",
        });
        return;
    }

    return res.status(200).json(updatedUser);
});

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

    const propic = req.body.img
        ? await mediaDB.addNewMedia(req.body.img.mimetype, req.body.img.blob)
        : await mediaDB.getDefaultProfilePicture();

    const newUser = {
        name: req.body.username,
        password: hashedPassword,
        salt: salt,
        img: propic,
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

    if(req.body.img) {
        const propic = await mediaDB.addNewMedia(req.body.img.mimetype, req.body.img.blob);
        req.body.img = propic;
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
});

const resetDB = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    code: {
        type: Number,
        required: true,
    },
    createdAt: { type: Date, expires: 120, default: Date.now },
});

const Reset = mongoose.model("Reset", resetDB);

router.post("/password-reset/verify", async (req, res) => {
    const { code, username } = req.body;

    // find if user is in the list
    const found = await Reset.findOne({ username: username, code: code });

    console.log(found);

    if (!found) {
        res.status(400).json({
            ok: false,
            message: "Wrong code!",
        });
        return;
    }

    await Reset.deleteMany({ username: username });

    res.status(200).json({
        ok: true,
    });
});

router.post("/password-reset", async (req, res) => {
    const { username } = req.body;

    const user = await usersDB.searchUserByName(username);

    if (!user) {
        res.status(400).json({
            ok: false,
            status: "not sent",
            error: "Username not found",
        });
        return;
    }

    const randomSixDigit = Math.floor(100000 + Math.random() * 900000);

    // get all subscriptions

    const subs = await subscriptionsDB.getSubscriptionByUser(user._id);

    let count = 0;
    let promises = [];

    subs.forEach((s) => {
        const payload = JSON.stringify({
            title: `Password reset`,
            body: `YOUR CODE IS ${randomSixDigit}`,
        });

        // Create a promise for each notification
        const notificationPromise = new Promise((resolve, reject) => {
            webpush
                .sendNotification(s.subscription, payload)
                .then((res) => {
                    console.log(res.statusCode);
                    if (res.statusCode === 410) {
                        console.log(
                            "Subscription has expired or is no longer valid: ",
                            res.statusCode
                        );
                        // GONE (subscription no longer valid)
                        subscriptionsDB.removeSubscription(s._id);
                        reject(new Error("Subscription no longer valid"));
                    } else if (res.statusCode === 201) {
                        console.log("Sent to " + s._id);
                        count++;
                        resolve();
                    }
                })
                .catch((error) => {
                    console.error("Error sending notification:", error);
                    reject(error);
                });
        });

        promises.push(notificationPromise);
    });

    Promise.all(promises)
        .then(() => {
            console.log("Sent to " + count + " devices");

            if (count <= 0) {
                res.status(400).json({
                    ok: false,
                    status: "not sent",
                    message: "No devices found!",
                });
            }

            const newReset = new Reset({
                username: username,
                code: randomSixDigit,
            });

            newReset.save();

            res.status(200).json({
                ok: true,
                status: "sent",
                message:
                    "Code sent" + (count !== 1 ? ` to ${count} devices!` : "!"),
            });
        })
        .catch((error) => {
            console.error("Error sending notifications:", error);

            res.status(500).json({
                ok: false,
                status: "not sent",
                message: "Error sending notifications",
            });
        });
});

router.post("/password-reset/reset", async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        res.status(400).json({
            ok: false,
            message: "Passwords don't match!",
        });
        return;
    }

    const user = await usersDB.searchUserByName(username);

    if (!user) {
        res.status(400).json({
            ok: false,
            message: "Username not found!",
        });
        return;
    }

    const salt = await bcrypt.genSalt(10);

    //hash password with salt and bcrypt

    const hashedPassword = await bcrypt.hash(password, salt);

    await usersDB.updateUser(user._id, {
        password: hashedPassword,
        salt: salt,
    });

    res.status(200).json({
        ok: true,
    });
});

module.exports = router;
