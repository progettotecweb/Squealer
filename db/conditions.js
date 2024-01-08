const mongoose = require("mongoose");
const esprima = require("esprima");
const estraverse = require("estraverse");
const channelsDB = require("./channels");

const conditionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    cond: {
        type: String,
        required: true,
    },
    effects: {
        type: [Object],
        required: true,
    },
    executeOn: {
        type: String,
        enum: ["all", "creation", "reaction", "reply", "view"],
        default: "all",
    },
});

const Condition = mongoose.model("Condition", conditionSchema);

module.exports.createNewCondition = async (name, cond, effects) => {
    let tree;
    try {
        tree = esprima.parseScript(cond);
    } catch (e) {
        return {
            error: "Invalid condition",
        };
    }

    if (
        tree.body[0].type !== "ExpressionStatement" ||
        tree.body[0].expression.type !== "LogicalExpression"
    ) {
        return {
            error: "Invalid condition: must be a logical expression",
        };
    }

    const validIdentifiers = [
        "squeal",
        "type",
        "content",
        "text",
        "img",
        "video",
        "geolocation",
        "keywords",
        "id",
        "recipients",
        "includes",
        "length",
        "reactions",
        "m2",
        "m1",
        "p1",
        "p2",
        "cm",
        "Rp",
        "Rm",
        "label",
        "impressions",
        "analysis",
        "labels",
        "toBeReviewed",
    ];

    let valid = true;
    estraverse.traverse(tree, {
        enter: function (node) {
            if (node.type === "Identifier") {
                // identifiers can only acceptable if they are in the given array
                if (!validIdentifiers.includes(node.name)) {
                    valid = false;
                }
            }
        },
    });

    if (!valid) {
        return {
            error: "Invalid condition",
        };
    }

    const validEffects = [
        "$addToChannel",
        "$removeFromChannel",
        "$deleteSqueal",
    ];

    let condError = false;
    //check if effects contains valid effects
    effects.forEach((effect) => {
        if (!validEffects.includes(Object.keys(effect)[0])) {
            condError = true;
        }
    });

    if (condError) {
        return {
            error: "Invalid effect",
        };
    }

    const condition = new Condition({
        name,
        cond,
        effects,
    });

    await condition.save();
    return condition;
};

module.exports.executeAll = async (squeal, executeOn = ["all"]) => {
    console.log("Executing...");
    const conditions = await Condition.find({
        executeOn: { $in: executeOn },
    });
    console.log("Found " + conditions.length + " conditions");

    conditions.forEach((condition) => {
        const test = new Function("squeal", `return ${condition.cond};`);

        let result;
        try {
            result = test(squeal);
        } catch (e) {
            console.log("Error in condition " + condition.name);
            return;
        }

        if (result) {
            console.log("RUNNING condition " + condition.name);
            condition.effects.forEach(async (effect) => {
                const key = Object.keys(effect)[0];
                const value = Object.values(effect)[0];
                if (key === "$addToChannel") {
                    const channel = await channelsDB.searchChannelByName(value);
                    if (channel) {
                        if (!channel.squeals.includes(squeal._id)) {
                            channel.squeals.push(squeal._id);
                            squeal.recipients.push({
                                id: channel._id,
                                type: "Channel",
                            });

                            await channel.save();
                            await squeal.save();
                        }
                    }
                } else if (key === "$removeFromChannel") {
                } else if (key === "$deleteSqueal") {
                }
            });
        } else {
            console.log("Condition " + condition.name + " not met");
        }
    });
};
