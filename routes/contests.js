var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    var contests = [ {game:'football', players:'8 of 19'} , {game:'football', players:'8 of 19'} ]


  var output = {
        response: 'Success', 
        data: contests
      }
  res.send(output)
});


module.exports = router;
