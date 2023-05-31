const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");
const {isValid, isValidEmail, isValidRequest} = require("../validators/validator");


// ===============================CreateAuthor=====================================================================================================

const createAuthor = async (req, res)=>{
  try {

    const requestBody=req.body;
    if(!isValidRequest(requestBody)){
      return res.status(400).send({status:false,message:"Please provide author details"})
    }
    // using destructing for request body
    const {fname,lname,title,email,password}= req.body;

    // request body should not have more than 5 keys as per authorSchema (edge Case handled)

    if (Object.keys(requestBody).length > 5) {
      return res.status(400).send({ status: false, message: "Invalid data entry inside request body" })
  }

    if(!isValid(fname)){
      return res.status(400).send({status:false,message:"First name is required"})
    }

    if(!isValid(lname)){
      return res.status(400).send({status:false,message:"Last name is required"})     
    }
    if(!isValid(title)){
     return res.status(400).send({status:false,message:'Title is required'})
    }
    if (!["Mr", "Mrs", "Miss"].includes(title)) {
        return res.status(400).send({ status: false, msg: "Title should contain Mr, Mrs, Miss" });
    }

    if(!isValid(email)){
      return res.status(400).send({status:false,message:"Email is required"})
    }
    if(!isValidEmail(email)){
      return res.status(400).send({status:false,message:"Enter a valid email address"})
    }

    if(!isValid(password)){
      res.status(400).send({status:false,message:"Password is required"})
    }

    const data={fname:fname,lname:lname,title:title,email:email,password:password}
    const author = await authorModel.create(data);
    res.status(201).send({ status: true,message:"Author registered successfully", data: author });
  } 
  catch (error) {
    console.log(error)
    res.status(500).send({ status: false, msg: error.message });
  }
};
// ========================== Login Author====================================================================

const loginAuthor = async (req, res) =>{
  try{
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
    return res.status(400).send({ status: false, msg: "Email is not registered" });

  let passAuthor = await authorModel.findOne({ email: email,password: password });
  if (!passAuthor)
    return res.status(400).send({status: false,msg: "Email is registered but Password is not correct"});

  let token = jwt.sign({ authorId: emailAuthor._id }, "blogging-group-10");
  res.setHeader("x-api-key", token);
  res.status(200).send({ status: true, data: { token: token } });
    }
    catch(err){
      res.status(500).send({status:false,error:err.message})
    }
};

module.exports = { createAuthor, loginAuthor };
