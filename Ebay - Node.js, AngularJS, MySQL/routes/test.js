/**
 * Created by Salmaan on 9/28/2016.
 */

var mysql = require('./connection_pooling.js');


function testquery(request, response) {

    testquery1(request, response);
    //testquery1(request,response);


}


function testquery1(request, response) {

    query = 'select * from users';
    mysql.CreateConnectionPool();

    mysql.getConnection(function(conn){

        conn.query(query, function (err, rows) {
            if (err)
                console.log(err);
            else {
                console.log(rows);
                mysql.releaseConnection(conn);
                response.end();
            }
        });

    });

    mysql.getConnection(function(conn){

        conn.query(query, function (err, rows) {
            if (err)
                console.log(err);
            else {
                console.log(rows);
                mysql.releaseConnection(conn);
                response.end();
            }
        });

    });

    // conn.query(query, function (err, rows) {
    //     if (err)
    //         console.log(err);
    //     else {
    //         console.log(rows);
    //         mysql.releaseConnection(conn);
    //         response.end();
    //     }
    // });

    // var conn2 = mysql.getConnection();
    // conn2.query(query, function (err, rows) {
    //     if (err)
    //         console.log(err);
    //     else {
    //         console.log(rows);
    //         mysql.releaseConnection(conn2);
    //         response.end();
    //     }
    // });

}


//
//     mysql.CreateConnectionPool();
//     query = 'select * from login';
//     var conn = mysql.getConnection();
//     conn.query(query, function (err, rows) {
//         if (err)
//             console.log(err);
//         else {
//             console.log(rows);
//             mysql.releaseConnection(conn);
//             response.end();
//         }
//     });
//     var conn2 = mysql.getConnection();
//     conn2.query(query, function (err, rows) {
//         if (err)
//             console.log(err);
//         else {
//             console.log(rows);
//             mysql.releaseConnection(conn2);
//             response.end();
//         }
//     });
// }


exports.testquery = testquery;