const express = require("express");
const router = express.Router();

const default_img = require("../utils/default_image.json")
const bcrypt = require("bcrypt");
const usersDB = require("../db/users");

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

    const newUser = {
        name: req.body.username,
        password: hashedPassword,
        salt: salt,
        img: default_img,
    };

    console.log(newUser);

    await usersDB.createNewUser(newUser);

    res.status(200).json({
        ok: true,
    });
});

router.post("/login", async (req, res) => {
    const user = await usersDB.searchUserByName(req.body.username);

    if (!user) {
        res.status(401).json({
            ok: false,
            error: "Username not found",
        });
        return;
    }

    if (!bcrypt.compare(req.body.password, user.password)) {
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

//get all users
router.post("/all", async (req, res) => {
    const users = await usersDB.getAllUsers();

    if (!users) {
        res.status(404).json({
            ok: false,
            error: "Users not found",
        });
        return;
    }

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
        squeals: req.body.squeals
    };

    await usersDB.updateUser(req.params.id, updatedUser);

    res.status(200).json({
        ok: true,
    });
});

module.exports = router;
