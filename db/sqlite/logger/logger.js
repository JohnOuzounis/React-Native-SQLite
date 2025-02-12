const logger = {
    active: true,
    log: function (...args) {
        if (this.active) console.log(...args);
    },
};

export default logger;
