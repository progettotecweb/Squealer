const newsBot = require("./news.js")

exports.setupBots = async function () {
    await newsBot.setupNewsBot()
}