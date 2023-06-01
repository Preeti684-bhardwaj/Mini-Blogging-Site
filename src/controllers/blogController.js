const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId
const blogModel = require("../models/blogModel");
const moment = require("moment");
 
const isValidObjectId=function(objectId){
  return mongoose.Types.ObjectId.isValid(objectId)
}
const createBlog = async function (req, res) {
  try {
    const { title, body, authorId, category, isPublished } = req.body;
    if (!title) {
      return res.status(400).send({ status: false, message: "Blog title is not present" });
    }

    if (!body) {
      return res.status(400).send({ status: false, message: "Body body is not present" });
    }

    if(!isValid(authorId)){
     return res.status(400).send({status:false,message:"Author Id is required"})
    }

    if(!isValidObjectId(authorId)){
     return res.status(400).send({status:false,message:`${authorId} is not a valid authorId`})

    }

    if (!category) {
      return res.status(400).send({ status: false, message: "category is not present" });
    }

    const data = req.body;
    const authdata = data.authorId;
    let authId = req.decodedToken.authorId;
    if (authdata != authId) {
      return res
        .status(404)
        .send({ status: false, msg: "not a valid author to create a blog" });
      //   if isDeleted true in database or we are passing different attributes in query params
    }
    data.tags = data.tags.filter(tag => tag.trim() !== '');
    data.subcategory = data.subcategory.filter(subcat => subcat.trim() !== '');


    const blog = await blogModel.create(data);
    res.status(201).send({ status: true, data: blog });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};


const getBlogData = async (req, res) => {
  try {
    let query = req.query;
    
    query.isDeleted = false;
    query.isPublished = true;
    query.deletedAt=null;

    const { authorId, category, tags, subcategory } = queryParams;

    if (!isValid(authorId)) {
      return res
        .status(400)
        .send({ status: false, message: "Author id is required" });
    }
    if (authorId) {
      if (!isValidObjectId(authorId)) {
        return res.status(400).send({
          status: false,
          message: `authorId is not valid.`,
        });
      }
    }

    if (!isValid(category)) {
      return res.status(400).send({
        status: false,
        message: "Category cannot be empty while fetching.",
      });
    }

    if (!isValid(tags)) {
      return res.status(400).send({
        status: false,
        message: "tags cannot be empty while fetching.",
      });
    }
    // console.log(tags)
    // console.log(subcategory)

    if (!isValid(subcategory)) {
      return res.status(400).send({
        status: false,
        message: "subcategory cannot be empty while fetching.",
      });
    }

    let doc = await blogModel.find(query);
    if (doc.length == 0) {
      return res.status(404).send({ status: false, msg: "Document not found" });
    }
    res.status(200).send({ status: true, msg: doc });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updatedBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const { title, body, tags, subcategory } = req.body;

    let updateContent = {
      title: title,
      body: body,
      $push: { tags: tags, subcategory: subcategory },
      isPublished: true,
      publishedAt: `${moment()}`,
    };
    let reqBody = req.body;
    reqBody.tags = reqBody.tags.filter(tag => tag.trim() !== '');
    reqBody.subcategory = reqBody.subcategory.filter(subcat => subcat.trim() !== '');

    // Update the blog fields
    const updateBlog = await blogModel.findOneAndUpdate(
      { _id: blogId, isDeleted: false },
      updateContent,
      { new: true }
    );

    if (!updateBlog)
      return res
        .status(404)
        .send({ status: false, msg: "No such data present" });

    let tagSet = new Set([...updateBlog.tags]);
    let subSet = new Set([...updateBlog.subcategory]);
    updateBlog.tags = Array.from(tagSet);
    updateBlog.subcategory = Array.from(subSet);
    let pushData = await blogModel.findOneAndUpdate(
      { _id: blogId },
      updateBlog
    );

    // Return the updated blog document in the response
    res
      .status(200)
      .send({
        status: true,
        message: "Blog updated successfully",
        data: updateBlog,
      });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const deleteBlogByPathParam = async (req, res) => {
  try {
    let bId = req.params.blogId;
    let blogData = await blogModel.findOne({ _id: bId, isDeleted: false });

    if (!blogData)
      return res.status(404).send({ status: false, msg: "Document not found" });

    let deletedBlog = await blogModel.findOneAndUpdate(
      { _id: bId },
      { isDeleted: true, deletedAt: `${moment()}` }
    );
    res.status(200).send({ status: true, message: "" });
  } catch (err) {
    res.status(500).send({ status: false, Error: err.message });
  }
};

const deleteBlogByQueryParam = async (req, res) => {
  try {
    let filterData = req.query;
    let authId = req.decodedToken.authorId;
    if (filterData["authorId"] != authId && filterData["authorId"])
      return res
        .status(404)
        .send({
          status: false,
          msg: "Filter AuthorID is not matched with login Author",
        });

    filterData["authorId"] = authId;
    let existData = await blogModel.findOne(filterData);

    if (!existData) {
      return res
        .status(404)
        .send({ status: false, msg: "Blog not Found of login Author" });
      //   if isDeleted true in database or we are passing different attributes in query params
    }
    if (existData.isDeleted)
      return res
        .status(400)
        .send({ status: false, msg: "Blog is already deleted" });

    let deletedBlog = await blogModel.updateMany(
      filterData,
      { isDeleted: true, deletedAt: `${moment()}` },
      { new: true }
    );

    res.status(200).send({ status: true, message: "" });
  } catch (err) {
    res.status(500).send({ status: false, ErrorMsg: err.message });
  }
};

module.exports = {
  createBlog,
  getBlogData,
  updatedBlog,
  deleteBlogByPathParam,
  deleteBlogByQueryParam,
};
