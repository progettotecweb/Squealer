const mongoose = require("mongoose");

const Subscription = mongoose.Schema({
    subscription: {
        type: Object,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

const SubscriptionModel = mongoose.model("Subscription", Subscription);
exports.SubscriptionModel = SubscriptionModel;

exports.saveSubscriptionToDb = async (subscription, user) => {
    
    const sub = new SubscriptionModel({
        subscription,
        user
    });

    const existingSub = await SubscriptionModel.findOne({ subscription: subscription });
    if (existingSub) {
        return existingSub;
    }

    return await sub.save();
}

exports.getSubscriptionsFromDb = async () => {
    return await SubscriptionModel.find();
}

exports.getSubscriptionByUser = async (user) => {
    return await SubscriptionModel.find({ user: user });
}

exports.removeSubscription = async (id) => {
    return await SubscriptionModel.deleteOne({_id: id})
}