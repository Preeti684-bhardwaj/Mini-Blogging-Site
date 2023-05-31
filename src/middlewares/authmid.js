const authorModel=require('../models/authorModel')
const blogModel=require('../models/blogModel')
const jwt = require("jsonwebtoken");

const authenticationMid = function (req, res, next) {
  try { 
    let token = req.headers["x-api-key"]; 
    if (!token)
      return res.status(400).send({ status: false, msg: "token must be present" });
 
    const decodedToken=jwt.verify(token, "blogging-group-10");
    if(!decodedToken){
        return res.status(400).send({status:false,msg:"token is invalid"})
    } 
    req.decodedToken=decodedToken; 
    next(); 
  } catch (error) { 
    return res.status(500).send({ status: false, msg:error.message });
  }
};

const authorizationMid = async function (req, res, next) {
try{
  let blogId=req.params.blogId;
  let authId=await blogModel.findById({_id:blogId});
  let author=authId.authorId;
   let tokenAuth = req.decodedToken.authorId;


  if(tokenAuth!=author){
    return res.status(403).send({
      status: false,
      msg: "Author logged in is not allowed to modify the requested Author data",
    });
    }
  next();
}
catch(error){
  return res.status(500).send({ status: false, msg: error.message });
}
};



module.exports = { authenticationMid,authorizationMid };

