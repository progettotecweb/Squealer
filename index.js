/* Utils */
require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { server_log, checkRole, auth } = require("./utils/utils.js");
const default_img = require("./utils/default_image.json")

const PORT = process.env.PORT || 8000;

global.rootDir = __dirname;
global.startDate = null;

server_log("starting server...");

server_log("loading modules...");
const express = require("express");
const cors = require("cors");
const path = require("path");
const mymongo = require("./db/mongo.js");
const mongoChannels = require("./db/channels.js");
const channelRouter = require("./server/channelRouter.js");

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
        app.use("/css", express.static(global.rootDir + "/public/css"));
        app.use("/data", express.static(global.rootDir + "/public/data"));
        app.use("/docs", express.static(global.rootDir + "/public/html"));
        app.use("/img", express.static(global.rootDir + "/public/media"));
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        app.use(express.json());
        app.use(cookieParser());

        const uri =
            process.env.NODE_ENV === "production"
                ? `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_SITE}/db?writeConcern=majority`
                : `mongodb://127.0.0.1:27017/db?writeConcern=majority`;

        mongoose
            .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => server_log("Connected to MongoDB..."))
            .catch((err) =>
                console.error("Could not connect to MongoDB...", err)
            );

        // #TODO-gianlo: separate routes in different files, maybe create a server directory?

        //for nextjs static images
        app.use(express.static(path.join(__dirname, "SquealerApp", "public")));

        app.use(
            "/SMM",
            auth,
            checkRole(["SMM","Mod"]),
            express.static(path.join(__dirname, "SquealerSMMDashboard", "dist"))
        );

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

        app.post("/api/squeal", auth, async function (req, res) {
            console.log("squeal", req.body);

            res.json({
                success: true,
            });
        });


        app.get("/api/searchUserById", async function (req, res) {
            try {
                const id = req.query.id;

                if (!id || mongoose.Types.ObjectId.isValid(id) == false) {  //controllo la validità dell'id
                    res.status(400).json({
                        error: "Bad request",
                    });
                    return;
                }

                const user = await mymongo.searchUserById(
                    id
                );


                if (!user) {
                    res.status(404).json({
                        error: "User not found",
                    });
                    return;
                }

                res.json(user)
            }
            catch (error) {
                console.error(error)
                res.status(500).json({
                    error: "Internal server error",
                });
            }

        }); 

        app.use("/api/channels", channelRouter);

        app.get("/api/searchUserSMM", async function (req, res) {
            try {
                const id = req.query.id;

                if (!id || mongoose.Types.ObjectId.isValid(id) == false) {  
                    res.status(400).json({
                        error: "Bad request",
                    });
                    return;
                }

                const user = await mymongo.searchUserById(
                    id
                );


                if (!user) {
                    res.status(404).json({
                        error: "User not found",
                    });
                    return;
                }

                res.json(user)
            }
            catch (error) {
                console.error(error)
                res.status(500).json({
                    error: "Internal server error",
                });
            }

        }); 

        app.get("/api/search", async function (req, res) {
            const query = req.query.q;
            if (query === "") {
                res.status(200).json({ results: [] });
                return;
            }

            const results = await mymongo
                .search(
                    { nome: new RegExp(req.query.q, "i") }
                )
                .then((data) =>
                    data.map((user) => {
                        return {
                            _id: user._id,
                            nome: user.nome,
                            ruolo: user.ruolo,
                            img: user.img,
                        };
                    })
                );

            res.status(200).json({ results });
        });

        app.post("/api/register", async function (req, res) {
            const user = await mymongo.searchByUsername(
                req.body.username
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
                ruolo: "Mod",
                quota_msg: {
                    giorno: 1000,
                    settimana: 6000,
                    mensile: 24000,
                    extra: 0,
                },
                popolarità: 0,
                img: default_img,
            };

            console.log(newUser);

            await mymongo.addUser(newUser, mongoCredentials);

            res.status(200).json({
                ok: true,
            });
        });

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

            const right = await bcrypt.compare(
                req.body.password,
                user.password
            );

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
