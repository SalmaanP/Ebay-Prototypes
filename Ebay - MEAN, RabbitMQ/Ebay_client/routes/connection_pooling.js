/**
 * Created by Salmaan on 9/28/2016.
 */

var mysql = require('mysql');

var poolSize = 100;
var queueSize = 100;

var pool = [];
var queue = [];
var queueCount = 0;

var queueNotifier = new Map();


function CreateConnectionPool() {

    for (var i = 0; i < poolSize; i++) {
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'test',
            database: 'ebay'
        });
        pool.push(connection);

    }
}

function getConnection(callback) {

    console.log("connection requested");

    if (isConnectionFree()) {

        console.log("connection free");
        callback(pool.pop());


    } else {

        console.log("connection not free");
        if (isQueueFree()) {

            console.log('in queue');
            queue.push(queueCount);
            queueNotifier.set(queueCount, false);
            token = queueCount;
            queueCount++;
            waitInQueue(token, function (conn) {
                callback(conn)
            });

        } else {

            console.log('queue not free');
            return null;
        }
    }
}

function waitInQueue(token, callback) {

    while (!queueNotifier.get(token)) {

        if (queueNotifier.get(token)) {
            if (isConnectionFree()) {
                console.log('waiting');
                // return (pool.pop());
                callback(pool.pop());
            }
        }

    }

}

function releaseConnection(connection) {

    pool.push(connection);
    console.log('connection released');
    queueNotifier.set(queue.pop(), true);
    queue.shift();

}

function isConnectionFree() {

    return pool.length > 0;

}

function isQueueFree() {

    return queue.length < queueSize;
}

exports.CreateConnectionPool = CreateConnectionPool;
exports.getConnection = getConnection;
exports.releaseConnection = releaseConnection;