/**
 * Logs a message to the console in both Node.js and browser environments.
 *
 * @param {string} message - The message to be logged.
 * @return {void} This function does not return anything.
 */
const logMessage = (message) => {
    if (typeof window === "undefined") {
        console.log(message);
    } else {
        window.LOG && console.log(message);
        window.message = message;
    }
};

module.exports = { default: logMessage }