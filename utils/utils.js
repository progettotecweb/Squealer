const path = require("path");
const jwt = require("jsonwebtoken");
const { getToken } = require("../SquealerApp/node_modules/next-auth/jwt");

/**
 * @brief Prints a message to the console with a prefix.
 * @param {any} msg the message to print
 * @param  {...any} args optional args to print
 */
const server_log = (msg, ...args) => {
    console.log("[SERVER]> " + msg, ...args);
};

const auth = async (req, res, next) => {

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (token) {
        req.user = {"role": token.role};
        next();
    } else {
        res.status(401).sendFile(
            path.join(global.rootDir, "public", "html", "401.html")
        );
    }
}

const checkRole = (roles) => async (req, res, next) => {
    const user = req.user;

    if (!user) {
        res.status(401).json({
            error: "Unauthorized",
        });
    }

    if (user) {
        if (roles.includes(user.role)) {
            next();
        } else {
            res.status(401).sendFile(
                path.join(global.rootDir, "public", "html", "401.html")
            );
        }
    }
};

module.exports = {
    server_log,
    checkRole,
    auth
};
