// Modify console.log statements to work in both Node.js and browser environments
const logMessage = (message) => {
    if (typeof window === "undefined") {
        console.log(message);
    } else {
        window.LOG && console.log(message);
        window.message = message;
    }
};

module.exports = { default: logMessage }