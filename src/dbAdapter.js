'use strict'
var mysql = require('mysql');

var connectionPool = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : 'Pokersk1',
  database : 'fantasyfootballdb'
});


const registerUser = function (user, cb){
    connectionPool.getConnection(function(err, connection) {
  // Use the connection
 connection.query('INSERT INTO users  (\`username\`, \`password\`, \`confirmregister\`, \`email\`) VALUES (\'' + user.username + '\', \'' + user.password + '\', 0 , \'' + user.email + '\')', function (error, results, fields) {
    // And done with the connection.
    // Handle error after the release.
    if (error){
        console.log('Error in registerUser: ' + error.message + ' --- ' + error) 
        connection.release();
        cb({
            status: 1,
            message: 'Error in registerUser: ' + error.message + ' --- ' + error
        })
       }
    else{
        console.log('results in registerUser: ', results) 
        console.log('fields in registerUser: ', fields) 
        connection.release();
        cb({
            status: 0,
            message: 'success'
        })
    }   



    // Don't use the connection here, it has been returned to the pool.
  });
});

    


}

const confirmRegisterUser = function (username, password, email, key, cb ){

}



module.exports = { registerUser, confirmRegisterUser }