/* Utils */
require("dotenv").config();
const bcrypt = require("bcrypt");
const crypto = require("crypto");


const { server_log } = require("./utils/utils.js");

const PORT = process.env.PORT || 8000;

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
        app.use("/css", express.static(global.rootDir + "/public/css"));
        app.use("/data", express.static(global.rootDir + "/public/data"));
        app.use("/docs", express.static(global.rootDir + "/public/html"));
        app.use("/img", express.static(global.rootDir + "/public/media"));
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        app.use(express.json());

        // #TODO-gianlo: separate routes in different files, maybe create a server directory?

        //for nextjs static images
        app.use(express.static(path.join(__dirname, "SquealerApp", "public")));

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

        app.get("/Moderator/*", async function (req, res) {
            res.sendFile(
                path.join(__dirname, "SquealerModeratorDashboard", "index.html")
            );
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

        app.post("/api/register", async function (req, res) {
            const user = await mymongo.searchByUsername(
                req.body.username,
                mongoCredentials
            );

            if (user) {
                res.status(401).json({
                    ok: false,
                    error: "Username already in use",
                });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            //hash password with salt and bcrypt
            const hashedPassword = await bcrypt.hash(req.body.password, salt);


            const newUser = {
                nome: req.body.username,
                password: hashedPassword,
                salt: salt,
                ruolo: "Utente",
                quota_msg: {
                    giorno: 1000,
                    settimana: 6000,
                    mensile: 24000,
                    extra: 0
                },
                popolarità: 0,
                img: null,
            };

            console.log(newUser)

            await mymongo.addUser(newUser, mongoCredentials);

            res.status(200).json({
                ok: true,
            });
        })

        app.post("/api/user-login", async function (req, res) {
            const user = await mymongo.searchByUsername(
                req.body.username,
                mongoCredentials
            );

            if (!user) {
                res.status(401).json({
                    ok: false,
                    error: "Username not found",
                });
                return;
            }

            const right = await bcrypt.compare(req.body.password, user.password);

            if (!right) {
                res.status(401).json({
                    ok: false,
                    error: "Wrong password",
                });
                return;
            }

            const actualUser = {
                name: user.nome,
                id: user._id,
                role: user.ruolo,
            };
            res.status(200).json(actualUser);
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
