var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
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

router.get('/', function(req, res, next) {
  var username = req.body.emotion
  var password = req.body.feedback

  var output = {
        response: 'Success', 
        data: 'this is the get method!'
      }
  res.send(output)
});

router.post('/test', function(req, res, next) {
  var username = req.body.emotion
  var password = req.body.feedback

  var output = {
        response: 'Success', 
        data: 'this that young test!!'
      }
  res.send(output)
});


module.exports = router;
