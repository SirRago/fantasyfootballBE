var express = require('express');
var router = express.Router();
var dbAdapter = require('../src/dbAdapter')

/* GET users listing. */
router.post('/', function(req, res, next) {

  var user = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  }

  if(user.username == null || user.password == null || user.email ==null){
      result ={status:1,message:"API needs username,password,email"}
      if(result.status){ res.statusCode = 500;res.status = 500;}
      res.send(result)
      return
  }
  

  //result.status - 0=success 1=failed
  dbAdapter.registerUser(user,(result)=>{
    if(result.status){ res.statusCode = 500;res.status = 500;}
    res.send(result)
  })
  
});



module.exports = router;
