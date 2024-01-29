const webpush = require("web-push");
const subscriptionsDB = require("../../db/subscriptions");

exports.sendNotification = async (userID, payload) => {
    const subs = await subscriptionsDB.getSubscriptionByUser(userID);

    let promises = [];
    let count = 0;

    subs.forEach((s) => {
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
                        reject(new Error("Subscription no longer valid"));
                    } else if (res.statusCode === 201) {
                        console.log("Sent to " + s._id);
                        count++;
                        resolve();
                    }
                })
                .catch((error) => {
                    subscriptionsDB.removeSubscription(s._id);
                });
        });

        promises.push(notificationPromise);
    });

    Promise.all(promises)
        .then(() => {
            console.log("Sent to " + count + " devices");
        })
        .catch((error) => {
            console.error("There was an error");
        });
};
