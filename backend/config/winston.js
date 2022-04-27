/* 
 * Web Engineering II
 * Prof. Dr. Sebastian von Klinski
 * Sommersemester 2021
 * Semesterprojekt "MENSA - Community-Website für Studierende"
 * Simon Nunez Aschenbrenner (Matrikelnr. 908606)
 */

// Adapted from: https://coralogix.com/log-analytics-blog/complete-winston-logger-guide-with-hands-on-examples/

const { createLogger, format, transports } = require("winston");

const logger = createLogger({
    level: "silly",
    transports: [
	    new transports.Console({
            level: "silly",
            format: format.combine(
                format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
                format.colorize(),
                format.printf(({level, message, timestamp}) => { return `${timestamp} ${level}: ${message}`})
            )
        }),
	    new transports.File({
            filename: "./logs/app.log",
            level: "debug",
            format: format.combine(
                format.timestamp(),
                format.json()
            )
        })
    ]
});
  
// create a stream object with a 'write' function that will be used by "morgan"
logger.stream = {
    write: function(message, encoding) {
        // use the "info" log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports = logger;