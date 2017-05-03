var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
    console.log(req)
  var username = req.body.username
  var password = req.body.password
  

  var output = {
        response: username + ' fsvsf', 
        data: 'this is the post method! - success'
      }

      console.log(username)
      console.log(password)
  res.send(output)
});



module.exports = router;
