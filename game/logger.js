// Modify console.log statements to work in both Node.js and browser environments
const relayMessage = (message, type) => {
    if (typeof window === "undefined") {
        console.log(message);
    } else {
        window.LOG && console.log(message);
        window.message = {message, type};
    }
};

module.exports = { default: relayMessage }