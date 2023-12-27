/* Utils */
require("dotenv").config();


const { server_log, checkRole, auth } = require("./utils/utils.js");


const PORT = process.env.PORT || 8000;

global.rootDir = __dirname;
global.startDate = null;

server_log("starting server...");

server_log("loading modules...");

const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const path = require("path");
const mymongo = require("./db/mongo.js");
const channelRouter = require("./server/channelRouter.js");
const usersRouter = require("./server/usersRouter.js");
const apiRouter = require("./server/api.js");
const subscriptionRouter = require("./server/subscriptionRouter.js")

const webpush = require("web-push")



/* NEXT CONFIG */
const next = require("next");
const appNextOptions = {
    dev: process.env.NODE_ENV !== "production",
    customServer: true,
    conf: require("./SquealerApp/next.config.js"),
    dir: path.resolve(__dirname, "SquealerApp"),
    port: PORT,
};
server_log("next options: ", appNextOptions);

const appNext = next(appNextOptions);
const handle = appNext.getRequestHandler();

server_log("preparing next app...");
appNext
    .prepare()
    .then(() => {
        server_log("next app prepared!");
        /* ========================== */
        /*                            */
        /*  EXPRESS CONFIG & ROUTES   */
        /*                            */
        /* ========================== */

        let app = express();
        app.use("/js", express.static(global.rootDir + "/public/js"));
        app.use(
            "/bootstrap",
            express.static(global.rootDir + "/public/bootstrap")
        );
        app.use("/leaflet", express.static(global.rootDir + "/public/leaflet"));
        app.use("/css", express.static(global.rootDir + "/public/css"));
        app.use("/data", express.static(global.rootDir + "/public/data"));
        app.use("/docs", express.static(global.rootDir + "/public/html"));
        app.use("/img", express.static(global.rootDir + "/public/media"));
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());

        const bodyParser = require('body-parser');
        //upload media limit
        app.use(bodyParser.json({ limit: '10mb' }));
        app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

        app.use(express.json());
        app.use(cookieParser());

        
        const vapidKeys = {
            public: "BKd0FOnmkngVtRSf7N3ogMcnnDQGtu5PSMcbzmt_uvrcDTpL424TE6W92qpnMGZPeh1XqHi1rA_MT0iUL0gBXuY",
            private: "GyXqHJJVtw7uXgCx9mXw9QK65SsCnALClWNHpPHy2pQ",
        }

        webpush.setVapidDetails(
            'mailto:squealer@noreply.com',
            vapidKeys.public,
            vapidKeys.private
        )


        mymongo.connectToDB();

        // #TODO-gianlo: separate routes in different files, maybe create a server directory?

        //for nextjs static images
        app.use(express.static(path.join(__dirname, "SquealerApp", "public")));

        app.use(
            "/SMM",
            auth,
            checkRole(["SMM", "Mod"]),
            express.static(path.join(__dirname, "SquealerSMMDashboard", "dist"))
        );

        app.get("/manifest.json", async function (req, res) {
            res.sendFile(path.join(__dirname, "SquealerApp", "public", "manifest.json"))
        })

        

        // https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
        app.enable("trust proxy");

        app.get("/", async function (req, res) {
            appNext.render(req, res, "/Home");
        });

        app.get("/Login", async function (req, res) {
            appNext.render(req, res, "/Home/Login");
        });

        app.get("/Home", async function (req, res) {
            appNext.render(req, res, "/Home");
        });

        app.get("/SMM/*", async function (req, res) {
            res.sendFile(
                path.join(
                    __dirname,
                    "SquealerSMMDashboard",
                    "dist",
                    "index.html"
                )
            );
        });

        app.get(
            "/Moderator",
            auth,
            checkRole(["Mod"]),
            async function (req, res) {
                res.sendFile(
                    path.join(
                        __dirname,
                        "SquealerModeratorDashboard",
                        "index.html"
                    )
                );
            }
        );

        app.use("/api", apiRouter);
        app.use("/api/channels", channelRouter);
        app.use("/api/users", usersRouter);
        app.use("/api/push", subscriptionRouter)

        /* APP SSR */
        app.post("/Home/api/*", async (req, res) => {
            await handle(req, res);
        });

        app.get("/Home/*", (req, res) => {
            return handle(req, res);
        });

        /* 404 */

        app.use(function (req, res, next) {
            res.status(404).sendFile(
                path.join(__dirname, "public", "html", "404.html")
            );
        });



        /* ========================== */
        /*                            */
        /*    ACTIVATE NODE SERVER    */
        /*                            */
        /* ========================== */

        app.listen(PORT, function () {
            global.startDate = new Date();
            server_log(
                `App listening on port ${PORT} started ${global.startDate.toLocaleString()}`
            );
        });
    })
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    });

/*       END OF SCRIPT        */
