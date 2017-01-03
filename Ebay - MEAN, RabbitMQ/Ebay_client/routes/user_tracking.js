/**
 * Created by Salmaan on 10/15/2016.
 */


"use strict";
const winston = require('winston');
const file = require('fs');
const env = process.env.NOV_ENV || 'development';
const path = 'logs';
var logger;
var bidlog;


exports.openLogs = function () {

    if (!file.existsSync(path)) {
        file.mkdirSync(path);
    }

    const timestamp = () => (new Date()).toLocaleString();

    logger = new (winston.Logger)({
        transports: [
            new(winston.transports.File)({
                filename : `${path}/Logs.log`,
                timestamp: timestamp,
                level: env === 'development' ? 'debug' : 'info'
            })
        ]
    });

    bidlog = new (winston.Logger)({
        transports: [
            new(winston.transports.File)({
                filename : `${path}/bidlog.log`,
                timestamp: timestamp,
                level: env === 'development' ? 'debug' : 'info'
            })
        ]
    });

};



exports.log = function (msg) {

    logger.info(msg);
};

exports.bidlog = function (msg) {

    bidlog.info(msg);
};
