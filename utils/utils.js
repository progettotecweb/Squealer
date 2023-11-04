const path = require("path");
const { getToken } = require("../SquealerApp/node_modules/next-auth/jwt");

const usersDB = require("../db/users");

/**
 * @brief Prints a message to the console with a prefix.
 * @param {any} msg the message to print
 * @param  {...any} args optional args to print
 */
const server_log = (msg, ...args) => {
    console.log("[SERVER]> " + msg, ...args);
};

const signOut = async () => {
    await fetch("/Home/api/auth/signout?callbackUrl=/Login", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: await fetch("/Home/api/auth/csrf").then((rs) => rs.text()),
    }).then((res) => {
        res.ok
            ? (window.location.href = "/Login")
            : console.error("Error while signing out!");
    });
};

const auth = async (req, res, next) => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (token) {
        const user = await usersDB.searchUserByID(token.id);

        if(!user) {
            signOut();
            res.status(404).sendFile(
                path.join(global.rootDir, "public", "html", "404.html")
            )
        }

        req.user = {"role": user.ruolo};
        next();
    } else {
        res.status(401).sendFile(
            path.join(global.rootDir, "public", "html", "401.html")
        );
    }
}

const checkIfUserStillExists = async (id) => {
    const user = await usersDB.searchUserByID(id);

    if(!user) {
        signOut();
        res.status(404).sendFile(
            path.join(global.rootDir, "public", "html", "404.html")
        )
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
    auth,
    signOut,
    checkIfUserStillExists,
};
