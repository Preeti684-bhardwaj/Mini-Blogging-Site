const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");
const validator=require('validator')
const {isValid, isValidEmail, isValidRequest} = require("../validators/validator");

const isValidTitle=function(title){
  return ["Mr","Mrs","Miss"].includes(title)
}
// ===============================CreateAuthor=====================================================================================================

const createAuthor = async (req, res)=>{
  try {

    const requestBody=req.body;
    if(!isValidRequest(requestBody)){
      return res.status(400).send({status:false,message:"Please provide author details"})
    }
    // using destructing for request body
    const {fname,lname,title,email,password}= req.body;

    if(!fname){
      return res.status(400).send({status:false,message:"First name is required"})
    }

    if(!lname){
      return res.status(400).send({status:false,message:"Last name is required"})     
    }
    if(!title){
     return res.status(400).send({status:false,message:'Title is required'})
    }
    if (!isValidTitle(title)) {
        return res.status(400).send({ status: false, msg: "Title should contain Mr, Mrs, Miss" });
    }

    if(!email){
      return res.status(400).send({status:false,message:"Email is required"})
    }
    if(!validator.isEmail(email)){
      return res.status(400).send({status:false,message:"Enter a valid email address"})
    }

    if(!isValid(password)){
      res.status(400).send({status:false,message:"Password is required"})
    }
    const duplicateEmail = await authorModel.findOne({email:email})
    if(duplicateEmail) return res.status(400).send({status:false,message:`${email} is already exist`})

    const author = await authorModel.create(req.body);
    res.status(201).send({ status: true,message:"Author registered successfully", data: author });
  } 
  catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};
// ========================== Login Author====================================================================

const loginAuthor = async (req, res) =>{
  try{
    const requestBody=req.body;
    if(!isValidRequest(requestBody)){
      return res.status(400).send({status:false,message:"Please provide author details"})
    }

  let { email, password } = req.body;

  if(!isValid(email)){
    return res.status(400).send({status:false,message:"Email is required"})
  }
  if(!isValidEmail(email)){
    return res.status(400).send({status:false,message:"Enter a valid email address"})
  }

  if(!isValid(password)){
    res.status(400).send({status:false,message:"Password is required"})
  }

  let emailAuthor = await authorModel.findOne({ email: email});
  if (!emailAuthor)
    return res.status(401).send({ status: false, msg: "Email is not registered" });

  let passAuthor = await authorModel.findOne({ email: email,password: password });
  if (!passAuthor)
    return res.status(401).send({status: false,msg: "Email is registered but Password is not correct"});

  let token = await  jwt.sign({ authorId: emailAuthor._id }, "blogging-group-10");
  res.setHeader("x-api-key", token);
  res.status(200).send({ status: true,message:"Author login successfull", data: { token: token } });
    }
    catch(err){
      res.status(500).send({status:false,error:err.message})
    }
};

module.exports = { createAuthor, loginAuthor };
