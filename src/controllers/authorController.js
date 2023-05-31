const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");

function checkName(name){
  const paragraph = name;
  const regex = "^[A-Za-z][a-z]{1,30}$";
  const check = paragraph.match(regex);
  return check;
}
const createAuthor = async (req, res)=>{
  try {
    const {fname,lname,title,email,password}= req.body;
    let check=checkName(fname)
    if(!check){
      return res.status(400).send({status:false,msg:"first name should contains only letter"})
    }
     check = checkName(lname);
    if (!check) {
      return res.status(400).send({status:false,msg:"last name should contains only letter"});
    }
    if (!["Mr", "Mrs", "Miss"].includes(title)) {
      return res.status(400).send({ status: false, msg: "Invalid title" });
    }
    const data={fname:fname,lname:lname,title:title,email:email,password:password}
    const author = await authorModel.create(data);
    res.status(201).send({ status: true, data: author });
  } 
  catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

const loginAuthor = async (req, res) =>{
  try{
  let { email, password } = req.body;

  if (!email) {
    return res.status(400).send({status:false,msg:"email is required"});
  }
  if (!password) {
    return res.status(400).send({status:false,msg:"password is required"});
  }

  let emailAuthor = await authorModel.findOne({ email: email});
  if (!emailAuthor)
    return res
      .status(404)
      .send({ status: false, msg: "Email is not registered" });

  let passAuthor = await authorModel.findOne({ email: email,password: password });
  if (!passAuthor)
    return res
      .status(404)
      .send({
        status: false,
        msg: "Email is registered but Password is not correct",
      });

  let token = jwt.sign({ authorId: emailAuthor._id }, "blogging-group-10");
  res.setHeader("x-api-key", token);
  res.status(200).send({ status: true, data: { token: token } });
    }
    catch(err){
      res.status(500).send({status:false,error:err.message})
    }
};

module.exports = { createAuthor, loginAuthor };
