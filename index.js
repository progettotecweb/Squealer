/* Utils */

const server_log = (msg, ...args) => {
    console.log("[SERVER]> " + msg, ...args);
};

global.rootDir = __dirname;
global.startDate = null;

server_log("starting server...");

server_log("loading modules...");
const express = require("express");
const cors = require("cors");
const path = require("path");
const mymongo = require("./db/mongo.js");

/* NEXT CONFIG */
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const config = require("./SquealerApp/next.config.js");
server_log("next config: ", config);
const appNext = next({
    dev,
    customServer: true,
    conf: config,
    dir: path.resolve(__dirname, "SquealerApp"),
});
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
        app.use("/css", express.static(global.rootDir + "/public/css"));
        app.use("/data", express.static(global.rootDir + "/public/data"));
        app.use("/docs", express.static(global.rootDir + "/public/html"));
        app.use("/img", express.static(global.rootDir + "/public/media"));
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        app.use(express.json());

        //app.use("/Home", express.static(path.join(__dirname, "SquealerApp", "dist")));
        app.use(
            "/SMM",
            express.static(path.join(__dirname, "SquealerSMMDashboard", "dist"))
        );
        app.use(
            "/Moderator",
            express.static(path.join(__dirname, "SquealerModeratorDashboard"))
        );

        // https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
        app.enable("trust proxy");

        app.get("/", async function (req, res) {
            res.redirect("/Home");
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

        app.get("/Moderator/*", async function (req, res) {
            res.sendFile(
                path.join(__dirname, "SquealerModeratorDashboard", "index.html")
            );
        });

        const info = async function (req, res) {
            let data = {
                startDate: global.startDate.toLocaleString(),
                requestDate: new Date().toLocaleString(),
                request: {
                    host: req.hostname,
                    method: req.method,
                    path: req.path,
                    protocol: req.protocol,
                },
                query: req.query,
                body: req.body,
            };
            res.send(await template.generate("info.html", data));
        };

        app.get("/info", info);
        app.post("/info", info);

        /** API */
        app.get("/api/account", async function (req, res) {
            res.json({
                username: "admin",
                password: "admin",
            });
        });

        const mock_data = [
            "@squealer",
            "§TOP 100",
            "§TOP 1000",
            "§CONTROVERSIAL",
            "§NEW",
            "@gianlo",
            "@fen",
            "@crazytimes",
            "#JFK",
            "#JFKJr",
        ];

        app.post("/api/squeal", async function (req, res) {
            console.log("squeal", req.body);

            res.json({
                success: true,
            });
        });

        app.get("/api/search", async function (req, res) {
            const query = req.query.q;
            if (query === "") {
                res.status(200).json({ results: [] });
                return;
            }
            const re = new RegExp(req.query.q, "i");

            const results = mock_data.filter((item) => {
                return item.match(re);
            });

            res.status(200).json({ results });
        });

        /* ========================== */
        /*                            */
        /*           MONGODB          */
        /*       using mongoose       */
        /* ========================== */

        /* Replace these info with the ones you were given when activating mongoDB */
        const mongoCredentials = {
            user: "",
            pwd: "",
            site: "127.0.0.1:27017",
        };
        /* end */

        app.get("/db/create", async function (req, res) {
            res.send(await mymongo.create(mongoCredentials));
        });
        app.get("/db/search", async function (req, res) {
            res.send(await mymongo.search(req.query, mongoCredentials));
        });
        app.get("/db/connect", async function (req, res) {
            res.send(await mymongo.connect(mongoCredentials));
        });

        app.get("*", (req, res) => {
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

        app.listen(8000, function () {
            global.startDate = new Date();
            server_log(
                `App listening on port 8000 started ${global.startDate.toLocaleString()}`
            );
        });
    })
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    });

/*       END OF SCRIPT        */
