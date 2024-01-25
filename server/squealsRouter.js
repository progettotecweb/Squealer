const express = require("express");
const router = express.Router();

const usersDB = require("../db/users");
const channelsDB = require("../db/channels");
const squealsDB = require("../db/squeals");
const keywordsDB = require("../db/keywords");
const conditionsDB = require("../db/conditions");

const notifications = require("./notifications/notifications");


const { auth } = require("../utils/utils.js");

let PipelineSingleton;

(async () => {
    PipelineSingleton = await import("../AI/pipeline.mjs").then(
        (module) => module.default
    );
})();

router.get("/filter", async (req, res) => {

    const query = req.query.q || "";
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const squeals = await squealsDB.getAllSquealsByFilter(query, page, limit);

    return res.json(squeals)
})

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

    var oldRecipients = req.body.recipients;

    //Now we need to check if the recipients contain Keywords
    let keywordIds = [];
    for (const recipient of oldRecipients) {
        if (recipient.type === "Keyword") {
            const keyword = recipient.id;
            if (!keyword) {
                res.status(404).json({ success: false, error: "Keyword not found" });
                return;
            }

            id = await keywordsDB.addSquealToKeyword(keyword, squeal._id);
            keywordIds.push(id.toString());
        }
    }

    console.log("keywordIds", keywordIds);

    //remove all keywords type recipients from the oldRecipients array
    oldRecipients = oldRecipients.filter((recipient) => {
        return recipient.type !== "Keyword";
    });

    console.log("oldRecipients", oldRecipients);

    //now we create an updatedRecipients array that contains the oldRecipients and the new keyword recipients
    const updatedRecipients = oldRecipients;
    for (const id of keywordIds) {
        updatedRecipients.push({ id: id, type: "Keyword" });
    }

    const updatedSqueal = {
        recipients: updatedRecipients,
        reactions: req.body.reactions,
    };
    console.log("oldSqueal", req.body.recipients);
    console.log("updatedSqueal", updatedSqueal);

    await squealsDB.updateSquealByID(squeal._id, updatedSqueal);

    // Squeal distribution
    //first we have to remove the squeal from the old recipients
    for (const recipient of squeal.recipients) {
        if (recipient.type === "User") {
            const user = await usersDB.searchUserByID(recipient.id);
            if (!user) continue;
            const squealIndex = user.squeals.indexOf(squeal._id);
            user.squeals.splice(squealIndex, 1);
            user.save();
        } else if (recipient.type === "Channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);
            const squealIndex = channel.squeals.indexOf(squeal._id);
            channel.squeals.splice(squealIndex, 1);
            channel.save();
        }
    }

    //then we add the squeal to the new recipients
    const recipients = updatedSqueal.recipients;
    for (const recipient of recipients) {
        if (recipient.type === "User") {
            const user = await usersDB.searchUserByID(recipient.id);
            user.squeals.push(squeal._id);
            user.save();
        } else if (recipient.type === "Channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);
            channel.squeals.push(squeal._id);
            channel.save();
        }
    }

    res.status(200).json({ ok: true });
});

router.get("/info/:id", async (req, res) => {
    const squeals = await squealsDB.getSquealByID(req.params.id);

    if (!squeals) {
        res.status(404).json({
            ok: false,
            error: "Squeals not found",
        });
        return;
    }

    res.status(200).json(squeals);
});

router.put("/reaction/:id", async (req, res) => {
    await squealsDB
        .updateSquealReactionByID(
            req.params.id,
            req.body.reaction,
            req.body.userid
        )
        .then((data) => {
            res.status(200).json({ success: true, squeal: data });
        });
});

const validateChars = (len, owner) => {
    if (owner.msg_quota.daily < 0) {
        return false;
    }
    if (owner.msg_quota.weekly < 0) {
        return false;
    }
    if (owner.msg_quota.monthly < 0) {
        return false;
    }
    return true;
};

