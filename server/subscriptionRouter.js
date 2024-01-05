const express = require("express");
const router = express.Router();

const usersDB = require("../db/users");
const subscriptionsDB = require("../db/subscriptions");

router.post("", async function (req, res) {
    const subscription = req.body;

    const user = await usersDB.searchUserByName(subscription.user);

    if (!subscription) {
        console.error("No subscription");
        res.status(400).json({ message: "No subscription" });
        return;
    }

    try {
        const updatedDB = await subscriptionsDB.saveSubscriptionToDb(
            subscription.subscription,
            user._id
        );
        res.json({ message: "success", updatedDB });
    } catch (e) {
        console.log(e);
        res.json({ message: "success" });
    }
});

module.exports = router;
