const { CronJob } = require("cron");

const usersDB = require("../db/users");
const squealsDB = require("../db/squeals");
const channelsDB = require("../db/channels");
const bcrypt = require("bcrypt");
const mediaDB = require("../db/media");

const API_KEY = "7938278ec45d452aa2566f2be746acf7";

const getNews = async (category, country) => {
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.articles;
};

exports.setupNewsBot = async () => {
    let newsBot = await usersDB.searchUserByName("NewsBOT");

    if (!newsBot) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("NewsBOT", salt);

        newsBot = await usersDB.createNewUser({
            name: "NewsBOT",
            password: hash,
            img: await mediaDB.getDefaultProfilePicture(),
            bio: "I am a bot that posts news articles to the News channel!",
            role: "Mod",
        });
    }

    let newsChannel = await channelsDB.searchChannelByName("NEWS");

    if (!newsChannel) {
        newsChannel = await channelsDB.createNewChannel({
            name: "NEWS",
            description: "News from all around the globe",
            visibility: "public",
            can_user_post: false,
            official: true,
            blocked: false,
        });
    }

    CronJob.from({
        cronTime: "0 * * * *",
        onTick: async () => {
            const articles = await getNews("general", "it");
            await createSquealFromNewsArticle(articles[0], newsBot, newsChannel);
        },
        start: true,
        timeZone: "America/New_York",
    });
};

const createSquealFromNewsArticle = async (article, bot, channel) => {
    console.log(article)
    const body = `${article.title} ${article.description && `- ${article.description}`} \n $URL=${article.url}`;

    console.log(body);

    const squeal = await squealsDB.createNewSqueal({
        type: "text",
        content: {
            img: null,
            video: null,
            geolocation: null,
            text: body
        },
        recipients: [{
            type: "Channel",
            id: channel._id,
        }],
        ownerID: bot._id,
        visibility: "public",
        automatic: false,
    })

    channel.squeals.push(squeal._id);

    await channel.save();

    await squeal.save();
};

// set up cron job to run every minute
// CronJob.from({
//     cronTime: "* * * * *",
//     onTick: async () => {
//         const articles = await getNews("general", "it")
//         console.log(articles[0])
//     },
//     start: true,
//     timeZone: "America/New_York"
// })