function truncate(str, n) {
    return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

// squeal posting route
router.post("/post", auth, async (req, res) => {
    let squeal = req.body;

    // #TODO: squeal validation
    console.log("squeal", squeal);

    const owner = await usersDB.searchUserByID(squeal.ownerID);
    if (!owner) {
        res.status(400).json({ success: false, error: "User not found" });
    }

    // Squeal creation
    const newSqueal = await squealsDB.createNewSqueal(squeal);

    if (newSqueal.isAReply) {
        const parentSqueal = await squealsDB.getSquealByID(
            newSqueal.replyingTo
        );
        parentSqueal.replies.push(newSqueal._id);
        parentSqueal.save();

        const parentOwner = await usersDB.searchUserByID(parentSqueal.ownerID);

        if (parentOwner._id.toString() !== owner._id.toString()) {
            parentOwner.notifications.push({
                notificationType: "reply",
                text: `@${owner.name} replied to your squeal.`,
                link: `/Home/Squeal/${newSqueal._id}`,
                author: owner._id,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
            });
            await parentOwner.save();

            const payload = JSON.stringify({
                title: `@${owner.name} replied to your squeal`,
                body: newSqueal.type === "text" ? `${truncate(newSqueal.content.text, 20)}` : "",
            });

            await notifications.sendNotification(parentOwner._id, payload);
        }
    }

    //console.log("newSqueal", newSqueal);

    const recipients = squeal.recipients;

    let privacy = 0;

    if (recipients.length === 1 && recipients[0].type === "User") privacy = 1;

    const toBeRemoved = [];

    for (let recipient of recipients) {
        if (recipient.type === "User") {
            const user = await usersDB.searchUserByID(recipient.id);
            if (!user) {
                privacy = 0;
                toBeRemoved.push(recipient);
            }
            recipient.name = user.name;
        } else if (recipient.type === "Channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);

            if (channel) {
                if (channel.visibility === "private") {
                    if (
                        channel.administrators.includes(owner._id) ||
                        channel?.owner_id?.toString() === owner?._id?.toString()
                    ) {
                        privacy ||= 1;
                    } else {
                        toBeRemoved.push(recipient);
                    }
                } else {
                    if (!channel.can_user_post) {
                        if (
                            channel.administrators.includes(owner._id) ||
                            channel?.owner_id?.toString() === owner?._id?.toString()
                        ) {
                        } else {
                            toBeRemoved.push(recipient);
                        }
                    }
                }
                recipient.name = channel.name;
            } else {
                toBeRemoved.push(recipient);
            }

        } else if (recipient.type === "Keyword") {
            const keyword = await keywordsDB.searchKeywordByID(recipient.id);
            if (!keyword) toBeRemoved.push(recipient);
            recipient.name = keyword.name;
        }
    }

    const newRecipients = recipients.filter((recipient) => {
        return !toBeRemoved.includes(recipient);
    });

    console.log("Computed privacy: " + (privacy ? "private" : "public"));

    let squealLen = 0;

    //check if the squeal has text
    if (newSqueal.type === "text" && newSqueal.content.text) {
        const message = newSqueal.content.text;

        const classifier = await PipelineSingleton.getInstance();
        const sentiment = await classifier(message, { topk: null });
        console.log("sentiment", sentiment);

        const labels = [];

        sentiment.forEach((obj) => {
            if (obj.score > 0.1) {
                labels.push(obj.label);
            }
        });

        if (labels.length > 0) {
            newSqueal.analysis.labels = [...labels];
            newSqueal.analysis.toBeRewieved = true;
        } else {
            newSqueal.analysis.labels.push("neutral");
            newSqueal.analysis.toBeRewieved = false;
        }

        // chars validation
        const len = message.length;
        console.log("len", len);

        if (!privacy && !validateChars(len, owner) && squeal.fromModerator !== true) {
            res.status(400).json({
                success: false,
                error: "You have exceeded your daily, weekly or monthly message quota",
            });
            return;
        }

        squealLen = len;

        // mentions
        // mentions begin with @
        const regexp_mention = /@[\w|.|-|_]+/g;
        const mentions = message.match(regexp_mention);
        console.log(mentions);

        if (mentions) {
            newSqueal.mentions = [...mentions];
            mentions.forEach(async (mention) => {
                const mentionUser = await usersDB.searchUserByName(
                    mention.slice(1)
                );

                if (mentionUser) {
                    const payload = JSON.stringify({
                        title: `@${owner.name} mentioned you in a squeal`,
                        body: `${truncate(message, 20)}`,
                    });

                    await notifications.sendNotification(mentionUser._id, payload);

                    mentionUser.notifications.push({
                        notificationType: "mention",
                        text: `@${owner.name} mentioned you in a squeal.`,
                        link: `/Home/squeal/${newSqueal._id}`,
                        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
                        author: owner._id,
                        createdAt: Date.now(),
                    });

                    await mentionUser.save();
                }
            });
        }

        // keywords begin with #
        const regexp = /#\w+/g;
        const keywords = message.match(regexp);
        console.log(keywords);

        if (keywords) {
            newSqueal.keywords = [...keywords];
        }
    }

    if (
        newSqueal.type === "image" ||
        newSqueal.type === "geolocation" ||
        newSqueal.type === "video"
    ) {
        if (!privacy && !validateChars(125, owner) && squeal.fromModerator !== true) {
            res.status(400).json({
                success: false,
                error: "You have exceeded your daily, weekly or monthly message quota",
            });
            return;
        }

        squealLen = 125;
    }

    const getUserDebt = (len) => {
        const debt = {
            daily: 0,
            weekly: 0,
            monthly: 0,
        };

        if (squeal.fromModerator === true) {
            return debt;
        }

        if (owner.msg_quota.daily > 0 && owner.msg_quota.daily - len < 0)
            debt.daily = owner.msg_quota.daily - len;
        if (owner.msg_quota.weekly > 0 && owner.msg_quota.weekly - len < 0)
            debt.weekly = owner.msg_quota.weekly - len;
        if (owner.msg_quota.monthly > 0 && owner.msg_quota.monthly - len < 0)
            debt.monthly = owner.msg_quota.monthly - len;

        return debt;
    };


    if (!privacy && squeal.fromModerator !== true) {
        console.log("debt", getUserDebt(squealLen));
        owner.msg_quota.debt = getUserDebt(squealLen);
        owner.msg_quota.daily -= squealLen;
        owner.msg_quota.weekly -= squealLen;
        owner.msg_quota.monthly -= squealLen;
    }

    // Owner

    owner.squeals.push(newSqueal._id);
    owner.save();

    // Squeal distribution

    console.log(squeal.recipients);
    console.log(newRecipients);
    newSqueal.recipients = [...newRecipients];

    newRecipients.forEach(async (recipient) => {
        if (recipient.type === "User") {
            const user = await usersDB.searchUserByID(recipient.id);
            user.squeals.push(newSqueal._id);
            user.save();
        } else if (recipient.type === "Channel") {
            const channel = await channelsDB.searchChannelByID(recipient.id);
            channel.squeals.push(newSqueal._id);
            channel.save();
        } else if (recipient.type === "Keyword") {
            const keyword = await keywordsDB.searchKeywordByID(recipient.id);
            keyword.squeals.push(newSqueal._id);
            keyword.save();
        }
    });

    if (newSqueal.automatic) {
        squealsDB.scheduleSqueal(
            newSqueal._id,
            newSqueal.cronJobExpr,
            owner._id
        );
    }

    newSqueal.visibility = privacy ? "private" : "public";


    await newSqueal.save();

    await conditionsDB.executeAll(newSqueal, ["creation"]);

    res.json({
        success: true,
        squeal: {
            ...newSqueal._doc,
            recipients: [...newRecipients],
            ownerID: {
                _id: owner._id,
                name: owner.name,
                img: owner.img,
            },
        },
    });
});

router.get("/allSquealsByChannel/:id", async (req, res) => {
    const squeals = await squealsDB.getAllSquealsByRecipientID(
        "channel",
        req.params.id
    );
    const results = squeals.map(
        async (squeal) => await squealsDB.transformSqueal(squeal)
    );
    for (let i = 0; i < results.length; i++) {
        results[i] = await results[i];
    }
    res.status(200).json(results.reverse());
});

router.get("/search/:id", async (req, res) => {
    const squeal = await squealsDB.getSquealByID(req.params.id);
    res.status(200).json(squeal);
});

router.delete("/:id", async (req, res) => {
    const squeal = await squealsDB.getSquealByID(req.params.id); // squeal to be deleted
    const owner = await usersDB.searchUserByID(squeal.ownerID); // owner of the squeal
    const squealIndex = owner.squeals.indexOf(req.params.id); // index of the squeal in the owner's squeals array
    owner.squeals.splice(squealIndex, 1); // remove the squeal from the owner's squeals array
    owner.save();

    const recipients = squeal.recipients; // recipients of the squeal
    recipients.forEach(async (recipient) => {
        // for each recipient of the squeal we remove the squeal from their squeals array
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

    await squealsDB.deleteSquealByID(req.params.id); // delete the squeal from the squeals collection

    res.status(200).json({ success: true });
});

router.post("/all", async (req, res) => {
    const squeals = await squealsDB.getAllSqueals();
    res.status(200).json(squeals.reverse());
});

router.get("/cron/:id", async (req, res) => {
    const id = req.params.id;
    const squeals = await squealsDB.getAllScheduledActiveSquealsByID(id);
    res.status(200).json(squeals);
});

router.delete("/cron/:id", async (req, res) => {
    const id = req.params.id;
    await squealsDB.stopSquealScheduling(id);
    res.status(200).json({ success: true });
});

router.post("/:id/view", async (req, res) => {
    await squealsDB.updateSquealImpressions(req.params.id);
    res.status(200).json({ success: true });
});

//take a squeal by its id and add a keyword to it
router.post("/addKeywordToSqueal/:id", async (req, res) => {
    const keyword = req.body.keyword;
    const squealId = req.params.id;

    const id = await keywordsDB.addSquealToKeyword(
        keyword,
        squealId
    );

    //keywords.push(id);

    //return 
    res.status(200).json({ success: true, keywordId: id });
});


// filtered squeals



module.exports = router;
