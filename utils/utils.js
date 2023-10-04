
/**
 * @brief Prints a message to the console with a prefix.
 * @param {any} msg the message to print
 * @param  {...any} args optional args to print
 */
const server_log = (msg, ...args) => {
    console.log("[SERVER]> " + msg, ...args);
};

module.exports = {
    server_log,
};