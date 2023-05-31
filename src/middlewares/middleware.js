
const authorModel = require('../models/authorModel');
const blogModel = require('../models/blogModel');

  const uniqueEmail=async function(req,res,next){
    try {
      const uEmail = req.body.email;
      let checkEmail = await authorModel.findOne({ email: uEmail });
      if (checkEmail) {
        return res.status(401).send({status:false,msg:"emailId already exist"});
      }
      next();
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  }

const validAuthor = async function (req, res, next) {
  try {
    let authId = req.body.authorId;
    if (authId) {
      if (authId.length !== 24) {
        return res.status(400).send({ status: false, msg: "Provide a valid author ID" });
      }
      let validAuthor = await authorModel.findById({ _id: authId });
      if (!validAuthor) {
        return res.status(404).send({ status: false, msg: "Author does not exist" });
      }
      next();
    } else {
      const data = req.body;
      let authId = req.decodedToken.authorId;
      if (!authId) {
        // Handle the case where req.decodedToken.authorId is undefined
        // You can choose to handle it based on your specific requirements
        // For example, you can set a default authorId or return an error message
        return res.status(400).send({ status: false, msg: "Author ID is missing" });
      }
      data["authorId"] = authId;
      const blog = await blogModel.create(data);
      return res.status(201).send({ status: true, data: blog });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
}



const validBlogId = async function (req, res, next) {
    try {
      let id = req.params.blogId;
      if (id.length !== 24) {
        return res
          .status(400)
          .send({ status: false, msg: "provide valid blog ID" });
      }
      let validBlog = await blogModel.findById({ _id:id});
      if (!validBlog) {
        return res.status(404).send({ status: false, msg: "invalid blog ID" });
      }
       let validBlog1 = await blogModel.findOne({ _id: id, isDeleted: false });
      if (!validBlog1) {
        return res
          .status(404)
          .send({ status: false, msg: "Blog is already deleted" });
      }
      next();
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
};

const validPassword = (req, res, next) => {
  try {
    let password = req.body.password;
    for (let i = 0; i < password.length; i++) {
      if (password[i] == " ")
        return res.status(400).send({status: false,msg: "provide valid password (password does not contain SPACE)"});
    }
    next();
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};



module.exports = {validAuthor,validBlogId,uniqueEmail,validPassword};